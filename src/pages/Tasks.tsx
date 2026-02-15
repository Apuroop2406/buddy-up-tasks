import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import TaskCard from '@/components/TaskCard';
import CreateTaskModal from '@/components/CreateTaskModal';
import SubmitProofModal from '@/components/SubmitProofModal';
import { useTasks, TaskStatus } from '@/hooks/useTasks';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const Tasks: React.FC = () => {
  const { t } = useTranslation();
  const { tasks, deleteTask } = useTasks();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [proofTaskId, setProofTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  const statusFilters: { value: TaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('tasks.all') },
    { value: 'pending', label: t('tasks.pending') },
    { value: 'submitted', label: t('tasks.review') },
    { value: 'approved', label: t('tasks.done') },
  ];

  const filteredTasks = tasks?.filter(t => filter === 'all' || t.status === filter) || [];
  const selectedTask = tasks?.find(t => t.id === proofTaskId);

  const handleDelete = async (id: string) => {
    await deleteTask.mutateAsync(id);
    toast.success(t('tasks.taskDeleted'));
  };

  return (
    <div className="min-h-screen px-4 py-6 pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('tasks.title')}</h1>
          <Button onClick={() => setIsCreateOpen(true)} size="sm" className="btn-primary">
            <Plus className="w-4 h-4 mr-1" /> {t('tasks.new')}
          </Button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {statusFilters.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === s.value ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <span className="text-4xl mb-4 block">📋</span>
            <p className="text-muted-foreground">{t('tasks.noTasks')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} onSubmitProof={setProofTaskId} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </motion.div>
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
    </div>
  );
};

export default Tasks;
