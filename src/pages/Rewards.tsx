import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star, Flame, Target, Medal } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';

const badges = [
  { id: 1, name: 'First Step', icon: '🎯', points: 10, desc: 'Complete your first task' },
  { id: 2, name: 'Week Warrior', icon: '🔥', points: 70, desc: '7 tasks in a row' },
  { id: 3, name: 'Reliable', icon: '⭐', points: 100, desc: '90%+ reliability score' },
  { id: 4, name: 'Streak Master', icon: '🏆', points: 300, desc: '30-day streak' },
  { id: 5, name: 'Productivity Pro', icon: '💪', points: 500, desc: 'Complete 50 tasks' },
];

const Rewards: React.FC = () => {
  const { profile } = useProfile();
  const { completedTasks } = useTasks();
  const totalPoints = completedTasks.reduce((sum, t) => sum + t.points_earned, 0);

  return (
    <div className="min-h-screen px-4 py-6 pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Rewards</h1>

        <div className="card-elevated p-6 mb-6 text-center">
          <Trophy className="w-12 h-12 text-accent mx-auto mb-3" />
          <div className="text-4xl font-bold text-foreground">{totalPoints}</div>
          <p className="text-muted-foreground">Total Points Earned</p>
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-4">Badges</h2>
        <div className="grid gap-4">
          {badges.map((badge, i) => {
            const isUnlocked = totalPoints >= badge.points;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`card-elevated p-4 flex items-center gap-4 ${!isUnlocked && 'opacity-60'}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${isUnlocked ? 'bg-accent/20' : 'bg-muted'}`}>
                  {isUnlocked ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground">{badge.desc}</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${isUnlocked ? 'text-success' : 'text-muted-foreground'}`}>
                    {isUnlocked ? '✓ Unlocked' : `${badge.points} pts`}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default Rewards;
