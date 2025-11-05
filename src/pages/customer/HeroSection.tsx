import { useGetLandingPageUpcomingShows } from "@/_lib/@react-client-query/customer";
import { useEffect, useState, useRef, useMemo } from "react";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { Button } from "@/components/ui/button";
import Navbar from "./Navbar";
import Countdown from "@/components/Countdown";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";

const HeroSection = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetLandingPageUpcomingShows();
  const [index, setIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  const startX = useRef<number | null>(null);
  const currentX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const slides = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [data[data.length - 1], ...data, data[0]];
  }, [data]);

  useEffect(() => {
    document.title = `SLU CCA - Landing Page`;
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [data, index]);

  const handleNext = () => {
    if (isAnimating || slides.length === 0) return;
    setIsAnimating(true);
    setIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isAnimating || slides.length === 0) return;
    setIsAnimating(true);
    setIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    if (!data || data.length === 0) return;

    if (index === 0) {
      setIsAnimating(false);
      setIndex(data.length);
    } else if (index === data.length + 1) {
      setIsAnimating(false);
      setIndex(1);
    } else {
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    slider?.addEventListener("transitionend", handleTransitionEnd);
    return () => slider?.removeEventListener("transitionend", handleTransitionEnd);
  }, [index, data]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    currentX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => detectSwipe();

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

  if (isLoading) return <Loading />;
  if (isError || !data || data.length === 0) return <DefaultLandingPage />;

  return (
    <div className="min-h-screen w-full relative overflow-hidden select-none">
      <Navbar
        className={`text-white absolute flex items-center gap-10 text-lg z-[999] top-0 left-0 w-full px-10 py-5 ${
          isFixed ? "!fixed top-0 left-0 w-full z-50 bg-background border-b border-border shadow-md !text-foreground" : ""
        }`}
      />

      <div
        ref={sliderRef}
        className={`slider relative w-full h-screen flex transition-transform duration-700 ease-in-out`}
        style={{
          transform: `translateX(-${index * 100}%)`,
          transitionProperty: isAnimating ? "transform" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {slides.map((show, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 relative">
            <img src={show.showCover} alt={show.title} className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-black/80"></div>

            <div className="absolute bottom-28 w-full text-white flex justify-between px-5 md:px-10 flex-col gap-10 xl:flex-row">
              <div className="flex flex-col">
                <p className="text-lg text-gray-300 uppercase tracking-wide">Upcoming Show</p>
                <h1 className="text-primary text-4xl md:text-6xl font-bold mb-2">{show.title}</h1>
                <p className="text-lg text-gray-200 mb-2 tracking-tighter max-h-[200px] line-clamp-3">{show.description}</p>
                <p className="text-lg">
                  <span className="font-semibold">Date:</span> {formatToReadableDate(show.date)}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Time:</span> {formatToReadableTime(show.date)}
                </p>
              </div>
              <div className="flex flex-col justify-end gap-5 items-end">
                <p className="text-2xl text-right">
                  Show Starts in: <Countdown showDate={show.date} />
                </p>
                <Button onClick={() => navigate(`/show/${show.showId}`)} size="lg" className="w-fit">
                  View Show Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex gap-2 absolute bottom-6 items-center justify-center w-full z-[10000] pointer-events-auto">
        {data.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i + 1)}
            className={`cursor-pointer rounded-full transition-all duration-300 ${index === i + 1 ? "w-20 h-2 bg-primary" : "w-3 h-2 bg-white/60"}`}
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

export default HeroSection;
