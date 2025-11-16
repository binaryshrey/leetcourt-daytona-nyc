import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Star, Shuffle, Filter, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CaseUploader from "@/components/CaseUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const caseTypeColors = {
  criminal: "from-red-500/20 to-red-600/10 border-red-500/30",
  civil: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  torts: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
  constitutional: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  corporate: "from-green-500/20 to-green-600/10 border-green-500/30",
  ip: "from-pink-500/20 to-pink-600/10 border-pink-500/30",
};

export default function CaseLibrary() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: () => api.entities.Case.list(),
  });

  const handleCaseAdded = (newCase) => {
    // Refresh the cases list
    queryClient.invalidateQueries(["cases"]);
  };

  const handleDeleteCase = async (caseId, e) => {
    e.stopPropagation(); // Prevent card click event
    
    if (window.confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      try {
        await api.entities.Case.delete(caseId);
        queryClient.invalidateQueries(["cases"]);
      } catch (error) {
        console.error("Error deleting case:", error);
        alert("Failed to delete case. Please try again.");
      }
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || c.case_type === filterType;
    const matchesDifficulty =
      filterDifficulty === "all" || c.difficulty === parseInt(filterDifficulty);
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const handleSelectCase = (caseItem) => {
    navigate(createPageUrl("BattleArena") + `?caseId=${caseItem.id}`);
  };

  const handleSurpriseMe = () => {
    if (cases.length > 0) {
      const randomCase = cases[Math.floor(Math.random() * cases.length)];
      navigate(createPageUrl("BattleArena"));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f2c94c] bg-clip-text text-transparent mb-2">
          Case Library
        </h1>
        <p className="text-gray-400">Choose your next legal battle</p>
      </div>

      {/* Search and Filters */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases by name or issue..."
            className="pl-10 bg-[#1a1f3a] border-[#d4af37]/30 text-[#f5f5f5]"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="bg-[#1a1f3a] border-[#d4af37]/30 text-[#f5f5f5]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Case Type">
              {filterType === "all" ? "All Types" : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#1a1f3a] border-[#d4af37]/30 text-[#f5f5f5] z-50">
            <SelectItem value="all" className="cursor-pointer hover:bg-[#d4af37]/20">All Types</SelectItem>
            <SelectItem value="criminal" className="cursor-pointer hover:bg-[#d4af37]/20">Criminal</SelectItem>
            <SelectItem value="civil" className="cursor-pointer hover:bg-[#d4af37]/20">Civil</SelectItem>
            <SelectItem value="torts" className="cursor-pointer hover:bg-[#d4af37]/20">Torts</SelectItem>
            <SelectItem value="constitutional" className="cursor-pointer hover:bg-[#d4af37]/20">Constitutional</SelectItem>
            <SelectItem value="corporate" className="cursor-pointer hover:bg-[#d4af37]/20">Corporate</SelectItem>
            <SelectItem value="ip" className="cursor-pointer hover:bg-[#d4af37]/20">IP</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="bg-[#1a1f3a] border-[#d4af37]/30 text-[#f5f5f5]">
            <Star className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Difficulty">
              {filterDifficulty === "all" ? "All Levels" : `${filterDifficulty} Star${filterDifficulty !== "1" ? "s" : ""}`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#1a1f3a] border-[#d4af37]/30 text-[#f5f5f5] z-50">
            <SelectItem value="all" className="cursor-pointer hover:bg-[#d4af37]/20">All Levels</SelectItem>
            <SelectItem value="1" className="cursor-pointer hover:bg-[#d4af37]/20">1 Star</SelectItem>
            <SelectItem value="2" className="cursor-pointer hover:bg-[#d4af37]/20">2 Stars</SelectItem>
            <SelectItem value="3" className="cursor-pointer hover:bg-[#d4af37]/20">3 Stars</SelectItem>
            <SelectItem value="4" className="cursor-pointer hover:bg-[#d4af37]/20">4 Stars</SelectItem>
            <SelectItem value="5" className="cursor-pointer hover:bg-[#d4af37]/20">5 Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upload New Case */}
      <div className="mb-8">
        <CaseUploader onCaseAdded={handleCaseAdded} />
      </div>

      {/* Surprise Me Button */}
      <div className="mb-8">
        <Button
          onClick={handleSurpriseMe}
          className="bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] hover:opacity-90 text-white"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Surprise Me with a Random Case
        </Button>
      </div>

      {/* Cases Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`bg-gradient-to-br ${
                  caseTypeColors[caseItem.case_type]
                } border hover:scale-105 transition-all duration-300 h-full relative group`}
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteCase(caseItem.id, e)}
                  className="absolute top-2 right-2 z-10 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Delete case"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="outline"
                      className="bg-[#1a1f3a]/50 border-[#d4af37]/30 text-[#f2c94c]"
                    >
                      {caseItem.case_type}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: caseItem.difficulty }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#f2c94c] text-[#f2c94c]" />
                      ))}
                    </div>
                  </div>
                  <CardTitle className="text-[#f5f5f5] text-lg">{caseItem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-3">{caseItem.issue}</p>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {caseItem.description || caseItem.facts}
                  </p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCase(caseItem);
                    }}
                    className="w-full mt-4 bg-gradient-to-r from-[#d4af37] to-[#f2c94c] text-[#0a0e27] hover:opacity-90"
                  >
                    Start Battle
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {filteredCases.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No cases found matching your criteria</p>
        </div>
      )}
    </div>
  );
}