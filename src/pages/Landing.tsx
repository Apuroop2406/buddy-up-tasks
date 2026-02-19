import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Target, Trophy, Lock, Sparkles, Mail, MapPin, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import InstallPrompt from '@/components/InstallPrompt';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useTranslation } from 'react-i18next';

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const { canInstall, isIOS, isStandalone, install } = useInstallPrompt();

  const handleDownload = async () => {
    if (canInstall) {
      await install();
    } else if (isIOS) {
      alert('Tap the Share button in Safari, then tap "Add to Home Screen" to install.');
    } else {
      alert('Open your browser menu and tap "Install app" or "Add to Home Screen".');
    }
  };

  const features = [
    { icon: Users, title: t('landing.peerPower'), desc: t('landing.peerPowerDesc'), color: 'from-primary/10 to-primary/5' },
    { icon: Target, title: t('landing.smartGoals'), desc: t('landing.smartGoalsDesc'), color: 'from-accent/10 to-accent/5' },
    { icon: Trophy, title: t('landing.earnRewards'), desc: t('landing.earnRewardsDesc'), color: 'from-warning/10 to-warning/5' },
    { icon: Lock, title: t('landing.focusLock'), desc: t('landing.focusLockDesc'), color: 'from-destructive/10 to-destructive/5' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-accent/15 to-primary/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <Header variant="landing" />
      <InstallPrompt />

      <div className="relative px-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto text-center pt-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl relative"
          >
            <span className="text-5xl">⏰</span>
            <motion.div
              className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/30 -z-10 blur-xl"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent-foreground">{t('landing.tagline')}</span>
          </motion.div>

          <h1 className="text-5xl font-extrabold text-foreground mb-4 leading-tight">
            {t('landing.title')} <span className="text-gradient">{t('landing.titleHighlight')}</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-sm mx-auto">{t('landing.subtitle')}</p>

          <div id="features" className="grid grid-cols-2 gap-4 mb-10">
            {features.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="card-elevated p-5 text-left group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="space-y-4">
            <Link to="/signup" className="block">
              <Button className="btn-accent w-full text-lg py-7 font-bold">
                {t('landing.getStarted')} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            {!isStandalone && (
              <Button onClick={handleDownload} variant="outline" className="w-full text-lg py-7 font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Download className="w-5 h-5 mr-2" />
                {t('landing.downloadApp')}
              </Button>
            )}
            <Link to="/login" className="block">
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                {t('landing.alreadyAccount')} <span className="text-primary font-semibold ml-1">{t('landing.signIn')}</span>
              </Button>
            </Link>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-sm text-muted-foreground mt-8">
            🔥 {(t as any)('landing.joinCount', { count: '1,000' })}
          </motion.p>
        </motion.div>

        <motion.section id="about" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="max-w-lg mx-auto mt-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('landing.aboutTitle')}</h2>
          <p className="text-muted-foreground mb-6">{t('landing.aboutText')}</p>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1K+</div>
              <div className="text-xs text-muted-foreground">{t('landing.activeUsers')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">50K+</div>
              <div className="text-xs text-muted-foreground">{t('landing.tasksCompleted')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">95%</div>
              <div className="text-xs text-muted-foreground">{t('landing.successRate')}</div>
            </div>
          </div>
        </motion.section>

        <motion.section id="contact" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="max-w-lg mx-auto mt-16 mb-10">
          <div className="card-elevated p-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('landing.contactTitle')}</h2>
            <p className="text-muted-foreground mb-6">{t('landing.contactText')}</p>
            <div className="space-y-3">
              <a href="mailto:hello@deadlinefriend.app" className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">hello@deadlinefriend.app</span>
              </a>
              <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-secondary/30">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </motion.section>

        <footer className="max-w-lg mx-auto text-center pt-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-xs">⏰</span>
            </div>
            <span className="font-bold text-foreground">Deadline Buddy</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Deadline Buddy. {t('landing.footer')}</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
