
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, MapPin, Award, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTour } from '@/contexts/TourContext';

const BottomNav = ({ activeTab }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { clearTour } = useTour();

    const handleTabClick = (tab) => {
        switch(tab) {
            case 'home':
                navigate('/home');
                break;
            case 'medals':
                navigate('/medals');
                break;
            case 'profile':
                navigate('/profile');
                break;
            case 'map': // Check-in button
                clearTour();
                navigate('/tour-setup');
                break;
            case 'ranking':
                toast({
                    variant: "destructive",
                    title: "🚧 Em desenvolvimento",
                    description: "Esta funcionalidade será implementada em breve! 🚀",
                });
                break;
            default:
                break;
        }
    };

    const navItems = [
        { id: 'home', icon: Home, label: 'Inicial' },
        { id: 'ranking', icon: TrendingUp, label: 'Ranking' },
        { id: 'map', icon: MapPin, label: 'Check-in' },
        { id: 'medals', icon: Award, label: 'Medalhas' },
        { id: 'profile', icon: User, label: 'Perfil' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t-lg border-t border-gray-200 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3">
                <div className="flex items-center justify-around">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        if (item.id === 'map') {
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabClick(item.id)}
                                    className="flex flex-col items-center -mt-8 transition transform hover:scale-110"
                                    aria-label={item.label}
                                >
                                    <div className="bg-blue-600 p-4 rounded-full shadow-2xl">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                </button>
                            );
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={`flex flex-col items-center gap-1 transition w-16 ${
                                    isActive ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'
                                }`}
                                aria-label={item.label}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default BottomNav;
