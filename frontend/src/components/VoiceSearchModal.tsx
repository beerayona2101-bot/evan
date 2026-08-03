import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Sparkles, Search, Volume2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let recognition: any = null;

    if (isOpen) {
      setTranscript('');
      setErrorMsg('');

      // Check browser support for Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onstart = () => {
            setIsListening(true);
          };

          recognition.onresult = (event: any) => {
            const currentTranscript = Array.from(event.results)
              .map((result: any) => result[0].transcript)
              .join('');
            setTranscript(currentTranscript);
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            if (event.error !== 'no-speech') {
              setErrorMsg('Voice input unavailable. Please try typing or speaking clearly.');
            }
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
        } catch (err) {
          console.error(err);
          setIsListening(false);
        }
      } else {
        setErrorMsg('Web Speech API is not supported in this browser. Try Chrome or Edge.');
      }
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isOpen]);

  const handleApplySearch = (queryToUse?: string) => {
    const query = queryToUse || transcript;
    if (query.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-zinc-950 border border-amber-500/40 rounded-3xl max-w-md w-full p-8 text-zinc-100 shadow-2xl relative text-center overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon / Mic Pulse animation */}
          <div className="relative inline-flex items-center justify-center mb-6">
            {isListening && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="absolute w-24 h-24 rounded-full bg-amber-500/20"
                />
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                  className="absolute w-20 h-20 rounded-full bg-amber-400/30"
                />
              </>
            )}

            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition duration-300 shadow-xl z-10 ${
              isListening
                ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-black border-amber-300 shadow-amber-500/50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}>
              <Mic className="w-8 h-8" />
            </div>
          </div>

          {/* Status Label */}
          <h3 className="text-xl font-bold text-zinc-100 flex items-center justify-center gap-2">
            {isListening ? 'Listening...' : 'EVAN Voice Assistant'}
          </h3>
          <p className="text-xs text-amber-400/90 font-mono mt-1">
            {isListening ? 'Say a product name, fit, or luxury style query' : 'Tap microphone to speak'}
          </p>

          {/* Transcript Display */}
          <div className="my-6 min-h-[72px] bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-center">
            {transcript ? (
              <p className="text-sm font-medium text-amber-200 italic">"{transcript}"</p>
            ) : errorMsg ? (
              <p className="text-xs text-rose-400 font-mono">{errorMsg}</p>
            ) : (
              <p className="text-xs text-zinc-500 italic">e.g. "Show me royal crimson Banarasi sarees" or "Mustard gold Kanchipuram silk"</p>
            )}
          </div>

          {/* Sample Voice Prompts */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {['Banarasi Silk Sarees', 'Kanchipuram Silk', 'Organza Floral Sarees', 'Handloom Linen'].map(sample => (
              <button
                key={sample}
                onClick={() => handleApplySearch(sample)}
                className="text-[11px] bg-zinc-900 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 px-3 py-1.5 rounded-full transition"
              >
                "{sample}"
              </button>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleApplySearch()}
            disabled={!transcript.trim()}
            className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 transition"
          >
            <Search className="w-4 h-4" /> Search Catalog <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
