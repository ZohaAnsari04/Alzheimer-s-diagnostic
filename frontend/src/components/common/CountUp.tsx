import React, { useState, useEffect } from 'react';

interface CountUpProps {
  end: number;
  duration?: number; // ms
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 800,
  className = ''
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span className={className}>{count}</span>;
};
