import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTasks, TaskType } from '@/hooks/useTasks';
import { toast } from 'sonner';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const taskTypes: { value: TaskType; label: string; icon: string }[] = [
  { value: 'assignment', label: 'Assignment', icon: '📝' },
  { value: 'exam_prep', label: 'Exam Prep', icon: '📚' },
  { value: 'project', label: 'Project', icon: '🎯' },
  { value: 'personal', label: 'Personal', icon: '✨' },
];

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('assignment');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const deadline = new Date(`${date}T${time}`).toISOString();
      await createTask.mutateAsync({
        title,
        description: description || undefined,
        task_type: taskType,
        deadline,
      });
      toast.success('Task created! Time to get productive 💪');
      onClose();
      setTitle('');
      setDescription('');
      setTaskType('assignment');
      setDate('');
      setTime('');
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-card rounded-2xl shadow-lg max-h-[85vh] overflow-y-auto pointer-events-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Create New Task</h2>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="title" className="text-foreground font-medium">
                      Task Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Complete Math Assignment"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-field mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-foreground font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Add any details about the task..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field mt-2 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground font-medium mb-3 block">
                      Task Type
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {taskTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setTaskType(type.value)}
                          className={`p-2.5 rounded-xl border-2 transition-all text-left ${
                            taskType === type.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <span className="text-lg">{type.icon}</span>
                          <span className="block mt-0.5 font-medium text-foreground text-sm">
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="date" className="text-foreground font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input-field mt-2"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time" className="text-foreground font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time *
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="input-field mt-2"
                      />
                    </div>
                  </div>

                  <div className="pt-2 pb-1">
                    <Button
                      type="submit"
                      className="btn-primary w-full text-base py-5"
                      disabled={isLoading}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {isLoading ? 'Creating...' : 'Create Task'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;
