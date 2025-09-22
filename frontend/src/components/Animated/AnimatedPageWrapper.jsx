import React, { useEffect, useState } from 'react';
import './AnimatedPageWrapper.css';

const AnimatedPageWrapper = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Dispara animação após montagem
    setIsVisible(true);
  }, []);

  return (
    <div className={`page-wrapper ${isVisible ? 'slide-in' : ''}`}>
      {children}
    </div>
  );
};

export default AnimatedPageWrapper;