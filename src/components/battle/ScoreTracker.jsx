import React from "react";
import { motion } from "framer-motion";
import { Brain, Megaphone, Scale, MessageCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const scoreCategories = [
  { name: "Logic", key: "logic", icon: Brain, color: "#4a90e2" },
  { name: "Persuasion", key: "persuasiveness", icon: Megaphone, color: "#f2c94c" },
  { name: "Precedent", key: "precedent", icon: Scale, color: "#10b981" },
  { name: "Clarity", key: "clarity", icon: MessageCircle, color: "#a78bfa" },
];

export default function ScoreTracker({ scores }) {
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#d4af37]">Performance</h3>
        <div className="text-right">
          <p className="text-3xl font-bold text-[#f2c94c]">{totalScore}<span className="text-lg text-gray-400">/400</span></p>
          <p className="text-xs text-gray-400">Total Score</p>
        </div>
      </div>

      <div className="space-y-3">
        {scoreCategories.map((category) => {
          const Icon = category.icon;
          const score = scores[category.key] || 0;

          return (
            <div key={category.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: category.color }} />
                  <span className="text-sm font-medium text-[#f5f5f5]">
                    {category.name}
                  </span>
                </div>
                <motion.span
                  key={score}
                  initial={{ scale: 1.3, color: category.color }}
                  animate={{ scale: 1, color: "#f5f5f5" }}
                  className="text-sm font-bold"
                >
                  {score}/100
                </motion.span>
              </div>
              <Progress
                value={score}
                max={100}
                className="h-2 bg-[#1a1f3a]"
                style={{
                  "--progress-color": category.color,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}