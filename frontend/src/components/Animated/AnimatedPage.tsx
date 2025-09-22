import React from 'react';
import { motion } from 'framer-motion';

// const animation = {
//   initial: { x: '-100vw', opacity: 0 },
//   animate: { x: 0, opacity: 1 },
//   exit: { x: '100vw', opacity: 0 },
//   transition: { type: 'spring', stiffness: 50 } as const
// };
const animation = {
  initial: { x: '-100vw', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100vw', opacity: 0 },
  transition: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.6
  } as const
};
const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={animation.transition}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
