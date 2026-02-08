import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertData {
  user_id: string
  type: 'certificate_expiry' | 'temperature' | 'overdue_task' | 'inspection'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  related_id?: string
}

async function createAlertIfNotExists(alert: AlertData) {
  // Check if similar alert already exists (not acknowledged) in the last 24 hours
  const yesterday = new Date()
  yesterday.setHours(yesterday.getHours() - 24)

  const { data: existingAlert } = await supabase
    .from('alerts')
    .select('id')
    .eq('user_id', alert.user_id)
    .eq('type', alert.type)
    .eq('title', alert.title)
    .eq('acknowledged', false)
    .gte('created_at', yesterday.toISOString())
    .maybeSingle()

  if (existingAlert) {
    console.log('Alert already exists:', alert.title)
    return null
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert(alert)
    .select()
    .single()

  if (error) {
    console.error('Error creating alert:', error)
    return null
  }

  console.log('Created alert:', data.id, alert.title)
  return data
}

async function checkExpiringCertificates(userId: string) {
  const alerts: AlertData[] = []
  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  // Get employees with certificates
  const { data: employees } = await supabase
    .from('employees')
    .select('id, name')
    .eq('user_id', userId)

  if (!employees) return alerts

  for (const employee of employees) {
    const { data: certificates } = await supabase
      .from('certificates')
      .select('*')
      .eq('employee_id', employee.id)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])

    if (!certificates) continue

    for (const cert of certificates) {
      const expiryDate = new Date(cert.expiry_date)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
      if (daysUntilExpiry <= 0) severity = 'critical'
      else if (daysUntilExpiry <= 7) severity = 'high'
      else if (daysUntilExpiry <= 14) severity = 'medium'

      alerts.push({
        user_id: userId,
        type: 'certificate_expiry',
        severity,
        title: daysUntilExpiry <= 0
          ? `${cert.name} certificate expired`
          : `${cert.name} certificate expiring soon`,
        message: daysUntilExpiry <= 0
          ? `${employee.name}'s ${cert.name} certificate expired on ${cert.expiry_date}. Please renew immediately.`
          : `${employee.name}'s ${cert.name} certificate expires in ${daysUntilExpiry} days (${cert.expiry_date}).`,
        related_id: cert.id,
      })
    }
  }

  return alerts
}

async function checkMissingChecklists(userId: string) {
  const alerts: AlertData[] = []
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentHour = now.getUTCHours()

  // Check for missing opening checklist (after 11 AM local time - approximate by checking after 10 UTC)
  if (currentHour >= 10) {
    const { data: openingChecklist } = await supabase
      .from('checklists')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'opening')
      .eq('date', today)
      .eq('signed_off', true)
      .maybeSingle()

    if (!openingChecklist) {
      alerts.push({
        user_id: userId,
        type: 'overdue_task',
        severity: 'high',
        title: 'Opening checklist not completed',
        message: `The opening checklist for ${today} has not been signed off. Please complete it as soon as possible.`,
      })
    }
  }

  // Check for missing closing checklist from yesterday (after 9 AM)
  if (currentHour >= 9) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const { data: closingChecklist } = await supabase
      .from('checklists')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'closing')
      .eq('date', yesterdayStr)
      .eq('signed_off', true)
      .maybeSingle()

    if (!closingChecklist) {
      alerts.push({
        user_id: userId,
        type: 'overdue_task',
        severity: 'medium',
        title: 'Closing checklist not completed',
        message: `The closing checklist for ${yesterdayStr} was not signed off. Please review and complete it.`,
      })
    }
  }

  return alerts
}

async function checkMissingCleaningRecords(userId: string) {
  const alerts: AlertData[] = []
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentHour = now.getUTCHours()

  // Only check after 6 PM (18:00 UTC approximately)
  if (currentHour >= 18) {
    const { data: dailyCleaning } = await supabase
      .from('cleaning_records')
      .select('id')
      .eq('user_id', userId)
      .eq('frequency', 'daily')
      .eq('date', today)
      .eq('signed_off', true)
      .maybeSingle()

    if (!dailyCleaning) {
      alerts.push({
        user_id: userId,
        type: 'overdue_task',
        severity: 'medium',
        title: 'Daily cleaning not completed',
        message: `The daily cleaning tasks for ${today} have not been signed off. Please complete before end of day.`,
      })
    }
  }

  return alerts
}

async function checkNonCompliantTemperatures(userId: string) {
  const alerts: AlertData[] = []
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // Get non-compliant temperature logs from today
  const { data: nonCompliantLogs } = await supabase
    .from('temperature_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .eq('is_compliant', false)

  if (nonCompliantLogs && nonCompliantLogs.length > 0) {
    for (const log of nonCompliantLogs) {
      alerts.push({
        user_id: userId,
        type: 'temperature',
        severity: 'critical',
        title: `Temperature out of range: ${log.appliance_name}`,
        message: `${log.appliance_name} recorded ${log.temperature}°C at ${log.time} on ${log.date}. This is outside the safe range. Corrective action may be required.`,
        related_id: log.id,
      })
    }
  }

  return alerts
}

async function checkMissingTemperatureLogs(userId: string) {
  const alerts: AlertData[] = []
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentHour = now.getUTCHours()

  // Only check after 2 PM (14:00 UTC)
  if (currentHour < 14) return alerts

  // Get appliances that should have temperature logs
  const { data: appliances } = await supabase
    .from('appliances')
    .select('id, name, type')
    .eq('user_id', userId)
    .in('type', ['fridge', 'freezer', 'hot_hold'])

  if (!appliances || appliances.length === 0) return alerts

  for (const appliance of appliances) {
    const { data: logs } = await supabase
      .from('temperature_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('appliance_id', appliance.id)
      .eq('date', today)

    if (!logs || logs.length === 0) {
      alerts.push({
        user_id: userId,
        type: 'overdue_task',
        severity: 'high',
        title: `No temperature log for ${appliance.name}`,
        message: `No temperature has been recorded for ${appliance.name} today (${today}). Temperature checks should be done at least twice daily.`,
        related_id: appliance.id,
      })
    }
  }

  return alerts
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting alert generation...')

    // Get all active users (users with profiles)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`)
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users found', alertsCreated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalAlertsCreated = 0

    for (const profile of profiles) {
      console.log('Processing user:', profile.id)

      // Gather all alerts for this user
      const [
        certAlerts,
        checklistAlerts,
        cleaningAlerts,
        tempAlerts,
        missingTempAlerts,
      ] = await Promise.all([
        checkExpiringCertificates(profile.id),
        checkMissingChecklists(profile.id),
        checkMissingCleaningRecords(profile.id),
        checkNonCompliantTemperatures(profile.id),
        checkMissingTemperatureLogs(profile.id),
      ])

      const allAlerts = [
        ...certAlerts,
        ...checklistAlerts,
        ...cleaningAlerts,
        ...tempAlerts,
        ...missingTempAlerts,
      ]

      console.log(`Found ${allAlerts.length} potential alerts for user ${profile.id}`)

      // Create alerts
      for (const alert of allAlerts) {
        const created = await createAlertIfNotExists(alert)
        if (created) totalAlertsCreated++
      }
    }

    console.log(`Alert generation complete. Created ${totalAlertsCreated} new alerts.`)

    return new Response(
      JSON.stringify({
        message: 'Alert generation complete',
        alertsCreated: totalAlertsCreated,
        usersProcessed: profiles.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating alerts:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
