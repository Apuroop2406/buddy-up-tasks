import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

async function sendPushNotification(
  subscription: PushSubscription,
  payload: { title: string; body: string; icon?: string; tag?: string }
) {
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

  // Import web-push compatible library for Deno
  const webPush = await import("https://esm.sh/web-push@3.6.7");

  webPush.setVapidDetails(
    'mailto:noreply@deadlinefriend.app',
    vapidPublicKey,
    vapidPrivateKey
  );

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  await webPush.sendNotification(pushSubscription, JSON.stringify(payload));
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find tasks with deadlines in the next hour that haven't had reminders sent
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const { data: upcomingTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, user_id, title, description, deadline')
      .eq('status', 'pending')
      .eq('reminder_sent', false)
      .gte('deadline', now)
      .lte('deadline', oneHourFromNow);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw tasksError;
    }

    console.log(`Found ${upcomingTasks?.length || 0} tasks needing reminders`);

    const results = [];

    for (const task of upcomingTasks || []) {
      // Get user's push subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', task.user_id);

      if (subError) {
        console.error('Error fetching subscriptions:', subError);
        continue;
      }

      // Calculate time remaining
      const deadline = new Date(task.deadline);
      const minutesLeft = Math.round((deadline.getTime() - Date.now()) / (1000 * 60));

      // Send notification to each subscription
      for (const subscription of subscriptions || []) {
        try {
          await sendPushNotification(subscription, {
            title: '⏰ Deadline Approaching!',
            body: `"${task.title}" is due in ${minutesLeft} minutes. Don't forget to complete it!`,
            icon: '/favicon.ico',
            tag: `deadline-${task.id}`,
          });
          console.log(`Sent reminder for task ${task.id}`);
        } catch (pushError) {
          console.error(`Failed to send push for task ${task.id}:`, pushError);
          
          // If subscription is invalid, remove it
          if ((pushError as Error).message?.includes('410') || 
              (pushError as Error).message?.includes('expired')) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subscription.endpoint);
          }
        }
      }

      // Mark reminder as sent
      await supabase
        .from('tasks')
        .update({ reminder_sent: true })
        .eq('id', task.id);

      results.push({ taskId: task.id, success: true });
    }

    return new Response(
      JSON.stringify({ success: true, reminders: results.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-deadline-reminder:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
