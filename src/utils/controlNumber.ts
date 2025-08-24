export const parseControlNumbers = (input: string): number[] => {
  const parts = input.split(",").map((part) => part.trim());
  const numbers: number[] = [];

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start > end) {
        throw new Error(`Invalid range: "${part}"`);
      }
      for (let i = start; i <= end; i++) {
        numbers.push(i);
      }
    } else {
      const num = parseInt(part, 10);
      if (isNaN(num)) {
        throw new Error(`Invalid number: "${part}"`);
      }
      numbers.push(num);
    }
  }

  return numbers;
};

export const parseSeat = (seat: string): { row: string; number: number } => {
  const match = seat.match(/^([A-Z]+)(\d+)$/i);
  if (!match) throw new Error(`Invalid seat format: ${seat}`);
  return {
    row: match[1].toUpperCase(),
    number: parseInt(match[2], 10),
  };
};

export const validateControlInput = (control: string) => {
  const validCharsOnly = /^[0-9,\-\s]+$/;
  return validCharsOnly.test(control);
};

export const formatTicket = (ticketNumber: number) => {
  return String(ticketNumber).length == 2 ? "0" + ticketNumber : String(ticketNumber).length == 1 ? "00" + ticketNumber : ticketNumber;
};
