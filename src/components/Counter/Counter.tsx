import { Heading } from "@publicplan/kern-react-kit";
import { useEffect, useRef, useState } from "react";

interface CounterProps {
  target: number;
  duration?: number; // total duration in ms (optional, default: 2000)
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

const Counter = ({ target, duration = 2000 }: CounterProps) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out: slows down as it approaches the target
      const eased = easeOut(progress);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return <Heading headerElement="span" title={count.toString()} type="x-large" />;
};

export default Counter;
