import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Save, Loader2, Flame, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { completedTasks } = useTasks();
  const navigate = useNavigate();
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({ username, full_name: fullName, bio });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const totalPoints = completedTasks.reduce((sum, t) => sum + t.points_earned, 0);

  return (
    <div className="min-h-screen px-4 py-6 pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

        <div className="card-elevated p-6 mb-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{fullName || 'Student'}</h2>
          <p className="text-muted-foreground text-sm">{user?.email}</p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <Flame className="w-6 h-6 text-accent mx-auto mb-1" />
              <div className="font-bold text-foreground">{profile?.streak_count || 0}</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
            <div className="text-center">
              <Target className="w-6 h-6 text-success mx-auto mb-1" />
              <div className="font-bold text-foreground">{completedTasks.length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-1" />
              <div className="font-bold text-foreground">{totalPoints}</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
          </div>
        </div>

        <div className="card-elevated p-6 space-y-5">
          <div>
            <Label className="text-foreground font-medium">Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} className="input-field mt-2" placeholder="@username" />
          </div>
          <div>
            <Label className="text-foreground font-medium">Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field mt-2" placeholder="Your name" />
          </div>
          <div>
            <Label className="text-foreground font-medium">Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field mt-2" placeholder="Tell us about yourself..." />
          </div>

          <Button onClick={handleSave} className="btn-primary w-full" disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>

          <Button variant="ghost" onClick={handleSignOut} className="w-full text-destructive hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default Profile;
