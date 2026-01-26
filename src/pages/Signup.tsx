import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';

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
      toast.success("Account created! Let's get productive 💪");
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/25 to-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-gradient-to-l from-warning/15 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <Header variant="auth" />

      <div className="relative px-4 py-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg relative"
            >
              <span className="text-4xl">🚀</span>
              <div className="absolute -inset-1 rounded-2xl bg-accent/20 blur-lg -z-10" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Start your productivity journey today ✨</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elevated p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-foreground font-semibold flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-accent" /> Full Name
                </Label>
                <Input 
                  id="name" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="input-field" 
                  placeholder="John Doe" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground font-semibold flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-accent" /> Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="input-field" 
                  placeholder="you@example.com" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-foreground font-semibold flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-accent" /> Password
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="input-field" 
                  placeholder="••••••••" 
                  required 
                />
                <p className="text-xs text-muted-foreground mt-2">Minimum 6 characters</p>
              </div>
              <Button type="submit" className="btn-accent w-full py-6 text-lg font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8 space-y-2"
          >
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              By signing up, you agree to beat procrastination 💪
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
