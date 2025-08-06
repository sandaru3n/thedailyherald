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
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return (
    <div className="antialiased">
      <ProgressBar isLoading={isLoading} />
      {children}
    </div>
  );
}
