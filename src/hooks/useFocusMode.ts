import { useEffect, useRef, useState, useCallback } from 'react';
import { App } from '@capacitor/app';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FocusModeState {
  isLocked: boolean;
  focusBreaks: number;
  lastBreakTime: Date | null;
  penaltyPoints: number;
  showWarning: boolean;
}

export const useFocusMode = (hasOverdueTasks: boolean) => {
  const { user } = useAuth();
  const [state, setState] = useState<FocusModeState>({
    isLocked: false,
    focusBreaks: 0,
    lastBreakTime: null,
    penaltyPoints: 0,
    showWarning: false,
  });
  
  const lockStartTime = useRef<Date | null>(null);
  const warningTimeout = useRef<NodeJS.Timeout | null>(null);

  // Track when user leaves/returns to app
  const handleAppStateChange = useCallback(async (isActive: boolean) => {
    if (!hasOverdueTasks) return;

    if (!isActive && hasOverdueTasks) {
      // User left the app while locked
      lockStartTime.current = new Date();
      
      setState(prev => ({
        ...prev,
        focusBreaks: prev.focusBreaks + 1,
        lastBreakTime: new Date(),
        showWarning: false,
      }));

      // Apply penalty after 5 seconds of being away
      warningTimeout.current = setTimeout(async () => {
        const penalty = 5; // 5 points penalty per break
        
        setState(prev => ({
          ...prev,
          penaltyPoints: prev.penaltyPoints + penalty,
        }));

        // Update profile with penalty (reduce reliability score)
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('reliability_score, streak_count')
            .eq('user_id', user.id)
            .single();

          if (profile) {
            const newScore = Math.max(0, (profile.reliability_score || 100) - 2);
            await supabase
              .from('profiles')
              .update({ 
                reliability_score: newScore,
                // Break streak if too many focus breaks
                streak_count: state.focusBreaks >= 3 ? 0 : profile.streak_count
              })
              .eq('user_id', user.id);
          }
        }
      }, 5000);

    } else if (isActive && lockStartTime.current) {
      // User returned to app
      const awayDuration = Date.now() - lockStartTime.current.getTime();
      lockStartTime.current = null;

      if (warningTimeout.current) {
        clearTimeout(warningTimeout.current);
      }

      if (awayDuration > 3000) {
        // Show warning if away for more than 3 seconds
        setState(prev => ({ ...prev, showWarning: true }));
        
        toast.warning('Focus Break Detected!', {
          description: `You left the app for ${Math.round(awayDuration / 1000)}s. Complete your task to avoid penalties!`,
          duration: 5000,
        });
      }
    }
  }, [hasOverdueTasks, user, state.focusBreaks]);

  // Set up Capacitor App listener for native
  useEffect(() => {
    let listener: any = null;

    const setupListener = async () => {
      try {
        listener = await App.addListener('appStateChange', ({ isActive }) => {
          handleAppStateChange(isActive);
        });
      } catch (e) {
        // Fallback for web - use visibility API
        const handleVisibility = () => {
          handleAppStateChange(!document.hidden);
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
      }
    };

    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
      if (warningTimeout.current) {
        clearTimeout(warningTimeout.current);
      }
    };
  }, [handleAppStateChange]);

  // Update locked state based on overdue tasks
  useEffect(() => {
    setState(prev => ({ ...prev, isLocked: hasOverdueTasks }));
  }, [hasOverdueTasks]);

  const dismissWarning = useCallback(() => {
    setState(prev => ({ ...prev, showWarning: false }));
  }, []);

  const resetFocusSession = useCallback(() => {
    setState({
      isLocked: false,
      focusBreaks: 0,
      lastBreakTime: null,
      penaltyPoints: 0,
      showWarning: false,
    });
  }, []);

  return {
    ...state,
    dismissWarning,
    resetFocusSession,
  };
};
