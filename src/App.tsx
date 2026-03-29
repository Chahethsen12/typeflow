import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Clock, Ghost, BarChart2, Keyboard as KeyboardIcon } from 'lucide-react';
import { Keyboard } from './components/Keyboard';
import { Dashboard, type TestResult } from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAdaptiveText } from './utils/aiDrillGenerator';

export default function App() {
  const [text, setText] = useState(generateAdaptiveText([]));
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<'idle'|'running'|'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(30);
  
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [activeKeys, setActiveKeys] = useState<Record<string, 'correct'|'error'|'pressed'>>({});
  const [showNumpad, setShowNumpad] = useState(false);
  const [errorLog, setErrorLog] = useState<Record<string, number>>({});
  
  const [history, setHistory] = useState<TestResult[]>([]);
  const [currentView, setCurrentView] = useState<'typing' | 'dashboard'>('typing');

  useEffect(() => {
    const stored = localStorage.getItem('typeflow_history');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        setHistory(parsed); 
        // Force the very first test they do today to immediately target their historical weak keys!
        setText(generateAdaptiveText(parsed));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Focus logic
      if (inputRef.current && document.activeElement !== inputRef.current && status !== 'finished') {
        inputRef.current.focus();
      }

      // Keys visualizer logic
      if (status === 'finished') return;
      const key = e.key.toLowerCase();
      let newStatus: 'correct'|'error'|'pressed' = 'pressed';

      if (e.code.startsWith('Numpad')) {
        setShowNumpad(true);
      }

      if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Evaluate correctly based on characters input
        // Using length of current input to guess expected char (will be slightly delayed relative to React state but good enough for visualizer)
        const expected = text[inputRef.current?.value.length || 0];
        if (e.key === expected) newStatus = 'correct';
        else newStatus = 'error';
      } else if (key === 'backspace') {
        newStatus = 'pressed';
      }

      if (key === ' ') {
        setActiveKeys(prev => ({ ...prev, space: newStatus }));
      } else {
        setActiveKeys(prev => ({ ...prev, [key]: newStatus }));
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase() === ' ' ? 'space' : e.key.toLowerCase();
      setActiveKeys(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [status, text]);

  const handleStart = () => {
    if (status === 'idle') {
      setStatus('running');
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleFinish = () => {
    setStatus('finished');
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Save to history reliably using functional setHistory
    setHistory(prev => {
      const newResult: TestResult = {
        date: new Date().toISOString(),
        wpm,
        accuracy,
        weakKeys: errorLog
      };
      const next = [newResult, ...prev];
      localStorage.setItem('typeflow_history', JSON.stringify(next));
      return next;
    });
  };

  const calculateStats = (input: string) => {
    const charsTyped = input.length;
    let correctChars = 0;
    for (let i = 0; i < charsTyped; i++) {
        if (input[i] === text[i]) correctChars++;
    }
    const acc = charsTyped > 0 ? (correctChars / charsTyped) * 100 : 100;
    setAccuracy(Math.round(acc));
    
    // WPM: roughly (correct chars / 5) / time in minutes
    // Wait, since time is decreasing:
    setTimeLeft(currTimeLeft => {
        const timeElapsed = 30 - currTimeLeft;
        const timeInMins = timeElapsed > 0 ? timeElapsed / 60 : 1/60;
        const currentWpm = Math.round((correctChars / 5) / timeInMins);
        setWpm(currentWpm > 0 ? currentWpm : 0);
        return currTimeLeft;
    });
  }

  const processInput = (newVal: string) => {
    if (status === 'finished') return;
    if (status === 'idle') handleStart();
    
    // AI Algorithmic tracking: Detect errors specifically when new characters are added
    if (newVal.length > userInput.length) {
      const addedChar = newVal[newVal.length - 1];
      const expectedChar = text[newVal.length - 1];
      if (addedChar !== expectedChar) {
        setErrorLog(prev => {
          const keyName = expectedChar === ' ' ? 'space' : expectedChar.toLowerCase();
          return { ...prev, [keyName]: (prev[keyName] || 0) + 1 };
        });
      }
    }

    setUserInput(newVal);
    calculateStats(newVal);
    
    // Stop if reached end of text
    if (newVal.length >= text.length) {
      handleFinish();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processInput(e.target.value);
  };

  const handleVirtualKeyClick = (key: string) => {
    inputRef.current?.focus(); // Keep focus alive
    
    let updatedVal = userInput;
    if (key === 'backspace') {
      updatedVal = updatedVal.slice(0, -1);
    } else if (key.length === 1) {
      updatedVal += key;
    } else {
      return; // Ignore modifiers
    }
    
    processInput(updatedVal);

    // Provide immediate visual feedback for touch clicks
    const stateKey = key === ' ' ? 'space' : key.toLowerCase();
    const expected = text[userInput.length || 0];
    let simStatus: 'correct'|'error'|'pressed' = 'pressed';
    
    if (key.length === 1) {
      simStatus = key === expected ? 'correct' : 'error';
    }
    
    setActiveKeys(prev => ({ ...prev, [stateKey]: simStatus }));
    setTimeout(() => {
      setActiveKeys(prev => {
        const next = { ...prev };
        delete next[stateKey];
        return next;
      });
    }, 150);
  };

  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('idle');
    setUserInput('');
    setTimeLeft(30);
    setWpm(0);
    setAccuracy(100);
    setErrorLog({});
    setText(generateAdaptiveText(history));
    inputRef.current?.focus();
  };

  const renderText = () => {
    let globalIndex = 0;
    const words = text.split(' ');
    
    return words.map((word, wordIdx) => {
      // Add trailing space except for the final word
      const isLastWord = wordIdx === words.length - 1;
      const chars = isLastWord ? word.split('') : [...word.split(''), ' '];
      
      return (
        <span key={wordIdx} className="word" style={{ display: 'inline-block' }}>
          {chars.map((char) => {
            const index = globalIndex++;
            let charClass = '';
            if (index < userInput.length) {
              charClass = userInput[index] === char ? 'correct' : 'error';
            } else if (index === userInput.length && status !== 'finished') {
              charClass = 'active';
            }
            return (
              <span key={index} className={`char ${charClass} ${char === ' ' ? 'space' : ''}`}>
                {char === ' ' ? ' ' : char}
              </span>
            );
          })}
        </span>
      );
    });
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', maxWidth: '1000px', margin: '0 auto', gap: '3rem', width: '100%' }}>
      
      {/* Header */}
      <motion.header 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="app-header" 
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', textShadow: '0 0 20px var(--accent-primary-glow)' }}>
            <motion.div 
              animate={{ y: [0, -5, 0] }} 
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <Ghost size={32} color="var(--accent-primary)" />
            </motion.div>
            Typeflow
          </h1>
          <span style={{ color: 'var(--accent-secondary)', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.5px', marginTop: '0.25rem' }}>
            AI-powered typing improvement
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', alignItems: 'center' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView(v => v === 'typing' ? 'dashboard' : 'typing')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: currentView === 'dashboard' ? 'var(--bg-surface-hover)' : 'var(--glass-bg)', borderRadius: '12px', border: currentView === 'dashboard' ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)', color: currentView === 'dashboard' ? 'var(--accent-primary)' : 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s ease' }}
            title={currentView === 'typing' ? 'View Profile & Analytics' : 'Back to Typing Test'}
          >
            {currentView === 'typing' ? <BarChart2 size={20} /> : <KeyboardIcon size={20} />}
          </motion.button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.5rem 1.25rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <Clock size={20} color="var(--accent-secondary)" />
            <motion.span 
              key={timeLeft}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)' }}
            >
              {timeLeft}s
            </motion.span>
          </div>
        </div>
      </motion.header>

      {/* Main Views */}
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' ? (
          <motion.main 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', position: 'relative' }}
          >
            <Dashboard history={history} />
          </motion.main>
        ) : (
        <motion.main 
          key="typing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%', position: 'relative' }}
        >
        
        {/* Real-time Stats Overlay */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', opacity: status === 'running' ? 1 : 0.4, transition: 'opacity 0.3s ease' }}>
           <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
             <span className="stat-card-label" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>wpm</span>
             <span className="live-stats" style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{wpm}</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
             <span className="stat-card-label" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>acc</span>
             <span className="live-stats" style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>{accuracy}%</span>
           </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ position: 'relative', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2rem', width: '100%' }}
          onClick={() => inputRef.current?.focus()}
        >
          <AnimatePresence>
            {status === 'idle' && userInput.length === 0 && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 exit={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
                 style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%', zIndex: 10, background: 'rgba(10, 10, 12, 0.4)', padding: '2rem', backdropFilter: 'blur(8px)', borderRadius: '16px' }}
               >
                 <span style={{ color: 'var(--accent-primary)', fontSize: '1rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, opacity: 1 }}>
                   Press any key to start
                 </span>
                 <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.5px' }}>
                   Adaptive practice based on how you type
                 </span>
               </motion.div>
            )}
          </AnimatePresence>

          <div 
            className="typing-text-display" 
            style={{ 
              fontFamily: 'var(--font-sans)', 
              fontWeight: 400, 
              color: 'var(--text-faint)', 
              userSelect: 'none', 
              width: '100%', 
              display: 'flex', 
              flexWrap: 'wrap', 
              alignContent: 'flex-start',
              filter: status === 'idle' && userInput.length === 0 ? 'blur(4px) opacity(0.3)' : 'none',
              transition: 'filter 0.3s ease'
            }}
          >
            {renderText()}
          </div>
          
          <input 
            ref={inputRef}
            type="text" 
            value={userInput} 
            onChange={handleChange} 
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0, padding: 0, margin: 0, border: 'none' }} 
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </motion.div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
          <button 
            onClick={handleRestart}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--glass-bg)', padding: '0.75rem 2rem', borderRadius: '12px', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', fontSize: '1rem', fontWeight: 500 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface-hover)';
              e.currentTarget.style.color = 'var(--text-main)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.boxShadow = '0 0 15px var(--accent-primary-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--glass-bg)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <RotateCcw size={18} />
            <span>Restart Test</span>
          </button>
        </div>

        {/* Keyboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: status === 'finished' ? 0.3 : 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', damping: 20 }}
          style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}
        >
          <Keyboard activeKeys={activeKeys} showNumpad={showNumpad} onKeyClick={handleVirtualKeyClick} />
        </motion.div>
      </motion.main>
      )}
      </AnimatePresence>

      {/* Result Modal Overlay */}
      <AnimatePresence>
      {status === 'finished' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10, 10, 12, 0.85)', backdropFilter: 'blur(16px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-panel modal-content" 
            style={{ maxWidth: '600px', width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
          >
            <h2 className="modal-title" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0, textAlign: 'center' }}>Test Completed</h2>
            
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="stat-card-label" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>wpm</span>
                <span className="stat-card-value" style={{ fontWeight: 700, color: 'var(--accent-primary)', lineHeight: 1 }}>{wpm}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="stat-card-label" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>accuracy</span>
                <span className="stat-card-value" style={{ fontWeight: 700, color: 'var(--accent-secondary)', lineHeight: 1 }}>{accuracy}%</span>
              </div>
            </div>

            {/* Weak Keys AI Insight */}
            {Object.keys(errorLog).length > 0 && (
              <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-error)', boxShadow: '0 0 10px var(--accent-error)' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>AI Insights: Weak Keys Detected</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Object.entries(errorLog)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 4)
                    .map(([key, count]) => (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-error)', fontWeight: 700, textTransform: 'uppercase' }}>{key}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{count} missed</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            <motion.button 
               whileHover={{ scale: 1.05, backgroundColor: '#7c3aed', y: -2 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleRestart}
               style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', background: 'var(--accent-primary)', color: '#fff', padding: '1.25rem', borderRadius: '12px', fontSize: '1.125rem', fontWeight: 600, marginTop: '1rem', border: 'none', boxShadow: '0 0 20px var(--accent-primary-glow)', cursor: 'pointer' }}
            >
              <RotateCcw size={22} />
              Try Again
            </motion.button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
