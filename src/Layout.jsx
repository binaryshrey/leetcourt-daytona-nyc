import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Gavel, Library, Trophy, User, Sword } from "lucide-react";
import { api } from "@/api/apiClient";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    api.auth.me().then(setUser).catch(() => {});
  }, []);

  const navItems = [
    { name: "Battle Arena", path: createPageUrl("BattleArena"), icon: Sword },
    { name: "Case Library", path: createPageUrl("CaseLibrary"), icon: Library },
    { name: "Leaderboard", path: createPageUrl("Leaderboard"), icon: Trophy },
    { name: "Profile", path: createPageUrl("Profile"), icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#151a2e] to-[#0a0e27]">
      <style>{`
        :root {
          --gold: #d4af37;
          --gold-light: #f2c94c;
          --blue: #4a90e2;
          --blue-light: #60a5fa;
          --dark: #0a0e27;
          --dark-mid: #151a2e;
          --dark-light: #1a1f3a;
          --cream: #f5f5f5;
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
          50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.6); }
        }
        
        @keyframes pulse-gold {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .gavel-icon {
          animation: glow 3s ease-in-out infinite;
        }
        
        .gold-glow {
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
        }
      `}</style>

      {/* Navigation Bar */}
      <nav className="border-b border-[#d4af37]/20 bg-[#151a2e]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("BattleArena")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#f2c94c] rounded-lg flex items-center justify-center gavel-icon">
                <Gavel className="w-6 h-6 text-[#0a0e27]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f2c94c] bg-clip-text text-transparent">
                  LeetCourt
                </h1>
                <p className="text-xs text-gray-400 -mt-1">Master the Art of Argument</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-[#d4af37]/20 to-[#f2c94c]/20 text-[#f2c94c] border border-[#d4af37]/30"
                        : "text-gray-400 hover:text-[#f2c94c] hover:bg-[#1a1f3a]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-[#f5f5f5]">{user.full_name || user.email}</p>
                  <p className="text-xs text-[#d4af37]">Level 1 • 0 XP</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#4a90e2] to-[#60a5fa] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center justify-around mt-3 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                    isActive ? "text-[#f2c94c]" : "text-gray-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
}