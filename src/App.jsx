import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ProgressBar from './components/ProgressBar';
import { processQueries } from './utils/api';
import { FaDownload, FaBrain, FaNetworkWired, FaMicrochip } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [files, setFiles] = useState({
    queries: null,
    labels: null,
    examples: null
  });
  const [apiKey, setApiKey] = useState('');
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleProcess = async () => {
    if (!files.queries || !files.labels || !apiKey) {
      alert('Please provide all required files and API key');
      return;
    }

    setProcessing(true);
    try {
      const result = await processQueries(files, apiKey, setProgress);
      setDownloadUrl(result);
    } catch (error) {
      alert('Error processing queries: ' + error.message);
    }
    setProcessing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="glass p-8 w-full max-w-2xl"
      >
        <motion.div 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="relative">
            <FaMicrochip className="text-4xl text-[#E95420] absolute top-0 left-0" />
            <FaBrain className="text-4xl text-[#772953] ml-2 mt-2" />
          </div>
          <h1 className="text-3xl font-medium">AI Query Classifier</h1>
        </motion.div>
        
        <div className="space-y-6">
          <FileUpload
            label="Upload Queries CSV"
            onFileSelect={(file) => setFiles(prev => ({ ...prev, queries: file }))}
          />
          <FileUpload
            label="Upload Labels CSV"
            onFileSelect={(file) => setFiles(prev => ({ ...prev, labels: file }))}
          />
          <FileUpload
            label="Upload Examples CSV (Optional)"
            onFileSelect={(file) => setFiles(prev => ({ ...prev, examples: file }))}
          />
          
          <div className="space-y-2">
            <label className="text-sm text-white/80">API Key</label>
            <motion.input
              type="text"
              placeholder="Enter your API key"
              className="ubuntu-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </div>

          <AnimatePresence>
            {processing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="py-2"
              >
                <ProgressBar progress={progress} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 pt-4">
            <motion.button
              onClick={handleProcess}
              disabled={processing}
              className="ubuntu-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaNetworkWired />
              Process Queries
            </motion.button>

            <AnimatePresence>
              {downloadUrl && (
                <motion.a
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  href={downloadUrl}
                  download="results.csv"
                  className="ubuntu-button-secondary flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaDownload /> Download Results
                </motion.a>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default App;

import './styles/tooltips.css';
