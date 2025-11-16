import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertCircle, Scale, MessageSquare, TrendingUp } from "lucide-react";

const objections = [
  {
    type: "Relevance",
    icon: AlertCircle,
    color: "#f2c94c",
    rule: "The question or evidence is not relevant to the case at hand.",
  },
  {
    type: "Hearsay",
    icon: MessageSquare,
    color: "#4a90e2",
    rule: "An out-of-court statement offered to prove the truth of the matter asserted.",
  },
  {
    type: "Leading",
    icon: TrendingUp,
    color: "#10b981",
    rule: "A question that suggests the answer within the question itself.",
  },
  {
    type: "Speculation",
    icon: Scale,
    color: "#a78bfa",
    rule: "Witness is asked to guess or speculate rather than testify from knowledge.",
  },
];

const ObjectionButton = ({ objection, onObjection, disabled }) => {
  const Icon = objection.icon;
  return (
    <div className="relative group">
      <Button
        onClick={() => onObjection(objection.type)}
        disabled={disabled}
        className="relative overflow-hidden bg-gradient-to-br from-[#1a1f3a] to-[#151a2e] border-2 hover:scale-105 transition-all duration-300 disabled:opacity-50 h-auto py-3 w-full"
        style={{
          borderColor: `${objection.color}40`,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <Icon className="w-5 h-5" style={{ color: objection.color }} />
          <span className="text-xs font-semibold text-[#f5f5f5]">
            {objection.type}
          </span>
        </div>
        <motion.div
          className="absolute inset-0 bg-white/10"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.5 }}
        />
      </Button>
      {/* Always visible rule description below button */}
      <div 
        className="mt-1 text-[10px] text-gray-400 leading-tight px-1 min-h-[2.5rem]"
        style={{ borderLeft: `2px solid ${objection.color}40` }}
      >
        {objection.rule}
      </div>
    </div>
  );
};

export default function ObjectionPanel({ onObjection, disabled = false }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-[#d4af37] uppercase tracking-wide">
          Objection Tools
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {objections.map((obj) => (
          <ObjectionButton
            key={obj.type}
            objection={obj}
            onObjection={onObjection}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}