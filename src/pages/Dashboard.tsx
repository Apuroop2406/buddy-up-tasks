import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import StatsCards from '@/components/StatsCards';
import TaskCard from '@/components/TaskCard';
import CreateTaskModal from '@/components/CreateTaskModal';
import SubmitProofModal from '@/components/SubmitProofModal';
import FocusModeGuide from '@/components/FocusModeGuide';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { profile } = useProfile();
  const { tasks, deleteTask } = useTasks();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [proofTaskId, setProofTaskId] = useState<string | null>(null);
  const [showFocusGuide, setShowFocusGuide] = useState(false);

  const upcomingTasks = tasks?.filter(t => t.status === 'pending' || t.status === 'submitted').slice(0, 3) || [];
  const selectedTask = tasks?.find(t => t.id === proofTaskId);

  const handleDelete = async (id: string) => {
    await deleteTask.mutateAsync(id);
    toast.success('Task deleted');
  };

  return (
    <>
      {/* Focus Mode Guide */}
      <FocusModeGuide
        isOpen={showFocusGuide}
        onClose={() => setShowFocusGuide(false)}
      />

      <div className="min-h-screen px-4 py-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted-foreground">Welcome back,</p>
              <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || 'Friend'} 👋</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFocusGuide(true)}
              className="gap-1"
            >
              <Shield className="w-4 h-4" />
              Focus
            </Button>
          </header>

          <StatsCards />

          <div className="flex items-center justify-between mt-8 mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Upcoming Tasks
            </h2>
            <Button onClick={() => setIsCreateOpen(true)} size="sm" className="btn-primary">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="card-elevated p-8 text-center">
              <span className="text-4xl mb-4 block">🎉</span>
              <p className="text-muted-foreground">No pending tasks! Create one to stay productive.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingTasks.map(task => (
                <TaskCard key={task.id} task={task} onSubmitProof={setProofTaskId} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav />
      <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <SubmitProofModal
        isOpen={!!proofTaskId}
        onClose={() => setProofTaskId(null)}
        taskId={proofTaskId}
        taskTitle={selectedTask?.title || ''}
        taskDescription={selectedTask?.description || undefined}
        taskType={selectedTask?.task_type}
      />
    </>
  );
};

export default Dashboard;
