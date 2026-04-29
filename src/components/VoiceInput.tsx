import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceInput: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API if supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        stopRecording();
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Restart if it stopped unexpectedly while "recording"
          recognitionRef.current?.start();
        }
      };
    }
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setShowPopup(true);
      setIsRecording(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Voice recognition is not supported in this browser.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      setIsRecording(false);
      recognitionRef.current.stop();
      // Auto-hide popup after a delay
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-full mb-4 w-64 bg-slate-800 text-white p-4 rounded-2xl shadow-xl z-50 pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
                {isRecording ? 'Listening...' : 'Recorded text'}
              </span>
              {isRecording && <Loader2 className="w-4 h-4 animate-spin text-green-400" />}
            </div>
            <p className="text-sm min-h-[40px]">
              {transcript || (isRecording ? "Speak now..." : "No speech detected.")}
            </p>
            {!isRecording && transcript && (
              <button 
                onClick={() => setShowPopup(false)}
                className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-bold transition-colors"
              >
                Send Report
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {isRecording && (
          <motion.div
            className="absolute inset-0 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleRecording}
          className={`relative z-10 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            isRecording ? 'bg-red-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          aria-label={isRecording ? "Stop recording" : "Start voice input"}
        >
          {isRecording ? <Square className="w-6 h-6 lg:w-8 lg:h-8 fill-current" /> : <Mic className="w-6 h-6 lg:w-8 lg:h-8" />}
        </motion.button>
      </div>
    </div>
  );
};

export default VoiceInput;
