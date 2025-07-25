"use client";
import dynamic from "next/dynamic";
import { type Adventure } from "./MapView"; // reuse the type if needed

const DynamicMapView = dynamic(() => import("./MapView"), { ssr: false });

export default function MapViewClient({ adventures }: { adventures: Adventure[] }) {
  return <DynamicMapView adventures={adventures} />;
}