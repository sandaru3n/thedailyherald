"use client";

import { useEffect, useState } from "react";
import ProgressBar from "@/components/ProgressBar";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
    
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="antialiased">
      <ProgressBar isLoading={isLoading} />
      {children}
    </div>
  );
}
