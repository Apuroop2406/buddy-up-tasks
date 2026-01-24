import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Determine lock state
  const lockingTask = pendingTasks[0] || null;
  const isLocked = pendingTasks.length > 0 && !isUnlockedForProof && !isSubmittingProof;

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
        pendingTasks,
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
