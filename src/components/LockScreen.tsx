import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Upload, AlertTriangle, Clock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTasks';

interface LockScreenProps {
  pendingTask: Task;
  onSubmitProof: (taskId: string) => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ pendingTask, onSubmitProof }) => {
  const timeLeft = new Date(pendingTask.deadline).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
  const isOverdue = timeLeft < 0;

  return (
    <motion.div
      className="locked-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-md w-full mx-4 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/20 mb-8"
        >
          <Lock className="w-12 h-12 text-destructive" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-locked-foreground mb-4"
        >
          Screen Locked
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-locked-foreground/70 mb-8"
        >
          Complete your task and submit proof to unlock
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 mb-6 text-left"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-2 rounded-lg ${isOverdue ? 'bg-destructive/20' : 'bg-warning/20'}`}>
              {isOverdue ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : (
                <Clock className="w-5 h-5 text-warning" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{pendingTask.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {pendingTask.description || 'No description'}
              </p>
            </div>
          </div>

          <div className={`text-center py-3 rounded-lg ${isOverdue ? 'bg-destructive/10' : 'bg-warning/10'}`}>
            {isOverdue ? (
              <span className="text-destructive font-semibold">⚠️ Overdue!</span>
            ) : (
              <span className="text-warning font-semibold">
                ⏰ {hoursLeft}h {minutesLeft}m remaining
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => onSubmitProof(pendingTask.id)}
            className="btn-accent w-full text-lg py-6"
          >
            <Upload className="w-5 h-5 mr-2" />
            Submit Proof to Unlock
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl p-4 mt-6 text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="w-5 h-5 text-accent" />
            <span className="font-semibold text-locked-foreground text-sm">
              Device Locked
            </span>
          </div>
          <p className="text-locked-foreground/60 text-xs">
            Social media & games are restricted until this task is approved. 
            Submit valid proof to unlock your device features! 📱
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-locked-foreground/50 text-sm mt-4"
        >
          Your friend is counting on you! 👀
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LockScreen;
