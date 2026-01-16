import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Target, Trophy, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen px-4 py-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center pt-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary flex items-center justify-center shadow-lg"
        >
          <span className="text-4xl">🎯</span>
        </motion.div>

        <h1 className="text-4xl font-extrabold text-foreground mb-4">
          Deadline <span className="text-gradient">Friend</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Beat procrastination with peer accountability. Complete tasks, submit proof, unlock your screen.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {[
            { icon: Users, title: 'Peer Power', desc: 'Stay accountable together' },
            { icon: Target, title: 'Smart Goals', desc: 'Track every deadline' },
            { icon: Trophy, title: 'Earn Rewards', desc: 'Points & streaks' },
            { icon: Lock, title: 'Focus Lock', desc: 'Screen locks until done' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="card-elevated p-4 text-left"
            >
              <item.icon className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <Link to="/signup" className="block">
            <Button className="btn-primary w-full text-lg py-6">
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/login" className="block">
            <Button variant="ghost" className="w-full text-muted-foreground">
              Already have an account? Sign in
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Landing;
