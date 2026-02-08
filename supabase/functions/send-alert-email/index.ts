import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'EKProCook <alerts@ekprocook.com>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertEmailRequest {
  to: string
  subject: string
  alertType: 'certificate_expiry' | 'temperature' | 'overdue_task' | 'inspection'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  businessName?: string
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#dc2626'
    case 'high': return '#ea580c'
    case 'medium': return '#ca8a04'
    default: return '#2563eb'
  }
}

function getSeverityLabel(severity: string): string {
  switch (severity) {
    case 'critical': return 'CRITICAL'
    case 'high': return 'HIGH PRIORITY'
    case 'medium': return 'MEDIUM PRIORITY'
    default: return 'LOW PRIORITY'
  }
}

function getAlertIcon(type: string): string {
  switch (type) {
    case 'certificate_expiry': return '📜'
    case 'temperature': return '🌡️'
    case 'overdue_task': return '⏰'
    case 'inspection': return '🔍'
    default: return '⚠️'
  }
}

function generateEmailHtml(data: AlertEmailRequest): string {
  const color = getSeverityColor(data.severity)
  const label = getSeverityLabel(data.severity)
  const icon = getAlertIcon(data.alertType)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${color}; padding: 24px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center;">
                    <span style="font-size: 32px;">${icon}</span>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 12px;">
                    <span style="display: inline-block; background-color: rgba(255,255,255,0.2); color: #ffffff; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${label}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #111827;">
                ${data.title}
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                ${data.message}
              </p>

              ${data.businessName ? `
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">
                <strong>Business:</strong> ${data.businessName}
              </p>
              ` : ''}

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius: 8px; background-color: #2563eb;">
                    <a href="https://app.ekprocook.com" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      Open EKProCook App
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tips Section -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; padding: 16px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">
                      What to do next:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #6b7280; line-height: 1.6;">
                      ${data.alertType === 'temperature' ? `
                        <li>Check the appliance immediately</li>
                        <li>Move food to a working unit if needed</li>
                        <li>Document any corrective action taken</li>
                      ` : data.alertType === 'certificate_expiry' ? `
                        <li>Contact the employee about renewal</li>
                        <li>Schedule training/renewal if needed</li>
                        <li>Update records once renewed</li>
                      ` : data.alertType === 'overdue_task' ? `
                        <li>Complete the task as soon as possible</li>
                        <li>Document any reasons for delay</li>
                        <li>Sign off in the app when done</li>
                      ` : `
                        <li>Review the alert in the app</li>
                        <li>Take appropriate action</li>
                        <li>Document any changes made</li>
                      `}
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                This alert was sent by EKProCook
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                To manage your notification settings, visit the app settings.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const data: AlertEmailRequest = await req.json()

    if (!data.to || !data.subject || !data.title || !data.message) {
      throw new Error('Missing required fields: to, subject, title, message')
    }

    console.log('Sending alert email to:', data.to)

    const emailHtml = generateEmailHtml(data)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [data.to],
        subject: data.subject,
        html: emailHtml,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', result)
      throw new Error(result.message || 'Failed to send email')
    }

    console.log('Email sent successfully:', result.id)

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
