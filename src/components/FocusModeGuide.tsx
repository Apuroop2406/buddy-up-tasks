import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Moon, 
  Bell, 
  BellOff, 
  CheckCircle2, 
  X,
  Apple,
  Smartphone as AndroidIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FocusModeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const FocusModeGuide: React.FC<FocusModeGuideProps> = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'unknown'>('unknown');
  const [hasSeenGuide, setHasSeenGuide] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    }

    // Check if user has seen the guide
    const seen = localStorage.getItem('focusModeGuideSeen');
    setHasSeenGuide(!!seen);
  }, []);

  const handleDontShowAgain = () => {
    localStorage.setItem('focusModeGuideSeen', 'true');
    onClose();
  };

  const iosSteps = [
    { icon: <Moon className="w-5 h-5" />, text: 'Open Settings → Focus' },
    { icon: <Bell className="w-5 h-5" />, text: 'Tap "Do Not Disturb" or create custom Focus' },
    { icon: <BellOff className="w-5 h-5" />, text: 'Allow only StudyLock notifications' },
    { icon: <CheckCircle2 className="w-5 h-5" />, text: 'Enable "Share Across Devices" for sync' },
  ];

  const androidSteps = [
    { icon: <Moon className="w-5 h-5" />, text: 'Open Settings → Digital Wellbeing' },
    { icon: <Smartphone className="w-5 h-5" />, text: 'Tap "Focus mode"' },
    { icon: <BellOff className="w-5 h-5" />, text: 'Select distracting apps to pause' },
    { icon: <CheckCircle2 className="w-5 h-5" />, text: 'Set a schedule or turn on manually' },
  ];

  const steps = platform === 'ios' ? iosSteps : androidSteps;

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
            className="w-full max-w-sm bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Enable Focus Mode</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-muted-foreground text-sm mb-6">
              For the best experience, enable your device's built-in Focus/DND mode to block distracting apps.
            </p>

            {/* Platform Selector */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={platform === 'ios' ? 'default' : 'outline'}
                onClick={() => setPlatform('ios')}
                className="flex-1 gap-2"
              >
                <Apple className="w-4 h-4" />
                iOS
              </Button>
              <Button
                variant={platform === 'android' ? 'default' : 'outline'}
                onClick={() => setPlatform('android')}
                className="flex-1 gap-2"
              >
                <AndroidIcon className="w-4 h-4" />
                Android
              </Button>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                    <p className="text-sm font-medium text-foreground">{step.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-4 mb-6 border border-emerald-500/30">
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">💡 Pro Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Set Focus mode to activate automatically during study hours</li>
                <li>• Allow only StudyLock & essential apps</li>
                <li>• Use app limits for social media</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold"
              >
                Got it!
              </Button>
              {!hasSeenGuide && (
                <Button
                  variant="ghost"
                  onClick={handleDontShowAgain}
                  className="text-muted-foreground text-sm"
                >
                  Don't show again
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FocusModeGuide;
