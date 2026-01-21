import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Flame, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FocusWarningModalProps {
  isOpen: boolean;
  focusBreaks: number;
  penaltyPoints: number;
  onDismiss: () => void;
}

const FocusWarningModal: React.FC<FocusWarningModalProps> = ({
  isOpen,
  focusBreaks,
  penaltyPoints,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30 rounded-3xl p-6 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-red-500 rounded-full flex items-center justify-center"
            >
              <AlertTriangle className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold text-amber-400 mb-2">
              Focus Break Detected!
            </h2>
            
            <p className="text-muted-foreground mb-6">
              You left the app while your device was locked. Stay focused to avoid penalties!
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background/50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ArrowLeft className="w-4 h-4 text-amber-400" />
                  <span className="text-2xl font-bold text-amber-400">{focusBreaks}</span>
                </div>
                <p className="text-xs text-muted-foreground">Focus Breaks</p>
              </div>
              
              <div className="bg-background/50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-2xl font-bold text-red-400">-{penaltyPoints}</span>
                </div>
                <p className="text-xs text-muted-foreground">Points Lost</p>
              </div>
            </div>

            {focusBreaks >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 mb-4 p-3 bg-red-500/20 rounded-xl border border-red-500/30"
              >
                <Flame className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Streak Lost!</span>
              </motion.div>
            )}

            <Button
              onClick={onDismiss}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
            >
              I'll Stay Focused
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FocusWarningModal;
