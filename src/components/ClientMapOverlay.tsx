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
    const hasMap = window.location.hash.includes("map");
    setShowMap(hasMap);

    if (hasMap) {
      document.body.classList.add("show-map");
    } else {
      document.body.classList.remove("show-map");
    }
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