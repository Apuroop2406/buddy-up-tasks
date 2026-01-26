import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import InstallPrompt from '@/components/InstallPrompt';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/25 to-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <Header variant="auth" />

      {/* Install Prompt */}
      <InstallPrompt />

      <div className="relative px-4 py-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg relative"
            >
              <span className="text-4xl">🎯</span>
              <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-lg -z-10" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue your streak 🔥</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elevated p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-foreground font-semibold flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-primary" /> Email
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
                  <Lock className="w-4 h-4 text-primary" /> Password
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
              </div>
              <Button type="submit" className="btn-primary w-full py-6 text-lg font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-muted-foreground mt-8"
          >
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Sign up free
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
