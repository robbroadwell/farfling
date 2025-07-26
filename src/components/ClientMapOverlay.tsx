"use client";
import MapViewClient from "@/components/MapViewClient";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ClientMapOverlay({ adventures }: { adventures: any[] }) {
  const [showMap, setShowMap] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const checkHash = () => {
    if (typeof window === "undefined") return;
    setShowMap(window.location.hash.includes("map"));
  };

  useEffect(() => {
    checkHash(); // immediate check on mount
    window.addEventListener("hashchange", checkHash);
    return () => {
      window.removeEventListener("hashchange", checkHash);
    };
  }, []);

  useEffect(() => {
    checkHash(); // check on navigation
  }, [pathname, searchParams]);

  if (!showMap) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-0">
      <MapViewClient adventures={adventures} />
    </div>
  );
}

export default ClientMapOverlay;