import type { SectionedPricing } from "@/types/ticketpricing";

export const getFileId = (url: string) => {
  const match = url.match(/files\/([a-z0-9-]+)\//i);
  const fileId = match ? match[1] : null;

  return fileId;
};

export const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const getSectionedPriceRange = (pricing: SectionedPricing) => {
  const prices = Object.values(pricing.sectionPrices)
    .map(Number)
    .filter((price) => !isNaN(price));

  if (prices.length === 0) {
    return { min: 0, max: 0, rangeText: "₱0" };
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    min,
    max,
    rangeText: min === max ? `₱${min}` : `₱${min} - ₱${max}`,
  };
};
