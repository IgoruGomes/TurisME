
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const getProfile = useCallback(async (user) => {
        if (!user) return null;

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle(); // Use maybeSingle() to prevent error on 0 rows

            if (error) {
                console.error('Error getting profile:', error);
                return null;
            }
            
            if (data) {
                return data;
            } else {
                // Profile doesn't exist, create it
                console.log("Profile not found for user, creating one...");
                const { data: newProfile, error: insertError } = await supabase
                    .from('user_profiles')
                    .insert({ 
                        id: user.id, 
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                        avatar_url: user.user_metadata?.avatar_url
                    })
                    .select()
                    .single();
                
                if (insertError) {
                    console.error('Error creating profile:', insertError);
                    return null;
                }
                
                console.log("Profile created:", newProfile);
                return newProfile;
            }

        } catch (e) {
            console.error('Exception when fetching/creating profile', e);
            return null;
        }
    }, []);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    const userProfile = await getProfile(session.user);
                    setProfile(userProfile);
                }
            } catch (error) {
                console.error("Error fetching session:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user || null;
            setUser(currentUser);
            if (currentUser) {
                const userProfile = await getProfile(currentUser);
                setProfile(userProfile);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [getProfile]);

    const value = {
        user,
        profile,
        loading,
        signIn: (options) => supabase.auth.signInWithOAuth(options),
        signOut: () => supabase.auth.signOut(),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
