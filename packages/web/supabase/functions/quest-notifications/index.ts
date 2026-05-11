import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface NotificationPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    quest_id: string
    user_id: string
    notification_type: 'overdue' | 'reminder' | 'due_soon'
    message: string
    sent_at: string
  }
  schema: string
}

Deno.serve(async (req) => {
  try {
    const payload: NotificationPayload = await req.json()

    if (payload.table !== 'quest_notifications' || payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Ignored' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const notification = payload.record

    const { data: profile } = await supabase
      .from('profiles')
      .select('expo_push_token, fcm_token')
      .eq('id', notification.user_id)
      .single()

    if (!profile) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    const notificationTitle = getNotificationTitle(notification.notification_type)
    
    if (profile.expo_push_token) {
      await sendExpoPushNotification(profile.expo_push_token, notificationTitle, notification.message)
    }

    if (profile.fcm_token) {
      await sendFCMPushNotification(profile.fcm_token, notificationTitle, notification.message)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing notification:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'overdue':
      return '⚠️ Misión Atrasada'
    case 'due_soon':
      return '⏰ Misión Próxima'
    case 'reminder':
      return '🔔 Recordatorio de Misión'
    default:
      return '📋 Nueva Notificación'
  }
}

async function sendExpoPushNotification(token: string, title: string, body: string) {
  const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN')
  
  if (!expoAccessToken) {
    console.warn('EXPO_ACCESS_TOKEN not configured')
    return
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${expoAccessToken}`,
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title,
        body,
        priority: 'high',
        data: { type: 'quest_notification' },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Expo push notification error:', error)
    }
  } catch (error) {
    console.error('Error sending Expo push notification:', error)
  }
}

async function sendFCMPushNotification(token: string, title: string, body: string) {
  const fcmServerKey = Deno.env.get('FCM_SERVER_KEY')
  
  if (!fcmServerKey) {
    console.warn('FCM_SERVER_KEY not configured')
    return
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${fcmServerKey}`,
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title,
          body,
          sound: 'default',
        },
        data: {
          type: 'quest_notification',
        },
        priority: 'high',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('FCM push notification error:', error)
    }
  } catch (error) {
    console.error('Error sending FCM push notification:', error)
  }
}

