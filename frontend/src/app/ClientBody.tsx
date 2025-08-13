"use client";

import { useEffect, useState } from "react";
import ProgressBar from "@/components/ProgressBar";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  // Remove any extension-added classes during hydration
  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      // This runs only on the client after hydration
      if (document.body) {
        document.body.className = "antialiased";
      }
    } catch (error) {
      console.warn('Error setting body class:', error);
    }
  }, []);

  return (
    <div className="antialiased">
      {children}
    </div>
  );
}
