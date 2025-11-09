export const formatToReadableDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  });
};

export const formatToReadableTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
};

export const formatTo12Hour = (time: string) => {
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";

  if (hour === 0) {
    hour = 12; // midnight
  } else if (hour > 12) {
    hour -= 12;
  }

  return `${hour}:${minute}${ampm}`;
};

export const convertDatesPH = (dates: { date: Date; time: string }[]) => {
  return dates.map(({ date, time }) => {
    const [hours, minutes] = time.split(":").map(Number);

    const combinedDate = new Date(date);
    combinedDate.setHours(hours || 0, minutes || 0, 0, 0);

    return { datetime: combinedDate };
  });
};
