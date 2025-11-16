import React from "react";
import { motion } from "framer-motion";

export default function VoiceWaveform({ isActive, color = "#d4af37" }) {
  const bars = Array.from({ length: 32 });

  return (
    <div className="flex items-center gap-1 h-16">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{
            background: `linear-gradient(to top, ${color}, ${color}88)`,
          }}
          animate={
            isActive
              ? {
                  height: [
                    Math.random() * 30 + 10,
                    Math.random() * 50 + 15,
                    Math.random() * 30 + 10,
                  ],
                  opacity: [0.5, 1, 0.5],
                }
              : { height: 4, opacity: 0.3 }
          }
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.03,
          }}
        />
      ))}
    </div>
  );
}