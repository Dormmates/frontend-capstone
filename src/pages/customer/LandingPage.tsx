import { useGetLandingPageUpcomingShows } from "@/_lib/@react-client-query/customer";
import { useEffect, useState, useRef } from "react";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { Button } from "@/components/ui/button";
import Navbar from "./Navbar";

const LandingPage = () => {
  const { data, isLoading, isError } = useGetLandingPageUpcomingShows();
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const startX = useRef<number | null>(null);
  const currentX = useRef<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    document.title = `SLU CCA - Landing Page`;
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % data.length);
    }, 20000);

    return () => clearInterval(interval);
  }, [data]);

  const handleNext = () => {
    if (isAnimating || !data) return;
    setIsAnimating(true);
    setIndex((prev) => (prev + 1) % data.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handlePrev = () => {
    if (isAnimating || !data) return;
    setIsAnimating(true);
    setIndex((prev) => (prev - 1 + data.length) % data.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    currentX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    detectSwipe();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    isDragging.current = true;
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    currentX.current = e.clientX;
  };
  const handleMouseUp = () => {
    if (!isDragging.current) return;
    detectSwipe();
    isDragging.current = false;
  };
  const handleMouseLeave = () => {
    if (!isDragging.current) return;
    detectSwipe();
    isDragging.current = false;
  };

  const detectSwipe = () => {
    if (startX.current === null || currentX.current === null) return;
    const diff = startX.current - currentX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    startX.current = null;
    currentX.current = null;
  };

  if (isLoading) return <h1 className="text-center text-white mt-20">Loading...</h1>;
  if (isError || !data || data.length === 0) return <DefaultLandingPage />;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <Navbar className="fixed flex items-center bg-transparent gap-10 text-lg text-white z-[999] top-10 left-7" />

      <div
        className="relative w-full h-screen flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {data.map((show, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 relative">
            <img src={show.showCover} alt={show.title} className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-black/80"></div>

            <div className="absolute bottom-28 w-full  text-white flex justify-between px-10 flex-col gap-10 xl:flex-row">
              <div className="flex flex-col">
                <p className="text-lg text-gray-300 uppercase tracking-wide">Upcoming Show</p>
                <h1 className="text-primary text-6xl font-bold mb-2">{show.title}</h1>
                <p className="text-lg text-gray-200 mb-2">{show.description}</p>
                <p className="text-lg">
                  <span className="font-semibold">Date:</span> {formatToReadableDate(show.date)}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Time:</span> {formatToReadableTime(show.date)}
                </p>
              </div>
              <div className="flex flex-col justify-start gap-5 items-end">
                <p className="text-2xl">
                  Show Starts in: <Countdown showDate={show.date} />
                </p>
                <Button size="lg" className="w-fit">
                  View Show Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 fixed bottom-6 items-center justify-center w-full z-[9999]">
        {data.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`cursor-pointer rounded-full transition-all duration-300 ${index === i ? "w-20 h-2 bg-primary" : "w-3 h-2 bg-white/60"}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

const DefaultLandingPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-black text-white">
    <p>No upcoming shows available.</p>
  </div>
);

const Countdown = ({ showDate }: { showDate: string | Date }) => {
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

  return <span>{timeLeft}</span>;
};

export default LandingPage;
