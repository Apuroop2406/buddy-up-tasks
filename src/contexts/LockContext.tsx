import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/hooks/useTasks';

interface LockContextType {
  isLocked: boolean;
  lockingTask: Task | null;
  pendingTasks: Task[];
  unlockForProof: () => void;
  relockScreen: () => void;
  isSubmittingProof: boolean;
  setIsSubmittingProof: (value: boolean) => void;
  refreshTasks: () => Promise<void>;
}

const LockContext = createContext<LockContextType | undefined>(undefined);

export const LockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [isUnlockedForProof, setIsUnlockedForProof] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [, forceUpdate] = useState(0); // Force re-render for deadline checks
  const deadlineTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Fetch pending tasks
  const fetchPendingTasks = useCallback(async () => {
    if (!user?.id) {
      setPendingTasks([]);
      return;
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'rejected'])
      .order('deadline', { ascending: true });

    if (!error && data) {
      setPendingTasks(data as Task[]);
    }
  }, [user?.id]);

  // Set up timers for upcoming deadlines
  useEffect(() => {
    // Clear existing timers
    deadlineTimersRef.current.forEach(timer => clearTimeout(timer));
    deadlineTimersRef.current = [];

    if (pendingTasks.length === 0) return;

    const now = Date.now();

    pendingTasks.forEach(task => {
      const deadlineTime = new Date(task.deadline).getTime();
      const timeUntilDeadline = deadlineTime - now;

      // If deadline is in the future but within 24 hours, set a timer
      if (timeUntilDeadline > 0 && timeUntilDeadline < 24 * 60 * 60 * 1000) {
        const timer = setTimeout(() => {
          // Force a re-render when deadline passes
          forceUpdate(n => n + 1);
        }, timeUntilDeadline + 100); // Add 100ms buffer

        deadlineTimersRef.current.push(timer);
      }
    });

    // Also check every minute for any missed deadlines
    const intervalTimer = setInterval(() => {
      const hasOverdue = pendingTasks.some(task => 
        new Date(task.deadline).getTime() < Date.now()
      );
      if (hasOverdue) {
        forceUpdate(n => n + 1);
      }
    }, 60000); // Check every minute

    return () => {
      deadlineTimersRef.current.forEach(timer => clearTimeout(timer));
      clearInterval(intervalTimer);
    };
  }, [pendingTasks]);

  // Initial fetch and subscribe to changes
  useEffect(() => {
    fetchPendingTasks();

    if (!user?.id) return;

    // Subscribe to realtime changes
    const channel = supabase
      .channel('lock-tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchPendingTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchPendingTasks]);

  // Determine lock state - lock if any task has passed its deadline
  const now = Date.now();
  const overdueTasks = pendingTasks.filter(task => 
    new Date(task.deadline).getTime() <= now
  );
  
  const lockingTask = overdueTasks[0] || null;
  const isLocked = overdueTasks.length > 0 && !isUnlockedForProof && !isSubmittingProof;

  const unlockForProof = useCallback(() => {
    setIsUnlockedForProof(true);
  }, []);

  const relockScreen = useCallback(() => {
    setIsUnlockedForProof(false);
    setIsSubmittingProof(false);
  }, []);

  const refreshTasks = useCallback(async () => {
    await fetchPendingTasks();
  }, [fetchPendingTasks]);

  return (
    <LockContext.Provider
      value={{
        isLocked,
        lockingTask,
        pendingTasks: overdueTasks, // Only expose overdue tasks
        unlockForProof,
        relockScreen,
        isSubmittingProof,
        setIsSubmittingProof,
        refreshTasks,
      }}
    >
      {children}
    </LockContext.Provider>
  );
};

export const useLock = () => {
  const context = useContext(LockContext);
  if (context === undefined) {
    throw new Error('useLock must be used within a LockProvider');
  }
  return context;
};
