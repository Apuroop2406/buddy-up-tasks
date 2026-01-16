import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, Trophy, TrendingUp } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';

const StatsCards: React.FC = () => {
  const { profile } = useProfile();
  const { completedTasks, pendingTasks } = useTasks();

  const stats = [
    {
      icon: Flame,
      label: 'Streak',
      value: profile?.streak_count || 0,
      suffix: 'days',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Target,
      label: 'Completed',
      value: completedTasks.length,
      suffix: 'tasks',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Trophy,
      label: 'Points',
      value: completedTasks.reduce((sum, t) => sum + t.points_earned, 0),
      suffix: 'pts',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: TrendingUp,
      label: 'Reliability',
      value: profile?.reliability_score ? Math.round(Number(profile.reliability_score) * 100) : 0,
      suffix: '%',
      color: 'text-secondary-foreground',
      bgColor: 'bg-secondary',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-2`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {stat.suffix}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsCards;
