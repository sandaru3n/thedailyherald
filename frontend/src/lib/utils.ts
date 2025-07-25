import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchArticlesByCategory(
  category: string,
  page: number = 1,
  limit: number = 10
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = `${apiUrl}/api/articles?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`;
    
    console.log('Fetching articles from:', url);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Articles response:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    throw error;
  }
}
