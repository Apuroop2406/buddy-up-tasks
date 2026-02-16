import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type TaskType = 'assignment' | 'exam_prep' | 'project' | 'personal';
export type TaskStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'missed';

export interface Task {
  id: string;
  user_id: string;
  buddy_id: string | null;
  title: string;
  description: string | null;
  task_type: TaskType;
  deadline: string;
  status: TaskStatus;
  proof_url: string | null;
  proof_text: string | null;
  ai_verified: boolean;
  ai_feedback: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  points_earned: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  task_type: TaskType;
  deadline: string;
  buddy_id?: string;
}

export const useTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`)
        .order('deadline', { ascending: true });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user?.id,
  });

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!user?.id) throw new Error('No user');
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const submitProof = useMutation({
    mutationFn: async ({ taskId, proofUrl, proofText, proofHash }: { taskId: string; proofUrl?: string; proofText?: string; proofHash?: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          proof_url: proofUrl,
          proof_text: proofText,
          proof_hash: proofHash,
          status: 'submitted' as TaskStatus,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  // Calculate stats
  const pendingTasks = tasks?.filter(t => t.status === 'pending' || t.status === 'rejected') || [];
  const completedTasks = tasks?.filter(t => t.status === 'approved') || [];
  const missedTasks = tasks?.filter(t => t.status === 'missed') || [];
  const submittedTasks = tasks?.filter(t => t.status === 'submitted') || [];

  return { 
    tasks, 
    isLoading, 
    error, 
    createTask, 
    updateTask, 
    submitProof,
    deleteTask,
    pendingTasks,
    completedTasks,
    missedTasks,
    submittedTasks,
  };
};
