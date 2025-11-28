
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Settings, Shield, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');

  const fetchProfile = useCallback(async () => {
    if (user) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() to avoid error if no row is found

      if (error) {
        console.error("Error fetching profile", error);
        toast({
          variant: "destructive",
          title: "Erro ao buscar perfil",
          description: "Não foi possível carregar seus dados.",
        });
      } else if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
      }
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProfile(data);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNotImplemented = () => {
    toast({
      variant: "destructive",
      title: "🚧 Em desenvolvimento",
      description: "Esta funcionalidade será implementada em breve! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Meu Perfil - TurisME</title>
        <meta name="description" content="Gerencie seu perfil e configurações no TurisME." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 pb-24">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Profile Header */}
            <div className="flex items-center gap-4 sm:gap-6 p-4 bg-white rounded-2xl shadow-lg mb-8">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{profile?.full_name || 'Usuário'}</h1>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Configurações da Conta</h2>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" id="email" value={user?.email || ''} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
                <Button type="submit" disabled={loading || !profile} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-800">Segurança</h2>
              </div>
              <div className="space-y-4">
                <Button onClick={handleNotImplemented} variant="outline" className="w-full justify-start text-left">Ativar Autenticação de 2 Fatores (2FA)</Button>
                <Button onClick={handleNotImplemented} variant="destructive" className="w-full justify-start text-left">Deletar Conta</Button>
              </div>
            </div>

            {/* Sign Out */}
            <Button onClick={handleSignOut} variant="ghost" className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700">
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </Button>
          </motion.div>
        </div>
      </div>
      <BottomNav activeTab="profile" />
    </>
  );
};

export default ProfilePage;
