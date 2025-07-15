
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LayoutDashboard, Send, Info, Briefcase } from 'lucide-react'; // Removed SettingsIcon
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const LandingHeader = ({ scrollToSection }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClasses = "text-sm font-medium transition-colors hover:text-slate-100";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 50, duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-900 bg-opacity-80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" onClick={() => scrollToSection ? scrollToSection('hero') : navigate('/')} className="flex items-center text-2xl font-bold text-slate-100 hover:text-slate-300 transition-colors">
          MARK <span className="ml-2">ONE</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-slate-300">
          <button onClick={() => scrollToSection('about')} className={`${navLinkClasses}`}>
            <Info className="inline-block mr-1 h-4 w-4" /> Sobre
          </button>
          <button onClick={() => scrollToSection('solutions')} className={`${navLinkClasses}`}>
            <Briefcase className="inline-block mr-1 h-4 w-4" /> Soluções
          </button>
          <button onClick={() => scrollToSection('contact')} className={`${navLinkClasses}`}>
            <Send className="inline-block mr-1 h-4 w-4" /> Contato
          </button>
        </nav>

        <div className="flex items-center space-x-3">
          {!loading && (
            user ? (
              <Button variant="outline" onClick={() => navigate('/sensors')} className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-slate-900 text-xs px-3 py-1.5 md:text-sm md:px-4 md:py-2">
                <LayoutDashboard className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                Sensores
              </Button>
            ) : (
              <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs px-3 py-1.5 md:text-sm md:px-4 md:py-2 rounded-full">
                <LogIn className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                Login
              </Button>
            )
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default LandingHeader;
