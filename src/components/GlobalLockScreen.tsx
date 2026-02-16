import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Upload, AlertTriangle, Clock, Smartphone, ListTodo, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLock } from '@/contexts/LockContext';
import SubmitProofModal from './SubmitProofModal';

const GlobalLockScreen: React.FC = () => {
  const { isLocked, lockingTask, pendingTasks, setIsSubmittingProof, refreshTasks } = useLock();
  const [proofTaskId, setProofTaskId] = useState<string | null>(null);

  if (!isLocked || !lockingTask) return null;

  const timeLeft = new Date(lockingTask.deadline).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
  const isOverdue = timeLeft < 0;

  const handleSubmitProof = (taskId: string) => {
    setProofTaskId(taskId);
    setIsSubmittingProof(true);
  };

  const handleCloseModal = async () => {
    setProofTaskId(null);
    setIsSubmittingProof(false);
    await refreshTasks();
    // Stay on lock screen - don't navigate anywhere
    // The lock state will automatically clear if the task was approved
  };

  return (
    <>
      <AnimatePresence>
        {!proofTaskId && (
          <motion.div
            className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="max-w-md w-full text-center">
              {/* Lock Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 0.8 }}
                className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-destructive/20 mb-8 relative"
              >
                <Lock className="w-14 h-14 text-destructive" />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-destructive/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-foreground mb-2"
              >
                🔒 App Locked
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground mb-6"
              >
                Complete your pending task to unlock
              </motion.p>

              {/* Pending task count badge */}
              {pendingTasks.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-500 mb-6"
                >
                  <ListTodo className="w-4 h-4" />
                  <span className="text-sm font-medium">{pendingTasks.length} tasks pending</span>
                </motion.div>
              )}

              {/* Current Task Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card border border-border rounded-2xl p-5 mb-6 text-left shadow-lg"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${isOverdue ? 'bg-destructive/20' : 'bg-warning/20'}`}>
                    {isOverdue ? (
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    ) : (
                      <Clock className="w-6 h-6 text-warning" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">{lockingTask.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {lockingTask.description || 'No description'}
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                      {lockingTask.task_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className={`text-center py-3 rounded-xl ${isOverdue ? 'bg-destructive/10' : 'bg-warning/10'}`}>
                  {isOverdue ? (
                    <span className="text-destructive font-bold text-lg">⚠️ OVERDUE!</span>
                  ) : (
                    <span className="text-warning font-semibold">
                      ⏰ {hoursLeft}h {minutesLeft}m remaining
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => handleSubmitProof(lockingTask.id)}
                  className="btn-accent w-full text-lg py-7 font-bold"
                  size="lg"
                >
                  <Upload className="w-6 h-6 mr-2" />
                  Submit Proof to Unlock
                </Button>
              </motion.div>

              {/* Device Lock Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-muted/50 border border-border rounded-xl p-4 mt-6 text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground text-sm">Stay Focused</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  You cannot use the app until you complete this task. 
                  Submit valid proof that will be verified by AI! 🤖
                </p>
              </motion.div>

              {/* Motivation */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-muted-foreground text-sm mt-6"
              >
                You've got this! Complete your task and get back to productivity 💪
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proof Modal */}
      <SubmitProofModal
        isOpen={!!proofTaskId}
        onClose={handleCloseModal}
        taskId={proofTaskId}
        taskTitle={lockingTask?.title || ''}
        taskDescription={lockingTask?.description || undefined}
        taskType={lockingTask?.task_type}
      />
    </>
  );
};

export default GlobalLockScreen;
