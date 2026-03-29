import React, { useState, useEffect } from 'react';

interface KeyboardProps {
  activeKeys: Record<string, 'correct' | 'error' | 'pressed'>;
  onKeyClick?: (key: string) => void;
  showNumpad?: boolean;
}

export function Keyboard({ activeKeys, onKeyClick, showNumpad = false }: KeyboardProps) {
  const [osLabel, setOsLabel] = useState({ meta: 'win ⊞', alt: 'alt' });

  useEffect(() => {
    const platform = navigator.userAgent.toLowerCase();
    if (platform.includes('mac')) {
      setOsLabel({ meta: 'cmd ⌘', alt: 'opt ⌥' });
    } else if (platform.includes('linux')) {
      setOsLabel({ meta: 'super', alt: 'alt' });
    } else {
      setOsLabel({ meta: 'win ⊞', alt: 'alt' });
    }
  }, []);

  const KEYBOARD_ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
    ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
    ['ctrl', osLabel.meta, osLabel.alt, 'space', osLabel.alt, osLabel.meta, 'menu', 'ctrl']
  ];

  const NUMPAD_ROWS = [
    ['num', '/', '*', '-'],
    ['7', '8', '9', '+'],
    ['4', '5', '6', ' '],
    ['1', '2', '3', 'enter_num'],
    ['0', '.', '  ']
  ];

  const getKeyStyle = (key: string) => {
    let lookupKey = key.toLowerCase();
    
    // Normalize OS keys for lookup
    if (key === osLabel.meta) lookupKey = 'meta';
    else if (key === osLabel.alt) lookupKey = 'alt';
    else if (key === 'enter_num') lookupKey = 'enter'; // share status if needed
    else if (key === ' ') lookupKey = 'empty';
    else if (key === '  ') lookupKey = 'empty';
    
    const status = activeKeys[lookupKey];
    
    let flexRatio = 1;
    let customPadding = '0.5rem 0';
    let baseFontSize = 'min(0.9rem, 1.5vw)'; // adaptive font size

    // Width adjustments using pure flex-grow ratios for native responsive adaptation
    if (key === 'backspace' || key === 'enter') flexRatio = 2;
    else if (key === 'shift') flexRatio = 2.5;
    else if (key === 'tab' || key === 'caps') flexRatio = 1.5;
    else if (key === 'space') flexRatio = 7;
    else if (['ctrl', osLabel.meta, osLabel.alt, 'menu'].includes(key)) flexRatio = 1.25;
    else if (key === 'enter_num') flexRatio = 2;
    else if (key === '0') flexRatio = 2.1;

    let customStyle: React.CSSProperties = {
      flex: flexRatio,
      minWidth: 0, // CRITICAL: allows flex items to shrink indefinitely!
      padding: customPadding,
      margin: '0.15rem',
      borderRadius: '8px',
      border: '1px solid var(--glass-border)',
      borderBottomWidth: '4px',
      background: 'var(--glass-bg)',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 500,
      fontSize: baseFontSize,
      textTransform: key.length > 1 && !key.includes('⊞') && !key.includes('⌘') && !key.includes('⌥') ? 'capitalize' : 'none',
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: onKeyClick && lookupKey !== 'empty' ? 'pointer' : 'default',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };

    if (lookupKey === 'empty') {
      customStyle.opacity = 0;
      customStyle.pointerEvents = 'none';
      customStyle.flex = flexRatio;
    }

    // Active Status Coloring
    if (status === 'correct') {
      customStyle.background = 'var(--text-faint)';
      customStyle.borderColor = 'var(--accent-secondary)';
      customStyle.color = 'var(--accent-secondary)';
      customStyle.boxShadow = '0 0 15px rgba(14, 165, 233, 0.4)';
      customStyle.transform = 'translateY(2px)';
      customStyle.borderBottomWidth = '2px';
    } else if (status === 'error') {
      customStyle.background = 'var(--bg-surface-hover)';
      customStyle.borderColor = 'var(--accent-error)';
      customStyle.color = 'var(--accent-error)';
      customStyle.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)';
      customStyle.transform = 'translateY(2px)';
      customStyle.borderBottomWidth = '2px';
    } else if (status === 'pressed') {
      customStyle.background = 'var(--text-faint)';
      customStyle.borderColor = 'var(--text-main)';
      customStyle.color = 'var(--text-main)';
      customStyle.transform = 'translateY(2px)';
      customStyle.borderBottomWidth = '2px';
    }

    return customStyle;
  };

  const handleInteraction = (key: string) => {
    if (!onKeyClick) return;
    let normalizedKey = key;
    if (key === osLabel.meta) normalizedKey = 'meta';
    else if (key === osLabel.alt) normalizedKey = 'alt';
    else if (key === 'enter_num') normalizedKey = 'enter';
    else if (key === 'space') normalizedKey = ' ';
    
    if (normalizedKey !== ' ' && normalizedKey.trim() === '') return;
    onKeyClick(normalizedKey);
  };

  const renderKey = (key: string, idx: number) => {
    let display = key;
    if (key === 'space') display = 'Space';
    if (key === 'enter_num') display = 'Enter';
    
    return (
      <div 
        key={`${key}-${idx}`} 
        style={getKeyStyle(key)}
        onMouseDown={() => handleInteraction(key)}
        onTouchStart={(e) => {
          e.preventDefault(); // Prevents delay and mouse interference
          handleInteraction(key);
        }}
        className="kb-key"
      >
        {display}
      </div>
    );
  };

  return (
    <div className="keyboard-container" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1000px' }}>
      
      {/* Main Keys */}
      <div style={{ flex: '3 1 300px', padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex', width: '100%' }}>
              {row.map((key, keyIndex) => renderKey(key, keyIndex))}
            </div>
          ))}
        </div>
      </div>

      {/* Numpad Section */}
      {showNumpad && (
        <div className="animate-fade-in-up" style={{ flex: '1 1 150px', padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {NUMPAD_ROWS.map((row, rowIndex) => (
              <div key={`num-${rowIndex}`} style={{ display: 'flex', width: '100%' }}>
                {row.map((key, keyIndex) => renderKey(key, keyIndex))}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
