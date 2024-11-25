import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ progress }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-white/70">
        <span>Processing queries...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-2 bg-black/20 rounded-full overflow-hidden"
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(to right, #E95420, #772953)'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </div>
  );
};

export default ProgressBar;
