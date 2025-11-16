import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const stages = [
  { name: "Opening", key: "opening", description: "Opening Statements" },
  { name: "Direct", key: "direct", description: "Direct Examination" },
  { name: "Cross", key: "cross", description: "Cross Examination" },
  { name: "Closing", key: "closing", description: "Closing Arguments" },
];

export default function CaseTimeline({ currentStage, canAdvance, onAdvanceStage }) {
  const currentIndex = stages.findIndex((s) => s.key === currentStage);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center relative flex-1">
              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 bg-[#1a1f3a] -z-10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#f2c94c]"
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}

              {/* Stage Icon */}
              <motion.div
                animate={{
                  scale: isCurrent ? [1, 1.1, 1] : 1,
                  boxShadow: isCurrent
                    ? [
                        "0 0 0px rgba(212, 175, 55, 0.5)",
                        "0 0 20px rgba(212, 175, 55, 0.8)",
                        "0 0 0px rgba(212, 175, 55, 0.5)",
                      ]
                    : "0 0 0px rgba(212, 175, 55, 0)",
                }}
                transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isCompleted
                    ? "bg-gradient-to-br from-[#d4af37] to-[#f2c94c] border-[#d4af37]"
                    : isCurrent
                    ? "bg-gradient-to-br from-[#4a90e2] to-[#60a5fa] border-[#4a90e2]"
                    : "bg-[#1a1f3a] border-gray-600"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-[#0a0e27]" />
                ) : isPending ? (
                  <Lock className="w-4 h-4 text-gray-500" />
                ) : (
                  <Circle className={`w-5 h-5 ${isCurrent ? "text-white" : "text-gray-500"}`} />
                )}
              </motion.div>

              {/* Stage Label */}
              <div className="mt-2 text-center">
                <span
                  className={`text-xs font-semibold block ${
                    isCurrent
                      ? "text-[#f2c94c]"
                      : isCompleted
                      ? "text-[#d4af37]"
                      : "text-gray-500"
                  }`}
                >
                  {stage.name}
                </span>
                <span className="text-[10px] text-gray-500 hidden md:block">
                  {stage.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance Stage Button */}
      {canAdvance && currentIndex < stages.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Button
            onClick={onAdvanceStage}
            className="bg-gradient-to-r from-[#10b981] to-[#059669] hover:opacity-90 text-white"
          >
            Advance to {stages[currentIndex + 1].name}
          </Button>
        </motion.div>
      )}
    </div>
  );
}