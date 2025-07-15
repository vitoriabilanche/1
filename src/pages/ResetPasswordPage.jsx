import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Primeiro, verificar se há tokens na URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        console.log('URL params:', { accessToken, refreshToken, type });

        if (accessToken && type === 'recovery') {
          // Para recovery, só precisamos do access_token
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: accessToken,
            type: 'recovery'
          });
          
          if (error) {
            console.error('Verify OTP error:', error);
            throw error;
          }
          
          console.log('OTP verified successfully:', data);
          setIsValidToken(true);
        } else if (accessToken && refreshToken) {
          // Fallback para outros casos
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (!sessionError) {
            setIsValidToken(true);
          } else {
            throw sessionError;
          }
        } else {
          // Verificar se já há uma sessão ativa
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session && !error) {
            setIsValidToken(true);
          } else {
            throw new Error('Token de recuperação inválido ou expirado');
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
        toast({
          title: 'Link inválido',
          description: 'O link de recuperação é inválido ou expirou. Solicite um novo.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/forgot-password'), 3000);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkSession();
  }, [searchParams, navigate, toast, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'As senhas digitadas não são iguais.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Senha redefinida!',
        description: 'Sua senha foi alterada com sucesso.',
      });

      // Aguardar um pouco e redirecionar para o login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      toast({
        title: 'Erro ao redefinir senha',
        description: error.message || 'Não foi possível alterar a senha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Verificando link de recuperação...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black p-4">
        <Card className="shadow-2xl bg-slate-800 bg-opacity-70 backdrop-blur-md border-slate-700 text-slate-100 max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-400">Link Inválido</CardTitle>
            <CardDescription className="text-slate-400">
              O link de recuperação é inválido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-300 mb-4">
              Você será redirecionado para solicitar um novo link.
            </p>
            <Button 
              onClick={() => navigate('/forgot-password')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              Solicitar Novo Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Lock className="mx-auto h-12 w-12 text-cyan-400 mb-4" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
            <CardDescription className="text-slate-400">
              Digite sua nova senha abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 pr-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 pr-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                <p>• A senha deve ter pelo menos 6 caracteres</p>
                <p>• Use uma combinação de letras, números e símbolos</p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white" 
                disabled={isLoading}
              >
                {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;