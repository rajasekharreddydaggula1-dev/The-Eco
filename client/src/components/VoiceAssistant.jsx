import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Mic, MicOff, Volume2, Sparkles, HelpCircle } from 'lucide-react';

export default function VoiceAssistant({ isOpen, onClose, onSearch, onCartOpen, onWalletOpen }) {
  const navigate = useNavigate();
  const { storeSlug } = useParams();
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionError, setRecognitionError] = useState('');
  const [responseMsg, setResponseMsg] = useState('');

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setResponseMsg('Listening...');
      setRecognitionError('');
    };

    rec.onerror = (e) => {
      console.error(e);
      if (e.error === 'not-allowed') {
        setRecognitionError('Microphone access denied. Please enable microphone permissions in your browser settings.');
      } else {
        setRecognitionError(`Error: ${e.error}`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      processCommand(resultText);
    };

    recognitionRef.current = rec;
  }, []);

  // Speak response out loud using Web Speech Synthesis
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any active speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Process commands
  const processCommand = (text) => {
    const cmd = text.toLowerCase().trim();
    setResponseMsg(`Processing command: "${text}"`);

    // 1. Navigation Back
    if (cmd === 'back' || cmd === 'go back') {
      speak('Going back');
      setTimeout(() => {
        navigate(-1);
        onClose();
      }, 800);
      return;
    }

    // 2. Navigation Home
    if (cmd === 'home' || cmd === 'go home' || cmd === 'open home' || cmd === 'go to home') {
      speak('Going to main marketplace');
      setTimeout(() => {
        navigate('/');
        onClose();
      }, 800);
      return;
    }

    // 3. Open Wallet
    if (cmd.includes('wallet') || cmd.includes('show wallet') || cmd.includes('open wallet') || cmd.includes('balance')) {
      speak('Opening wallet');
      setTimeout(() => {
        onWalletOpen();
        onClose();
      }, 800);
      return;
    }

    // 4. Open Cart
    if (cmd.includes('cart') || cmd.includes('show cart') || cmd.includes('open cart')) {
      speak('Opening shopping cart');
      setTimeout(() => {
        onCartOpen();
        onClose();
      }, 800);
      return;
    }

    // 5. Open Nike Store
    if (cmd.includes('nike')) {
      speak('Opening Nike Store');
      setTimeout(() => {
        navigate('/store/nike');
        onClose();
      }, 800);
      return;
    }

    // 6. Open Eco Foods Store
    if (cmd.includes('foods') || cmd.includes('food')) {
      speak('Opening Eco Foods Store');
      setTimeout(() => {
        navigate('/store/eco-foods');
        onClose();
      }, 800);
      return;
    }

    // 7. Open Organic India Store
    if (cmd.includes('organic') || cmd.includes('organic india')) {
      speak('Opening Organic India Store');
      setTimeout(() => {
        navigate('/store/organic-india');
        onClose();
      }, 800);
      return;
    }

    // 8. Open Khadi Naturals Store
    if (cmd.includes('khadi') || cmd.includes('naturals')) {
      speak('Opening Khadi Naturals Store');
      setTimeout(() => {
        navigate('/store/khadi-naturals');
        onClose();
      }, 800);
      return;
    }

    // 9. Open Clay & Earth Store
    if (cmd.includes('clay') || cmd.includes('earth')) {
      speak('Opening Clay and Earth Store');
      setTimeout(() => {
        navigate('/store/clay-earth');
        onClose();
      }, 800);
      return;
    }

    // 10. Open Green Tech Store (new)
    if (cmd.includes('tech') || cmd.includes('green tech')) {
      speak('Opening Green Tech Store');
      setTimeout(() => {
        navigate('/store/green-tech');
        onClose();
      }, 800);
      return;
    }

    // 11. Open Pure Bamboo Store (new)
    if (cmd.includes('bamboo') || cmd.includes('pure bamboo')) {
      speak('Opening Pure Bamboo Store');
      setTimeout(() => {
        navigate('/store/pure-bamboo');
        onClose();
      }, 800);
      return;
    }

    // 12. Open Herbal Garden Store (new)
    if (cmd.includes('herbal') || cmd.includes('garden')) {
      speak('Opening Herbal Garden Store');
      setTimeout(() => {
        navigate('/store/herbal-garden');
        onClose();
      }, 800);
      return;
    }

    // 13. Search/Find commands
    const searchMatch = cmd.match(/(?:search for|search|find|show me|filter)\s+(.*)/);
    if (searchMatch && searchMatch[1]) {
      const searchTerm = searchMatch[1];
      speak(`Searching for ${searchTerm}`);
      if (onSearch) {
        onSearch(searchTerm);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
      return;
    }

    // Default: treat whatever they say as a search parameter in the current context
    speak(`Searching for ${cmd}`);
    if (onSearch) {
      onSearch(cmd);
    }
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl backdrop-blur-md transition-all animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-2 text-brand-400">
            <Sparkles className="h-4 w-4" />
            <h3 className="text-sm font-bold text-white">Eco Voice Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Assistant Content */}
        <div className="mt-6 flex flex-col items-center text-center space-y-6">
          {/* Glowing mic container */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute inset-0 h-24 w-24 rounded-full bg-brand-500/20 animate-ping" />
                <div className="absolute inset-0 h-24 w-24 rounded-full bg-eco-500/10 animate-pulse" />
              </>
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full border shadow-lg transition-all active:scale-95 ${
                isListening 
                  ? 'bg-eco-600 border-eco-500 text-white glow-border-eco' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-brand-500 hover:bg-slate-850'
              }`}
            >
              {isListening ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-200">
              {isListening ? 'Listening for your voice...' : 'Tap mic to speak'}
            </h4>
            <p className="text-xs text-slate-500 min-h-[16px] px-4 italic">
              {transcript ? `"${transcript}"` : 'Try saying "go to Nike" or "search tea"'}
            </p>
          </div>

          {/* Feedback/Response box */}
          {responseMsg && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-900/60 border border-slate-850 px-4 py-2 text-xs font-semibold text-slate-300">
              <Volume2 className="h-3.5 w-3.5 text-brand-400" />
              <span>{responseMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {recognitionError && (
            <div className="rounded-lg border border-red-500/20 bg-red-950/30 p-3 text-xs text-red-400 text-left w-full">
              {recognitionError}
            </div>
          )}

          {/* Guidelines / help */}
          <div className="w-full border-t border-slate-900 pt-4 text-left space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="h-3 w-3" /> Commands you can say
            </span>
            <ul className="text-[10px] text-slate-500 space-y-1 pl-4 list-disc font-medium">
              <li><strong className="text-slate-400">"go to [store]"</strong>: Open Nike, Eco Foods, Organic India, Bamboo, etc.</li>
              <li><strong className="text-slate-400">"search [product]"</strong>: search tea, search shirt, find honey...</li>
              <li><strong className="text-slate-400">"open cart"</strong>: slides out your shopping bag drawer.</li>
              <li><strong className="text-slate-400">"show wallet"</strong>: opens your wallet details.</li>
              <li><strong className="text-slate-400">"back"</strong>: navigate back to the previous page.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
