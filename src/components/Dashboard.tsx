import React from 'react';
import { Target, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export type TestResult = {
  date: string;
  wpm: number;
  accuracy: number;
  weakKeys: Record<string, number>;
};

interface DashboardProps {
  history: TestResult[];
}

export function Dashboard({ history }: DashboardProps) {
  if (history.length === 0) {
    return (
      <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5, width: '100%' }}>
        <TrendingUp size={48} style={{ marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.25rem', color: 'var(--text-faint)' }}>Complete a test to see your progress dashboard!</p>
      </div>
    );
  }

  const avgWpm = Math.round(history.reduce((sum, h) => sum + h.wpm, 0) / history.length);
  const avgAcc = Math.round(history.reduce((sum, h) => sum + h.accuracy, 0) / history.length);
  const bestWpm = Math.max(...history.map(h => h.wpm));

  const globalWeakKeys: Record<string, number> = {};
  history.forEach(h => {
    Object.entries(h.weakKeys).forEach(([key, misses]) => {
      globalWeakKeys[key] = (globalWeakKeys[key] || 0) + misses;
    });
  });

  const topWeakKeys = Object.entries(globalWeakKeys)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
       variants={containerVariants}
       initial="hidden"
       animate="visible"
       style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        <motion.div variants={itemVariants} style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
             <TrendingUp size={20} /> <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.875rem' }}>Average Speed</span>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', lineHeight: 1 }}>
            {avgWpm} <span style={{ fontSize: '1rem', color: 'var(--text-faint)' }}>WPM</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
             <Target size={20} /> <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.875rem' }}>Average Accuracy</span>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)', lineHeight: 1 }}>
            {avgAcc}%
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
             <TrendingUp size={20} /> <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.875rem' }}>Best Record</span>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', lineHeight: 1 }}>
            {bestWpm} <span style={{ fontSize: '1rem', color: 'var(--text-faint)' }}>WPM</span>
          </div>
        </motion.div>
      </div>

      {topWeakKeys.length > 0 && (
        <motion.div variants={itemVariants} style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={24} color="var(--accent-error)" />
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>Global Weak Keys</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>All-Time</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {topWeakKeys.map(([key, misses]) => (
              <motion.div whileHover={{ scale: 1.05 }} key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'var(--bg-surface)' }}>
                <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-error)', fontWeight: 700, textTransform: 'uppercase' }}>{key}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Misses</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{misses}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <Calendar size={20} color="var(--accent-primary)" /> Recent Tests
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.length === 0 ? <p>No history.</p> : history.slice(0, 10).map((h, i) => (
            <motion.div 
               whileHover={{ scale: 1.01, x: 5 }}
               key={i} 
               style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
            >
               <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(h.date).toLocaleDateString()} at {new Date(h.date).toLocaleTimeString()}</span>
               <div style={{ display: 'flex', gap: '2rem' }}>
                 <span style={{ fontWeight: 600, color: 'var(--accent-primary)', width: '80px', textAlign: 'right' }}>{h.wpm} WPM</span>
                 <span style={{ fontWeight: 600, color: 'var(--accent-secondary)', width: '60px', textAlign: 'right' }}>{h.accuracy}%</span>
               </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
