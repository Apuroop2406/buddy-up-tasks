import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertTriangle, Upload, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task, TaskStatus, TaskType } from '@/hooks/useTasks';
import { formatDistanceToNow, format, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onSubmitProof: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const taskTypeLabels: Record<TaskType, string> = {
  assignment: '📝 Assignment',
  exam_prep: '📚 Exam Prep',
  project: '🎯 Project',
  personal: '✨ Personal',
};

const statusConfig: Record<TaskStatus, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="w-4 h-4" />, color: 'bg-warning/10 text-warning', label: 'Pending' },
  submitted: { icon: <FileText className="w-4 h-4" />, color: 'bg-primary/10 text-primary', label: 'Under Review' },
  approved: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-success/10 text-success', label: 'Approved' },
  rejected: { icon: <XCircle className="w-4 h-4" />, color: 'bg-destructive/10 text-destructive', label: 'Rejected' },
  missed: { icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-destructive/10 text-destructive', label: 'Missed' },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onSubmitProof, onDelete }) => {
  const deadline = new Date(task.deadline);
  const isOverdue = isPast(deadline) && task.status === 'pending';
  const status = statusConfig[task.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-elevated p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {taskTypeLabels[task.task_type]}
            </Badge>
            <Badge className={`${status.color} border-0 text-xs`}>
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
          <h3 className="font-semibold text-foreground text-lg">{task.title}</h3>
          {task.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className={`flex items-center gap-2 text-sm mb-4 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
        <Clock className="w-4 h-4" />
        <span>
          {isOverdue ? 'Overdue: ' : 'Due: '}
          {format(deadline, 'MMM d, yyyy • h:mm a')}
        </span>
        {!isOverdue && task.status === 'pending' && (
          <span className="text-warning">
            ({formatDistanceToNow(deadline, { addSuffix: true })})
          </span>
        )}
      </div>

      {task.ai_feedback && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${task.status === 'approved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
          <strong>AI Feedback:</strong> {task.ai_feedback}
        </div>
      )}

      {task.points_earned > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <span className="font-semibold text-accent">+{task.points_earned} points earned!</span>
        </div>
      )}

      {(task.status === 'pending' || task.status === 'rejected') && (
        <Button
          onClick={() => onSubmitProof(task.id)}
          className="btn-primary w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {task.status === 'rejected' ? 'Resubmit Proof' : 'Submit Proof'}
        </Button>
      )}

      {task.status === 'submitted' && (
        <div className="text-center py-3 bg-primary/5 rounded-lg">
          <span className="text-primary text-sm font-medium">
            ⏳ AI is reviewing your submission...
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;
