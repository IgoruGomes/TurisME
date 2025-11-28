import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Buscar ou criar perfil do usuário
    const getProfile = useCallback(async (user) => {
        if (!user) return null;

        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (error) {
                console.error("Error getting profile:", error);
                return null;
            }

            if (data) return data;

            // Criar perfil se não existir
            const { data: newProfile, error: insertError } = await supabase
                .from("user_profiles")
                .insert({
                    id: user.id,
                    email: user.email,
                    full_name:
                        user.user_metadata?.full_name ||
                        user.email?.split("@")[0],
                    avatar_url: user.user_metadata?.avatar_url || null,
                })
                .select()
                .single();

            if (insertError) {
                console.error("Error creating profile:", insertError);
                return null;
            }

            return newProfile;
        } catch (e) {
            console.error("Exception when fetching/creating profile:", e);
            return null;
        }
    }, []);

    // Carregar sessão ao iniciar o app
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                    setProfile(await getProfile(session.user));
                }
            } catch (error) {
                console.error("Error fetching session:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();

        // Listener de mudança de autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const currentUser = session?.user || null;
                setUser(currentUser);

                if (currentUser) {
                    setProfile(await getProfile(currentUser));
                } else {
                    setProfile(null);
                }

                setLoading(false);
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [getProfile]);

    /**
     * LOGIN EMAIL + SENHA
     */
    const signInWithEmail = (email, password) =>
        supabase.auth.signInWithPassword({ email, password });

    /**
     * CADASTRO EMAIL + SENHA
     */
    const signUpWithEmail = (email, password, metadata) =>
        supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata?.data || {},
            },
        });

    /**
     * LOGIN GOOGLE / GITHUB / ETC
     */
    const signInWithOAuth = (provider) =>
        supabase.auth.signInWithOAuth({ provider });

    /**
     * LOGOUT
     */
    const signOut = () => supabase.auth.signOut();

    const value = {
        user,
        profile,
        loading,
        signIn: signInWithEmail,
        signUp: signUpWithEmail,
        signInWithOAuth,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
