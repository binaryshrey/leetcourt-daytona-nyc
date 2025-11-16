import React, { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { processPDFAndGenerateCase } from "@/utils/pdfExtractor";
import { api } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";

export default function CaseUploader({ onCaseAdded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      setStatus('error');
      setStatusMessage('Please upload a PDF file');
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setUploadedFileName(file.name);
    setIsProcessing(true);
    setStatus(null);

    try {
      // Extract and generate case data from PDF
      const caseData = await processPDFAndGenerateCase(file);

      // Save to database
      const newCase = await api.entities.Case.create(caseData);

      setStatus('success');
      setStatusMessage(`Case "${newCase.title}" successfully added!`);
      
      // Notify parent component
      if (onCaseAdded) {
        onCaseAdded(newCase);
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setStatus(null);
        setUploadedFileName('');
      }, 3000);

    } catch (error) {
      console.error('Error processing file:', error);
      setStatus('error');
      setStatusMessage(error.message || 'Failed to process PDF. Please try again.');
      
      setTimeout(() => {
        setStatus(null);
        setUploadedFileName('');
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-[#1a1f3a] to-[#151a2e] border-[#d4af37]/30 p-6">
      <h3 className="text-lg font-bold text-[#f2c94c] mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Upload New Case Document
      </h3>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging ? 'border-[#f2c94c] bg-[#d4af37]/10' : 'border-[#d4af37]/50 bg-[#1a1f3a]/50'}
          ${isProcessing ? 'pointer-events-none opacity-60' : 'cursor-pointer hover:border-[#f2c94c] hover:bg-[#d4af37]/5'}
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <Loader2 className="w-12 h-12 text-[#f2c94c] animate-spin" />
              <p className="text-[#f2c94c] font-semibold">Processing PDF...</p>
              <p className="text-sm text-gray-400">{uploadedFileName}</p>
              <p className="text-xs text-gray-500">Extracting text and generating case data with AI</p>
            </motion.div>
          ) : status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-green-500 font-semibold">{statusMessage}</p>
            </motion.div>
          ) : status === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <XCircle className="w-12 h-12 text-red-500" />
              <p className="text-red-500 font-semibold">Error</p>
              <p className="text-sm text-red-400">{statusMessage}</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <FileText className="w-12 h-12 text-[#d4af37]" />
              <p className="text-[#f5f5f5] font-semibold">
                Drag & drop a legal case PDF here
              </p>
              <p className="text-sm text-gray-400">or click to browse</p>
              <div className="mt-2 px-4 py-2 bg-[#d4af37]/20 rounded-full">
                <p className="text-xs text-[#f2c94c]">PDF format only</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 p-4 bg-[#1a1f3a]/50 rounded-lg border border-[#4a90e2]/20">
        <p className="text-xs text-gray-400 mb-2">
          <strong className="text-[#60a5fa]">AI-Powered Extraction:</strong>
        </p>
        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li>Automatically extracts case facts, issues, and evidence</li>
          <li>Identifies relevant statutes and precedents</li>
          <li>Generates prosecution and defense arguments</li>
          <li>Creates structured battle-ready case data</li>
        </ul>
      </div>
    </Card>
  );
}
