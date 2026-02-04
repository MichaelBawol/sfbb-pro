import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

// Map Stripe price IDs to tiers
function getTierFromPriceId(priceId: string): 'starter' | 'professional' {
  // These should match your Stripe price IDs
  const starterPriceIds = [
    Deno.env.get('STRIPE_STARTER_PRICE_ID'),
    // Add test mode price IDs here
  ]

  if (starterPriceIds.includes(priceId)) {
    return 'starter'
  }
  return 'professional'
}

async function upsertSubscription(subscription: Stripe.Subscription, customerId: string) {
  const priceId = subscription.items.data[0]?.price.id
  const tier = getTierFromPriceId(priceId)

  // Get user_id from customer metadata or find by email
  let userId = subscription.metadata?.user_id

  if (!userId) {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    userId = customer.metadata?.user_id

    // If still no user_id, try to find by email
    if (!userId && customer.email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customer.email)
        .single()

      if (profile) {
        userId = profile.id
        // Update customer metadata for future reference
        await stripe.customers.update(customerId, {
          metadata: { user_id: userId }
        })
      }
    }
  }

  if (!userId) {
    console.error('No user_id found for subscription:', subscription.id)
    return
  }

  const subscriptionData = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    tier: tier,
    status: subscription.status,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'user_id',
    })

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }

  console.log('Subscription upserted:', subscription.id, 'for user:', userId)
}

async function deleteSubscription(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      tier: 'free',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating canceled subscription:', error)
    throw error
  }
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Received webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.subscription && session.customer) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await upsertSubscription(subscription, session.customer as string)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await upsertSubscription(subscription, subscription.customer as string)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await deleteSubscription(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          await upsertSubscription(subscription, invoice.customer as string)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', invoice.subscription)

          if (error) {
            console.error('Error updating subscription status:', error)
          }
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    )
  }
})
