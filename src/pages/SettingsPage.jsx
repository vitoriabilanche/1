import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const SettingsPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-slate-800';
  const textColor = theme === 'light' ? 'text-gray-700' : 'text-gray-200';
  const descriptionColor = theme === 'light' ? 'text-gray-500' : 'text-gray-400';

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setDisplayName(data.display_name || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const checkIfAdmin = async () => {
      if (user?.email === 'admin@example.com') {
        setIsAdmin(true);
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setMessages(data);
        }
      }
    };

    if (user) {
      fetchUserProfile();
      checkIfAdmin();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          user_id: user.id,
          display_name: displayName,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Seu nome de exibição foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className={cn("text-3xl font-bold", textColor)}>Configurações</h1>
      
      <Card className={cn(cardBg, "shadow-lg")}>
        <CardHeader>
          <CardTitle className={textColor}>Perfil do Usuário</CardTitle>
          <CardDescription className={descriptionColor}>
            Atualize suas informações pessoais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Nome de Exibição</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
              className="max-w-md"
            />
          </div>
          <Button 
            onClick={handleUpdateProfile} 
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardContent>
      </Card>

      <Card className={cn(cardBg, "shadow-lg")}>
        <CardHeader>
          <CardTitle className={textColor}>Preferências de Tema</CardTitle>
          <CardDescription className={descriptionColor}>
            Personalize a aparência do seu dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className={cn(cardBg, "shadow-lg")}>
          <CardHeader>
            <CardTitle className={textColor}>Mensagens de Contato</CardTitle>
            <CardDescription className={descriptionColor}>
              Visualize as mensagens enviadas através do formulário de contato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("p-4 border rounded-lg", theme === 'light' ? 'border-gray-200' : 'border-gray-700')}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={cn("font-semibold", textColor)}>{message.name}</h3>
                      <p className={descriptionColor}>{message.email}</p>
                    </div>
                    <span className={cn("text-sm", descriptionColor)}>
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={cn("mt-2", textColor)}>{message.message}</p>
                  <div className="mt-2">
                    <span className={cn(
                      "text-sm px-2 py-1 rounded",
                      message.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    )}>
                      {message.status}
                    </span>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className={descriptionColor}>Nenhuma mensagem recebida ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default SettingsPage;