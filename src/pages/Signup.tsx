import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Let\'s get productive 💪');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground">Start your productivity journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-foreground font-medium flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field mt-2" placeholder="John Doe" required />
          </div>
          <div>
            <Label htmlFor="email" className="text-foreground font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field mt-2" placeholder="you@example.com" required />
          </div>
          <div>
            <Label htmlFor="password" className="text-foreground font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password
            </Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field mt-2" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="btn-primary w-full py-6" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
