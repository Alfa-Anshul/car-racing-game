import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CountdownOverlay() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  const display = count > 0 ? count.toString() : 'GO!';
  const color = count > 0 ? 'var(--red)' : 'var(--cyan)';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <AnimatePresence mode="wait">
        <motion.div key={display}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ fontFamily: 'Orbitron', fontSize: 120, fontWeight: 900, color, textShadow: `0 0 40px ${color}, 0 0 80px ${color}` }}
        >{display}</motion.div>
      </AnimatePresence>
    </div>
  );
}
