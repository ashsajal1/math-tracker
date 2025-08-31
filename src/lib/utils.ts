import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function capitalize(str: string) {
  return str.split(/\s+/).map(word => {
    return word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '';
  }).join(' ');
}