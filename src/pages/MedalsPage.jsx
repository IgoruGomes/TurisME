
import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, Star, User as UserIcon } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const MedalsPage = () => {
    const { user } = useAuth();
    const [ranking, setRanking] = useState([]);
    const [currentUserStats, setCurrentUserStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchRankingData = useCallback(async () => {
        setLoading(true);
        try {
            // Buscamos todos os tours com os dados do perfil do usuário
            const { data: toursData, error: toursError } = await supabase
                .from('user_tours')
                .select(`
                    points,
                    tour_type,
                    user_profiles ( id, full_name )
                `);

            if (toursError) {
                console.error("Error fetching ranking data:", toursError);
                throw toursError;
            }

            // Agrupamos os dados por usuário
            const userStatsMap = new Map();

            toursData.forEach(tour => {
                if (!tour.user_profiles) return; // Pula tours sem perfil associado

                const userId = tour.user_profiles.id;
                const userName = tour.user_profiles.full_name || 'Usuário Anônimo';

                if (!userStatsMap.has(userId)) {
                    userStatsMap.set(userId, {
                        userId,
                        name: userName,
                        totalPoints: 0,
                        medals: { gold: 0, silver: 0, bronze: 0 },
                    });
                }

                const stats = userStatsMap.get(userId);
                stats.totalPoints += tour.points;
                if (tour.tour_type === 'gold') stats.medals.gold += 1;
                if (tour.tour_type === 'silver') stats.medals.silver += 1;
                if (tour.tour_type === 'bronze') stats.medals.bronze += 1;
            });
            
            const userStats = Array.from(userStatsMap.values());

            // Ordenamos por pontos
            const sortedRanking = userStats.sort((a, b) => b.totalPoints - a.totalPoints);
            setRanking(sortedRanking.slice(0, 100));

            // Encontramos os dados do usuário atual
            if (user) {
                const currentUserData = sortedRanking.find(u => u.userId === user.id);
                if (currentUserData) {
                    const currentUserRank = sortedRanking.findIndex(u => u.userId === user.id) + 1;
                    setCurrentUserStats({ ...currentUserData, rank: currentUserRank });
                } else {
                    // if user is not in ranking, maybe they have 0 points
                    const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();
                    if (profile) {
                         setCurrentUserStats({
                            userId: user.id,
                            name: profile.full_name || 'Usuário Anônimo',
                            totalPoints: 0,
                            medals: { gold: 0, silver: 0, bronze: 0 },
                            rank: sortedRanking.length + 1
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error processing ranking data:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if(user){
            fetchRankingData();
        }
    }, [user, fetchRankingData]);

    return (
        <>
            <Helmet>
                <title>Medalhas e Ranking - TurisME</title>
                <meta name="description" content="Veja o ranking de exploradores e suas medalhas no TurisME." />
            </Helmet>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 pb-24">
                <header className="bg-white/80 backdrop-blur-lg shadow-sm p-6">
                    <h1 className="text-3xl font-bold text-gray-800 text-center">Quadro de Medalhas</h1>
                </header>
                <main className="max-w-4xl mx-auto p-4 sm:p-6">
                    {loading ? (
                        <div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            {ranking.map((player, index) => (
                                <motion.div
                                    key={player.userId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center p-4 bg-white rounded-xl shadow-md border-l-4 ${
                                        index === 0 ? 'border-yellow-400' :
                                        index === 1 ? 'border-gray-400' :
                                        index === 2 ? 'border-amber-600' :
                                        'border-gray-200'
                                    } ${player.userId === user?.id ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    <span className="text-xl font-bold text-gray-600 w-10">{index + 1}</span>
                                    <div className="flex-grow mx-4">
                                        <p className="font-semibold text-gray-800">{player.name}</p>
                                        <div className="flex items-center gap-1 text-sm text-yellow-500">
                                            <Star className="w-4 h-4 fill-current"/>
                                            <span>{player.totalPoints} pontos</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 text-sm">
                                        <div className="flex items-center gap-1 text-yellow-400"><Award className="w-5 h-5 fill-current"/>{player.medals.gold}</div>
                                        <div className="flex items-center gap-1 text-gray-400"><Award className="w-5 h-5 fill-current"/>{player.medals.silver}</div>
                                        <div className="flex items-center gap-1 text-amber-600"><Award className="w-5 h-5 fill-current"/>{player.medals.bronze}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </main>
            </div>
            {currentUserStats && (
                <div className="fixed bottom-24 left-0 right-0 p-4 z-20">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-4 flex items-center gap-4 border-t-4 border-blue-500">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"><UserIcon className="w-8 h-8 text-gray-500"/></div>
                        <div className="flex-grow">
                            <p className="font-bold text-lg">{currentUserStats.name}</p>
                            <p className="text-sm text-gray-600">Sua Posição: <span className="font-bold text-blue-600">#{currentUserStats.rank > 100 ? '-' : currentUserStats.rank}</span></p>
                        </div>
                        <div className="text-right">
                             <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                <Star className="w-5 h-5 fill-current"/>
                                <span>{currentUserStats.totalPoints}</span>
                            </div>
                            <div className="flex gap-2 text-xs mt-1">
                                <span className="flex items-center gap-0.5 text-yellow-500"><Award className="w-4 h-4"/>{currentUserStats.medals.gold}</span>
                                <span className="flex items-center gap-0.5 text-gray-500"><Award className="w-4 h-4"/>{currentUserStats.medals.silver}</span>
                                <span className="flex items-center gap-0.5 text-amber-700"><Award className="w-4 h-4"/>{currentUserStats.medals.bronze}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <BottomNav activeTab="medals" />
        </>
    );
};

export default MedalsPage;
