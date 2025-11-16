import React from "react";
import { motion } from "framer-motion";

export default function ArgumentBubble({ text, speaker, isAI = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`mb-3 ${isAI ? "ml-auto" : "mr-auto"}`}
    >
      <div
        className={`px-5 py-3 rounded-2xl max-w-md backdrop-blur-sm ${
          isAI
            ? "bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 ml-auto"
            : "bg-gradient-to-br from-[#4a90e2]/20 to-[#60a5fa]/10 border border-[#4a90e2]/30"
        }`}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: isAI ? "#fca5a5" : "#60a5fa" }}>
          {speaker}
        </p>
        <p className="text-[#f5f5f5] text-sm leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
}