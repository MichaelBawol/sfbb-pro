import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { priceId, email, userId, successUrl, cancelUrl } = body

    console.log('Received request body:', JSON.stringify(body))
    console.log('successUrl:', successUrl)
    console.log('cancelUrl:', cancelUrl)

    if (!priceId) {
      throw new Error('Price ID is required')
    }

    // Compute final URLs
    const finalSuccessUrl = successUrl || `${req.headers.get('origin') || 'https://app.ekprocook.com'}/settings?session_id={CHECKOUT_SESSION_ID}`
    const finalCancelUrl = cancelUrl || `${req.headers.get('origin') || 'https://app.ekprocook.com'}/pricing`

    console.log('Final success_url:', finalSuccessUrl)
    console.log('Final cancel_url:', finalCancelUrl)
    console.log('Request origin header:', req.headers.get('origin'))

    // Validate URLs
    try {
      new URL(finalSuccessUrl)
    } catch (e) {
      throw new Error(`Invalid success_url: ${finalSuccessUrl}`)
    }
    try {
      new URL(finalCancelUrl)
    } catch (e) {
      throw new Error(`Invalid cancel_url: ${finalCancelUrl}`)
    }

    // Check if customer exists
    let customerId: string | undefined

    if (email) {
      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: email,
          metadata: {
            user_id: userId || '',
          },
        })
        customerId = customer.id
      }
    }

    // Create checkout session with 14-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          user_id: userId || '',
        },
      },
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        user_id: userId || '',
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    // Include param in error message for easier debugging
    const errorMessage = error.param
      ? `${error.message} (param: ${error.param})`
      : error.message
    return new Response(
      JSON.stringify({
        error: errorMessage,
        type: error.type,
        code: error.code,
        param: error.param
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
