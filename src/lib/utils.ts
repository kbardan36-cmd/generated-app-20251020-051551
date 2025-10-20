import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getGreeting(): string {
  const greetings = [
    "Hello! How can I assist you today?",
    "Greetings! What can I help you with?",
    "Ready to explore? Ask me anything.",
    "Welcome! What's on your mind?",
    "Ask away! I'm here to help.",
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}