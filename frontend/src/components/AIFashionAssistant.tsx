import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, X, Send, User, ChevronRight, ShoppingBag, Shirt, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  recommendedProducts?: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  }[];
}

const PRESET_PROMPTS = [
  "What saree should I wear to a grand wedding reception?",
  "Suggest a lightweight organza saree for evening events",
  "How do I style a heavy Kanchipuram silk saree?",
  "Recommend handloom linen sarees for daily elegance"
];

const SAMPLE_RECOMMENDATIONS = [
  {
    id: 'prod-saree-001',
    name: 'EVAN COLLECTIONS Royal Crimson Banarasi Silk Saree',
    price: 9999,
    image: '/images/saree_banarasi_red.png',
    category: 'Banarasi Silk'
  },
  {
    id: 'prod-saree-002',
    name: 'EVAN COLLECTIONS Mustard Gold Kanchipuram Silk Saree',
    price: 14999,
    image: '/images/saree_kanchipuram_gold.png',
    category: 'Kanchipuram Silk'
  },
  {
    id: 'prod-saree-003',
    name: 'EVAN COLLECTIONS Pastel Floral Organza Designer Saree',
    price: 6999,
    image: '/images/saree_organza_floral.png',
    category: 'Organza Silk'
  }
];

export const AIFashionAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Greetings. I am your EVAN AI Saree Stylist. How may I assist you with saree selection, fabric pairings, or drape curation today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate AI response logic
    setTimeout(() => {
      let responseText = "For an opulent wedding look, I recommend pairing our Royal Crimson Banarasi Silk Saree with heavy temple gold jewelry and a embroidered elbow-sleeve blouse.";
      let recs: typeof SAMPLE_RECOMMENDATIONS | undefined = undefined;

      const qLower = query.toLowerCase();
      if (qLower.includes('wedding') || qLower.includes('reception') || qLower.includes('bridal') || qLower.includes('event')) {
        responseText = "For a royal wedding look, opt for our Mustard Gold Kanchipuram or Royal Crimson Banarasi Silk Saree. Pair with contrast unstitched blouse and heirloom gold accents.";
        recs = [SAMPLE_RECOMMENDATIONS[0], SAMPLE_RECOMMENDATIONS[1]];
      } else if (qLower.includes('organza') || qLower.includes('lightweight') || qLower.includes('evening')) {
        responseText = "Organza sarees offer effortless grace. Our Pastel Floral Organza Saree features delicate resham embroidery and scalloped zari borders perfect for cocktail evenings.";
        recs = [SAMPLE_RECOMMENDATIONS[2]];
      } else if (qLower.includes('kanchipuram') || qLower.includes('style') || qLower.includes('drape')) {
        responseText = "Kanchipuram silk sarees drape best with neat box pleats. Ensure the heavy Korvai temple border is highlighted across your shoulder drape.";
        recs = [SAMPLE_RECOMMENDATIONS[1]];
      } else if (qLower.includes('linen') || qLower.includes('daily') || qLower.includes('office')) {
        responseText = "Handloom linen cotton sarees provide breathable elegance for daytime and professional wear. Pair with minimal silver jewelry.";
        recs = SAMPLE_RECOMMENDATIONS;
      } else {
        responseText = `Regarding "${query}", our master tailors recommend keeping monochrome tones with high-contrast hardware. Here are curated items that complement your search:`;
        recs = SAMPLE_RECOMMENDATIONS.slice(0, 2);
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: recs
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.08, boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black px-5 py-3.5 rounded-full shadow-2xl border border-amber-300 font-semibold cursor-pointer group"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <span className="text-sm font-medium tracking-wide">EVAN AI Stylist</span>
      </motion.button>

      {/* Stylist Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[600px] bg-zinc-950/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md flex items-center justify-center text-black">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 flex items-center gap-2 text-sm">
                    EVAN Fashion Concierge
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h3>
                  <p className="text-xs text-amber-400/90 font-mono">Personal AI Stylist Active</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin scrollbar-thumb-zinc-800">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-black font-medium rounded-br-none shadow-lg'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] block mt-1 ${msg.sender === 'user' ? 'text-black/70 text-right' : 'text-zinc-500'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Recommended Products Carousel */}
                  {msg.recommendedProducts && (
                    <div className="mt-3 w-full space-y-2">
                      <p className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                        <Shirt className="w-3.5 h-3.5" /> Curated Selections:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {msg.recommendedProducts.map(prod => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              setIsOpen(false);
                              navigate(`/shop`);
                            }}
                            className="bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-2 cursor-pointer transition group"
                          >
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-24 object-cover rounded-lg mb-2 group-hover:scale-105 transition duration-300"
                            />
                            <h4 className="text-xs font-medium text-zinc-200 truncate">{prod.name}</h4>
                            <p className="text-xs font-semibold text-amber-400 mt-0.5">${prod.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-full w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  Styling your outfit options...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            <div className="px-4 py-2 bg-zinc-900/40 border-t border-zinc-900 flex gap-1.5 overflow-x-auto scrollbar-none">
              {PRESET_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(prompt)}
                  className="text-[11px] whitespace-nowrap bg-zinc-900 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 px-3 py-1.5 rounded-full transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-zinc-800 bg-zinc-900/90 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask your AI Stylist..."
                className="flex-grow bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl disabled:opacity-40 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
