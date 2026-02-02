import React from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationToggleProps {
  variant?: 'default' | 'compact';
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ variant = 'default' }) => {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant={isSubscribed ? 'default' : 'outline'}
        size="icon"
        onClick={handleToggle}
        disabled={isLoading || permission === 'denied'}
        className="relative"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSubscribed ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isSubscribed ? 'bg-primary/20' : 'bg-muted'}`}>
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">Deadline Reminders</p>
          <p className="text-sm text-muted-foreground">
            {permission === 'denied'
              ? 'Notifications blocked in browser'
              : isSubscribed
              ? 'Get alerts 1 hour before deadlines'
              : 'Enable to get reminders'}
          </p>
        </div>
      </div>
      <Button
        variant={isSubscribed ? 'destructive' : 'default'}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading || permission === 'denied'}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSubscribed ? (
          'Disable'
        ) : (
          'Enable'
        )}
      </Button>
    </div>
  );
};

export default NotificationToggle;
