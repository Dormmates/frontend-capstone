import { useEffect, useState } from "react";

const Countdown = ({ showDate, className }: { showDate: string | Date; className?: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const showTime = new Date(showDate).getTime();
      const diff = showTime - now;

      if (diff <= 0) {
        setTimeLeft("Show is starting!");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let formatted = "";
      if (days > 0) formatted += `${days}d `;
      if (hours > 0 || days > 0) formatted += `${hours}h `;
      if (minutes > 0 || hours > 0 || days > 0) formatted += `${minutes}m `;
      formatted += `${seconds}s`;

      setTimeLeft(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [showDate]);

  return <span className={className}>{timeLeft}</span>;
};

export default Countdown;
