import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, Flame, Target, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { name: "First Victory", icon: Trophy, color: "#d4af37", requirement: 1 },
  { name: "Cross-Exam Master", icon: Target, color: "#4a90e2", requirement: 10 },
  { name: "Precedent Wizard", icon: Award, color: "#10b981", requirement: 5 },
  { name: "100 Objections", icon: Flame, color: "#f2c94c", requirement: 100 },
  { name: "7-Day Streak", icon: Calendar, color: "#a78bfa", requirement: 7 },
  { name: "Rising Star", icon: TrendingUp, color: "#60a5fa", requirement: 50 },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: battles = [] } = useQuery({
    queryKey: ["user-battles"],
    queryFn: () => api.entities.Battle.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const totalXP = battles.reduce((sum, b) => sum + (b.xp_earned || 0), 0);
  const level = Math.floor(totalXP / 500) + 1;
  const xpToNextLevel = 500 - (totalXP % 500);
  const winRate = battles.length > 0
    ? ((battles.filter((b) => b.result === "victory").length / battles.length) * 100).toFixed(1)
    : 0;

  const stats = [
    {
      label: "Total Cases",
      value: battles.length,
      icon: Target,
      color: "#4a90e2",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: Trophy,
      color: "#d4af37",
    },
    {
      label: "Total XP",
      value: totalXP,
      icon: TrendingUp,
      color: "#10b981",
    },
    {
      label: "Current Streak",
      value: `${profile?.streak_days || 0} days`,
      icon: Flame,
      color: "#f2c94c",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#1a1f3a] to-[#151a2e] rounded-xl p-8 border border-[#d4af37]/30 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#d4af37] to-[#f2c94c] rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-[#0a0e27]">
              {user?.full_name?.[0] || "U"}
            </span>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[#f5f5f5] mb-1">
              {user?.full_name || user?.email}
            </h1>
            <p className="text-gray-400 mb-3">{user?.email}</p>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div>
                <span className="text-2xl font-bold text-[#d4af37]">Level {level}</span>
                <p className="text-xs text-gray-400">{xpToNextLevel} XP to next level</p>
              </div>
              <div className="w-full md:w-64">
                <Progress
                  value={(totalXP % 500) / 5}
                  className="h-3 bg-[#1a1f3a]"
                  style={{ "--progress-color": "#d4af37" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-[#1a1f3a]/50 border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    <span className="text-2xl font-bold text-[#f5f5f5]">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Badges Section */}
      <Card className="bg-[#1a1f3a]/50 border-[#d4af37]/20 mb-8">
        <CardHeader>
          <CardTitle className="text-[#d4af37] flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements & Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              const earned = false; // Logic to determine if earned

              return (
                <motion.div
                  key={badge.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border-2 ${
                    earned
                      ? "bg-gradient-to-br from-[#d4af37]/20 to-[#f2c94c]/10 border-[#d4af37]/50"
                      : "bg-[#151a2e]/50 border-gray-700 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: earned
                          ? `linear-gradient(135deg, ${badge.color}40, ${badge.color}20)`
                          : "#1a1f3a",
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: badge.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#f5f5f5] text-sm">{badge.name}</p>
                      <p className="text-xs text-gray-400">
                        {earned ? "Unlocked!" : "Locked"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Battles */}
      <Card className="bg-[#1a1f3a]/50 border-[#d4af37]/20">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">Recent Battle History</CardTitle>
        </CardHeader>
        <CardContent>
          {battles.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No battles yet. Start your first case!</p>
          ) : (
            <div className="space-y-3">
              {battles.slice(0, 5).map((battle) => (
                <div
                  key={battle.id}
                  className="flex items-center justify-between p-4 bg-[#151a2e] rounded-lg border border-[#d4af37]/20"
                >
                  <div>
                    <p className="font-medium text-[#f5f5f5]">Case Battle</p>
                    <p className="text-xs text-gray-400">
                      {new Date(battle.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        battle.result === "victory"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : battle.result === "defeat"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }
                    >
                      {battle.result || "In Progress"}
                    </Badge>
                    <span className="text-sm font-semibold text-[#f2c94c]">
                      +{battle.xp_earned || 0} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}