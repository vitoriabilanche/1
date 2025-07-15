import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://marknone.netlify.app/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao enviar email',
        description: error.message || 'Não foi possível enviar o email de recuperação.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl bg-slate-800 bg-opacity-70 backdrop-blur-md border-slate-700 text-slate-100">
            <CardHeader className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
              </motion.div>
              <CardTitle className="text-2xl font-bold">Email Enviado!</CardTitle>
              <CardDescription className="text-slate-400">
                Enviamos um link de recuperação para seu email.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-300 mb-4">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </p>
              <p className="text-sm text-slate-400">
                Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => setEmailSent(false)}
              >
                Tentar outro email
              </Button>
              <Link to="/login" className="w-full">
                <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black p-4 relative">
      <Link to="/login" className="absolute top-6 left-6 text-slate-300 hover:text-white transition-colors z-10">
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
              <Mail className="mx-auto h-12 w-12 text-cyan-400 mb-4" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Esqueceu sua senha?</CardTitle>
            <CardDescription className="text-slate-400">
              Digite seu email para receber um link de recuperação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white" 
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm text-slate-400 w-full">
              Lembrou da senha?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Voltar ao Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;