
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, Mail, Lock, Chrome, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loginWithGoogle, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await login(email, password);
    if (error) {
      setIsLoading(false); 
      toast({
        title: 'Erro de Login',
        description: error.message || 'Falha ao fazer login. Verifique suas credenciais.',
        variant: 'destructive',
      });
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await loginWithGoogle();
    if (error) {
      setIsLoading(false);
      toast({
        title: 'Erro de Login com Google',
        description: error.message || 'Falha ao iniciar login com Google. Verifique a configuração no Supabase.',
        variant: 'destructive',
      });
    }
  };

  const formDisabled = authLoading || isLoading;

   if (user && !authLoading) {
     return <div className="flex justify-center items-center h-screen bg-slate-900 text-white">Redirecionando...</div>;
   }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black p-4 relative">
      <Link to="/" className="absolute top-6 left-6 text-slate-300 hover:text-white transition-colors z-10">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </Link>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl bg-slate-800 bg-opacity-70 backdrop-blur-md border-slate-700 text-slate-100">
          <CardHeader className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
              <LogIn className="mx-auto h-12 w-12 text-cyan-400 mb-4" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Bem-vindo!</CardTitle>
            <CardDescription className="text-slate-400">Faça login para acessar seu dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <div className="relative">
                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                   <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
                    disabled={formDisabled}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Senha</Label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
                      disabled={formDisabled}
                    />
                 </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white" disabled={formDisabled}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
           <CardFooter className="text-center text-sm text-slate-400">
              <div className="w-full space-y-2">
                <p>Faça login para continuar.</p>
                <Link to="/forgot-password" className="text-cyan-400 hover:text-cyan-300 font-medium block">
                  Esqueceu sua senha?
                </Link>
              </div>
           </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
