import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

export default function JudgeReaction({ show, sustained, onComplete }) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{
                boxShadow: sustained
                  ? ["0 0 20px rgba(16, 185, 129, 0.3)", "0 0 60px rgba(16, 185, 129, 0.8)", "0 0 20px rgba(16, 185, 129, 0.3)"]
                  : ["0 0 20px rgba(239, 68, 68, 0.3)", "0 0 60px rgba(239, 68, 68, 0.8)", "0 0 20px rgba(239, 68, 68, 0.3)"],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={`px-12 py-8 rounded-2xl backdrop-blur-xl ${
                sustained
                  ? "bg-gradient-to-br from-green-500/30 to-emerald-600/20 border-2 border-green-400"
                  : "bg-gradient-to-br from-red-500/30 to-red-600/20 border-2 border-red-400"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                {sustained ? (
                  <CheckCircle className="w-16 h-16 text-green-400" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-400" />
                )}
                <h2
                  className={`text-3xl font-bold ${
                    sustained ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {sustained ? "SUSTAINED" : "OVERRULED"}
                </h2>
                <p className="text-gray-300 text-center text-sm max-w-xs">
                  {sustained
                    ? "The judge agrees with your objection!"
                    : "The objection is denied. Proceed carefully."}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}