export const mask = (text: string): string => {
  return btoa(text);
};

export const unmask = (b64: string): string => {
  return atob(b64);
};
