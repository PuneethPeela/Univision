"use client";

import { useState, useEffect, useRef } from 'react';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: '👋 Hello! I am your Advanced AI Admissions Assistant. I can help you compare tuition fees, analyze starting salaries, match academic profiles, or navigate the application checklists. Ask me anything!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase().trim();

    if (q.includes('stanford') && q.includes('caltech')) {
      return `📊 **Stanford vs Caltech Admissions & Placement Comparison:**
- **Campus Location**: Stanford is in Stanford, CA | Caltech is in Pasadena, CA.
- **Fees**: Stanford is ~$62,000/yr | Caltech is ~$60,000/yr.
- **SAT/GPA Criteria**: Stanford average SAT is ~1500 (GPA 3.96) | Caltech is extremely high at ~1550 (GPA 3.97).
- **Career Placements**:
  - **Stanford**: Avg starting salary is **$105,000/yr** with a 94% placement rate. Key recruiters: Google, Tesla, Meta.
  - **Caltech**: Avg starting salary is **$102,000/yr** with a 92% placement rate. Key recruiters: SpaceX, NASA/JPL, Google.
Both are world-class but Caltech leans heavier on physical sciences and aerospace, while Stanford has a massive entrepreneurial and tech network.`;
    }

    if (q.includes('compare') || q.includes('comparison')) {
      return `⚖️ **How to Use the College Comparison Tool:**
1. Navigate to the **COMPARE** tab in the Navbar.
2. Select your primary and secondary colleges. You can also select a **third college (optional)** for a complete three-way evaluation!
3. Below, you will see a unified **radar chart**, dimension bar comparisons, and a comprehensive **comparative specs matrix** comparing fees, ratings, acceptance rates, SAT requirements, and deep placements metrics (starting salaries, top recruiters).
4. If you are signed in, click **"Save Comparison"** to save the folder to your Cockpit.`;
    }

    if (q.includes('match') || q.includes('matching') || q.includes('fit')) {
      return `✦ **Admissions Compatibility Matching System:**
Our platform calculates a personalized compatibility score (from 0% to 100%) for you by mathematically correlating your academic stats (GPA and SAT/ACT) against the average stats of admitted students in our database.
- **GPA weights**: Scaled up to 4.0.
- **SAT weights**: Scaled from 400 to 1600.
We map these to Reach, Target, or Safety colleges to help you build a well-balanced college application pipeline!`;
    }

    if (q.includes('reach') || q.includes('target') || q.includes('safety')) {
      return `🎯 **Understanding College Classification Fits:**
- **REACH (Highly Competitive)**: Colleges where average admitted student stats are slightly *above* your current GPA/SAT scores. Acceptance rates are usually low.
- **TARGET (Highly Compatible)**: Colleges where your academic stats are fully *equal to or slightly exceed* the average. You have a very strong chance of admission.
- **SAFETY (Secure Fit)**: Colleges where your stats *significantly exceed* the average, guaranteeing a solid fallback option.`;
    }

    if (q.includes('predictor') || q.includes('predict')) {
      return `🔮 **How to use the Admission Predictor:**
1. Head to the **ESSAY AI** or **TRACK** tabs, or click **Predictor** in the options.
2. Enter your GPA, test scores (SAT/ACT), and intended major.
3. The platform uses our compatibility algorithm to instantly predict your admissions categorization (Reach/Target/Safety) across our complete database of top-tier colleges.`;
    }

    if (q.includes('admin') || q.includes('crud') || q.includes('user')) {
      return `🛡️ **Evaluator Admin Control Console:**
- Registered administrators can access the **🛡️ Admin User Console** tab in the Cockpit sidebar.
- Admins can **Create, Read, Update, and Delete (CRUD)** candidate user details in real-time.
- For maximum security, passwords are completely omitted from the admin payload, and a transactional manual cascade delete is performed upon user removal to ensure total database integrity.`;
    }

    if (q.includes('fees') || q.includes('price') || q.includes('cost') || q.includes('tuition')) {
      return `💸 **Tuition Fees and Aid Comparisons:**
- Our colleges database contains annual tuition fees and average financial aid packages.
- For example, **MIT** is ~$58,000/yr with an average aid package of $52,000/yr, making it incredibly affordable for students qualifying for need-based aid.
- You can compare the pricing structures of up to 3 colleges side-by-side inside the **COMPARE** module!`;
    }

    // Default general response
    return `🤖 I am fully trained on the UNIVISION College Discovery Cockpit! 
You can ask me to:
- **Compare Stanford vs Caltech** (or other colleges)
- Explain **how admissions matching fits work** (Reach, Target, Safety)
- Guide you on **how to save comparisons**
- Outline **admin CRUD features** or **tuition costs**.

What else can I clarify about your admissions journey?`;
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages((prev) => [
            ...prev,
            { sender: 'assistant', text: data.reply, timestamp: new Date() },
          ]);
          setIsTyping(false);
          return;
        }
      }
      
      // Fallback if HTTP error (e.g. 401 unauthenticated or other codes)
      throw new Error('Fallback to local AI engine');
    } catch (err) {
      // Natural AI agent typing lag simulator for fallback
      setTimeout(() => {
        const aiReplyText = getAIResponse(text);
        const aiMsg: Message = {
          sender: 'assistant',
          text: aiReplyText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 700);
    }
  };


  const quickQuestions = [
    { text: 'Compare Stanford vs Caltech', label: '⚖️ Stanford vs Caltech' },
    { text: 'How does admissions matching work?', label: '✦ How matching works' },
    { text: 'What are Reach, Target, Safety schools?', label: '🎯 Reach/Target/Safety' },
    { text: 'How do I save comparisons?', label: '💾 Saving comparisons' },
  ];

  return (
    <>
      {/* Floating Pulse Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-cyan text-surface-900 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,244,254,0.4)] hover:shadow-[0_0_30px_rgba(0,244,254,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="Open AI Admissions Assistant"
      >
        <span className="text-2xl animate-pulse">{isOpen ? '✕' : '💬'}</span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan"></span>
          </span>
        )}
      </button>

      {/* Slide-out Glassmorphic Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[360px] md:w-[400px] h-[520px] glass border border-cyan/35 bg-surface-900/90 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeUp">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-cyan/15 via-[#13222d] to-cyan/5 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan/20 border border-cyan/40 flex items-center justify-center text-cyan text-sm">
                🤖
              </div>
              <div>
                <h3 className="text-xs font-bold text-onSurface uppercase tracking-wider font-geist">Admissions AI Assistant</h3>
                <span className="text-[9px] text-cyan font-bold tracking-widest uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span> Active Agent
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-cyan transition-colors text-sm"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-none">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow ${
                    msg.sender === 'user'
                      ? 'bg-cyan text-surface-900 font-medium rounded-tr-none'
                      : 'bg-white/5 border border-white/10 text-onSurface rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[8px] text-muted font-mono mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="mr-auto max-w-[85%] items-start flex flex-col">
                <div className="p-3 bg-white/5 border border-white/10 text-onSurface rounded-2xl rounded-tl-none text-xs flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick advice suggestions */}
          {messages.length === 1 && !isTyping && (
            <div className="px-4 py-2 border-t border-white/5 bg-white/1 space-y-1.5">
              <span className="text-[8px] text-muted uppercase font-bold tracking-wider block">Suggested Questions</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none flex-wrap">
                {quickQuestions.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => handleSend(q.text)}
                    className="px-2.5 py-1.5 bg-white/5 hover:bg-cyan/15 hover:text-cyan border border-white/10 rounded-lg text-[9px] font-bold text-muted transition whitespace-nowrap cursor-pointer"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-white/5 bg-[#090b0e] flex gap-2">
            <input
              type="text"
              placeholder="Ask about tuition cost, placements, matching..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(input);
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
            />
            <button
              onClick={() => handleSend(input)}
              className="px-3 bg-cyan text-surface-900 font-bold text-xs uppercase tracking-wider rounded-xl hover:shadow-[0_0_10px_rgba(0,244,254,0.3)] transition cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
