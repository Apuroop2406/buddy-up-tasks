import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if prompt was dismissed before
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    const shouldShowPrompt = daysSinceDismissed > 7;

    // Listen for beforeinstallprompt (must be set up immediately)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after capturing the event (if not recently dismissed)
      if (shouldShowPrompt) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS or if no beforeinstallprompt, show after delay
    if (iOS && shouldShowPrompt) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    // For Android/Chrome - also trigger after delay if event doesn't fire
    if (!iOS && shouldShowPrompt) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <div className="card-elevated p-6 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-xl" />

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-secondary/50 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="relative">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
                >
                  <Smartphone className="w-8 h-8 text-primary-foreground" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground text-center mb-2">
                  📲 Install the App!
                </h3>
                <p className="text-muted-foreground text-center text-sm mb-5">
                  Add Deadline Friend to your home screen for the best experience with offline access and instant loading.
                </p>

                {/* Install instructions based on platform */}
                {isIOS ? (
                  <div className="space-y-3">
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <p className="text-sm text-foreground font-medium mb-3">
                        To install on iPhone/iPad:
                      </p>
                      <ol className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</span>
                          Tap the <Share className="w-4 h-4 inline mx-1" /> Share button
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</span>
                          Scroll and tap <Plus className="w-4 h-4 inline mx-1" /> "Add to Home Screen"
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">3</span>
                          Tap "Add" to install
                        </li>
                      </ol>
                    </div>
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      className="w-full py-5"
                    >
                      Got it!
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deferredPrompt ? (
                      <Button
                        onClick={handleInstall}
                        className="btn-accent w-full py-6 text-lg font-bold"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Install Now
                      </Button>
                    ) : (
                      <div className="bg-secondary/50 rounded-xl p-4">
                        <p className="text-sm text-foreground font-medium mb-3">
                          To install on Android:
                        </p>
                        <ol className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</span>
                            Tap the browser menu (⋮)
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</span>
                            Tap "Install app" or "Add to Home Screen"
                          </li>
                        </ol>
                      </div>
                    )}
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      className="w-full text-muted-foreground"
                    >
                      Maybe later
                    </Button>
                  </div>
                )}

                {/* Features */}
                <div className="flex justify-center gap-6 mt-5 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg">⚡</div>
                    <div className="text-xs text-muted-foreground">Fast</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg">📴</div>
                    <div className="text-xs text-muted-foreground">Offline</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg">🔔</div>
                    <div className="text-xs text-muted-foreground">Alerts</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;