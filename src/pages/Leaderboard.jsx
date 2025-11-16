import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Leaderboard() {
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => api.entities.UserProfile.list("-total_xp"),
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-[#d4af37]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-[#c0c0c0]" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-[#cd7f32]" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  const getRankBgColor = (rank) => {
    if (rank === 1) return "from-[#d4af37]/20 to-[#f2c94c]/10 border-[#d4af37]/50";
    if (rank === 2) return "from-gray-400/20 to-gray-500/10 border-gray-400/50";
    if (rank === 3) return "from-orange-400/20 to-orange-600/10 border-orange-500/50";
    return "from-[#1a1f3a]/50 to-[#151a2e]/50 border-[#d4af37]/20";
  };

  const renderLeaderboard = (data, category) => (
    <div className="space-y-3">
      {data.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No rankings available yet</p>
      ) : (
        data.map((profile, index) => {
          const rank = index + 1;
          return (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`bg-gradient-to-r ${getRankBgColor(
                  rank
                )} border hover:scale-102 transition-all duration-300`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>

                    <div className="w-12 h-12 bg-gradient-to-br from-[#4a90e2] to-[#60a5fa] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {profile.user_email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-[#f5f5f5]">{profile.user_email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="bg-[#d4af37]/20 border-[#d4af37]/30 text-[#f2c94c] text-xs"
                        >
                          Level {profile.level || 1}
                        </Badge>
                        {profile.law_school && (
                          <span className="text-xs text-gray-400">{profile.law_school}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#f2c94c]">
                        {category === "xp"
                          ? profile.total_xp || 0
                          : category === "wins"
                          ? profile.cases_won || 0
                          : profile.streak_days || 0}
                      </p>
                      <p className="text-xs text-gray-400">
                        {category === "xp" ? "XP" : category === "wins" ? "Wins" : "Days"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f2c94c] bg-clip-text text-transparent mb-2">
          Global Leaderboard
        </h1>
        <p className="text-gray-400">See how you rank against other lawyers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-[#d4af37]/20 to-[#f2c94c]/10 border-[#d4af37]/30">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
            <p className="text-3xl font-bold text-[#f5f5f5]">{profiles.length}</p>
            <p className="text-sm text-gray-400">Total Lawyers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#4a90e2]/20 to-[#60a5fa]/10 border-[#4a90e2]/30">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-[#60a5fa] mx-auto mb-2" />
            <p className="text-3xl font-bold text-[#f5f5f5]">
              {profiles.reduce((sum, p) => sum + (p.cases_completed || 0), 0)}
            </p>
            <p className="text-sm text-gray-400">Cases Completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#10b981]/20 to-[#059669]/10 border-[#10b981]/30">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
            <p className="text-3xl font-bold text-[#f5f5f5]">
              {profiles.reduce((sum, p) => sum + (p.total_xp || 0), 0)}
            </p>
            <p className="text-sm text-gray-400">Total XP Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <Card className="bg-[#1a1f3a]/50 border-[#d4af37]/20">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="xp" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-[#151a2e]">
                <TabsTrigger value="xp">By XP</TabsTrigger>
                <TabsTrigger value="wins">By Wins</TabsTrigger>
                <TabsTrigger value="streak">By Streak</TabsTrigger>
              </TabsList>

              <TabsContent value="xp" className="mt-6">
                {renderLeaderboard([...profiles].sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0)), "xp")}
              </TabsContent>

              <TabsContent value="wins" className="mt-6">
                {renderLeaderboard([...profiles].sort((a, b) => (b.cases_won || 0) - (a.cases_won || 0)), "wins")}
              </TabsContent>

              <TabsContent value="streak" className="mt-6">
                {renderLeaderboard([...profiles].sort((a, b) => (b.streak_days || 0) - (a.streak_days || 0)), "streak")}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}