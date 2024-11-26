import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const hasSeenClosurePopup = (): boolean => {
  return localStorage.getItem('closurePopupShown') === 'true';
};

export const setClosurePopupShown = (): void => {
  localStorage.setItem('closurePopupShown', 'true');
};