import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ label, onFileSelect }) => {
  const [fileName, setFileName] = useState('');
  const [isUploaded, setIsUploaded] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    onDrop: files => {
      if (files[0]) {
        setFileName(files[0].name);
        setIsUploaded(true);
        onFileSelect(files[0]);
      }
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <label className="text-sm text-white/80">{label}</label>
      <motion.div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-[#E95420] bg-[#E95420]/10' 
            : isUploaded
              ? 'border-green-500/50 bg-green-500/10'
              : 'border-white/20 hover:border-white/30 hover:bg-white/5'
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {isUploaded ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center justify-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <FaCheck className="text-green-400" />
              </div>
              <span className="text-white/90">{fileName}</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-[#E95420]/20 flex items-center justify-center mx-auto">
                {isDragActive ? (
                  <FaUpload className="text-2xl text-[#E95420]" />
                ) : (
                  <FaUpload className="text-2xl text-[#E95420]" />
                )}
              </div>
              <p className="text-white/70">
                {isDragActive 
                  ? 'Drop file here' 
                  : 'Drag & drop CSV file or click to select'
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default FileUpload;
