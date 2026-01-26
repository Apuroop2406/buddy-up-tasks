import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Mail, HelpCircle, Info, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  variant?: 'landing' | 'auth';
}

const Header: React.FC<HeaderProps> = ({ variant = 'landing' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'About', href: '#about', icon: Info },
    { label: 'Features', href: '#features', icon: HelpCircle },
    { label: 'Contact', href: '#contact', icon: Mail },
  ];

  const isActive = (href: string) => location.hash === href;

  return (
    <header className="relative z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md"
            >
              <span className="text-xl">🎯</span>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-foreground leading-tight">
                Deadline<span className="text-gradient">Friend</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">
                Beat Procrastination
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                  ${isActive(link.href) 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </a>
            ))}
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {variant === 'landing' ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="gap-2 font-medium">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="btn-primary gap-2">
                    <UserPlus className="w-4 h-4" />
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2 font-medium">
                  ← Back to Home
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </a>
                ))}
                
                <div className="border-t border-border pt-3 mt-3 space-y-2">
                  {variant === 'landing' ? (
                    <>
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
                          <LogIn className="w-5 h-5" />
                          Sign In
                        </div>
                      </Link>
                      <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
                          <UserPlus className="w-5 h-5" />
                          Get Started Free
                        </div>
                      </Link>
                    </>
                  ) : (
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
                        ← Back to Home
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
