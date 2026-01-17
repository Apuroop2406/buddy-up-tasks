import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Target, Trophy, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-accent/15 to-primary/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative px-4 py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center pt-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl relative"
          >
            <span className="text-5xl">🎯</span>
            <motion.div
              className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/30 -z-10 blur-xl"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent-foreground">Beat Procrastination Today</span>
          </motion.div>

          <h1 className="text-5xl font-extrabold text-foreground mb-4 leading-tight">
            Deadline <span className="text-gradient">Friend</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-sm mx-auto">
            Beat procrastination with peer accountability. Complete tasks, submit proof, unlock your potential.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { icon: Users, title: 'Peer Power', desc: 'Stay accountable together', color: 'from-primary/10 to-primary/5' },
              { icon: Target, title: 'Smart Goals', desc: 'Track every deadline', color: 'from-accent/10 to-accent/5' },
              { icon: Trophy, title: 'Earn Rewards', desc: 'Points & streaks', color: 'from-warning/10 to-warning/5' },
              { icon: Lock, title: 'Focus Lock', desc: 'Screen locks until done', color: 'from-destructive/10 to-destructive/5' },
            ].map((item, i) => (
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <Link to="/signup" className="block">
              <Button className="btn-accent w-full text-lg py-7 font-bold">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login" className="block">
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                Already have an account? <span className="text-primary font-semibold ml-1">Sign in</span>
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-muted-foreground mt-8"
          >
            🔥 Join <span className="font-semibold text-foreground">1,000+</span> students crushing their goals
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
