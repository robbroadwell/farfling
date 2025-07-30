"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
// import FiltersPopover from "./FiltersPopover";
import shuffle from "lodash.shuffle";
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });
import { useState, useMemo, useEffect } from "react";


type Activity = {
  name: string;
  emoji?: string;
};

type Country = {
  name: string;
  emoji?: string;
};

type Props = {
  activities: Activity[];
  countries: Country[];
  showMap: boolean;
};

function usePathSegments() {
  const [segments, setSegments] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.split("/").filter(Boolean);
      setSegments(path);
    }
  }, []);

  return segments;
}


export default function SidebarFilters({ activities, countries, showMap }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});
  const [selectedCountry, setSelectedCountry] = useState("");
  const [pendingActivity, setPendingActivity] = useState<string | null>(null);
  const [pendingCountry, setPendingCountry] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number>(0); // start with no radius selected
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentActivity = searchParams.get("activity");

  const [showPopover, setShowPopover] = useState(false);

  const [showAllCountries, setShowAllCountries] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const [activeFilterTab, setActiveFilterTab] = useState<"what" | "where" | "when" | null>("what");

  // --- Search bar state for top row search ---
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.includes("expanded")) {
        setShowAllActivities(true);
      }
    }
  }, []);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) =>
      activity.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activities, searchQuery]);

  const filteredCountries = useMemo(() => {
    return countries.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [countries, searchQuery]);

  const currentPath = usePathSegments();

  const currentActivitySlug = useMemo(() => {
    if (currentPath.length === 2) return currentPath[0];
    if (currentPath.length === 1 && !countries.map(c => c.name.toLowerCase().replace(/\s+/g, "-")).includes(currentPath[0])) {
      return currentPath[0];
    }
    return "";
  }, [currentPath, countries]);

  const currentCountrySlug = useMemo(() => {
    if (currentPath.length === 2) return currentPath[1];
    if (currentPath.length === 1 && countries.map(c => c.name.toLowerCase().replace(/\s+/g, "-")).includes(currentPath[0])) {
      return currentPath[0];
    }
    return "";
  }, [currentPath, countries]);

  const unifiedItems = useMemo(() => {
    const selectedItems = [];

    if (currentCountrySlug) {
      const selectedCountry = countries.find(
        c => c.name.toLowerCase().replace(/\s+/g, "-") === currentCountrySlug
      );
      if (selectedCountry) {
        selectedItems.push({ type: "country", name: selectedCountry.name, emoji: selectedCountry.emoji });
      }
    }

    if (currentActivitySlug) {
      const selectedActivity = activities.find(
        a => a.name.toLowerCase().replace(/\s+/g, "-") === currentActivitySlug
      );
      if (selectedActivity) {
        selectedItems.push({ type: "activity", name: selectedActivity.name, emoji: selectedActivity.emoji });
      }
    }

    const countryItems = filteredCountries.map((item) => ({
      type: "country",
      name: item.name,
      emoji: item.emoji,
    }));
    const activityItems = filteredActivities.map((item) => ({
      type: "activity",
      name: item.name,
      emoji: item.emoji,
    }));

    const combined = [...selectedItems, ...countryItems, ...activityItems];

    const seen = new Set();
    const deduped = combined.filter((item) => {
      const key = `${item.type}-${item.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return shuffle(deduped).sort((a, b) => {
      const aSelected =
        (a.type === "country" && currentCountrySlug === a.name.toLowerCase().replace(/\s+/g, "-")) ||
        (a.type === "activity" && currentActivitySlug === a.name.toLowerCase().replace(/\s+/g, "-"));
      const bSelected =
        (b.type === "country" && currentCountrySlug === b.name.toLowerCase().replace(/\s+/g, "-")) ||
        (b.type === "activity" && currentActivitySlug === b.name.toLowerCase().replace(/\s+/g, "-"));
      return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
    });
  }, [filteredCountries, filteredActivities, currentActivitySlug, currentCountrySlug, activities, countries]);

  const visibleItems = showAllActivities ? unifiedItems : unifiedItems.slice(0, 20);

  const navigateWith = (activityName: string | null, countryName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    // Always recompute slugs from the passed arguments, not from current path
    const nextActivitySlug =
      activityName !== null
        ? activityName.toLowerCase().replace(/\s+/g, "-")
        : "";
    const nextCountrySlug =
      countryName !== null
        ? countryName.toLowerCase().replace(/\s+/g, "-")
        : "";
    const slugParts = [nextActivitySlug, nextCountrySlug].filter(Boolean).join("/");

    const hashParts = [];
    if (showAllActivities) hashParts.push("expanded");
    if (showMap) hashParts.push("map");
    const hash = hashParts.length > 0 ? `#${hashParts.join("")}` : "";
    router.push(`/${slugParts}?${params.toString()}${hash}`);
  };


  const handleClick = (activityName: string) => {
    setPendingActivity((prev) =>
      prev === activityName ? null : activityName
    );
  };

  const isMapVisible = typeof window !== "undefined" && window.location.hash.includes("map");

  // Show selected radius as a WHERE chip if no country is selected
  const selectedRadiusDisplay = !currentCountrySlug && selectedRadius ? `🧭 ${selectedRadius} mi` : "Where?";

  // For top bar display logic, show pending selections if available
  const displayActivity = pendingActivity || currentActivitySlug;
  const displayCountry = pendingCountry || currentCountrySlug;

  return (
    <div className="bg-[#fffdf5] p-6">
      <header className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-lg font-bold text-black hover:opacity-80"
          aria-label="Home"
        >
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
        </button>
        <div className="flex gap-4 items-center">
          {/* SEARCH ICON BUTTON moved here, left of Log in */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center justify-center px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 cursor-pointer"
            type="button"
            aria-label="Search"
          >
            {searchOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <MagnifyingGlassIcon className="h-5 w-5" />
            )}
          </button>
          <button className="px-4 py-2 border border-black rounded-full text-black font-semibold hover:bg-gray-100">
            Log in
          </button>
          <button className="px-4 py-2 rounded-full bg-[#f3e9d1] text-black font-semibold hover:bg-[#e0d6b3]">
            Sign up
          </button>
        </div>
      </header>

      <section className="text-center w-full mb-6">
        <h1 className="text-4xl font-extrabold mb-6 text-black">Find an adventure companion</h1>
        <div className="w-full">
          {/* Top filter row with WHAT, WHERE, WHEN, and search icon, or search input if searchOpen */}
          <div className="w-full mb-6">
            {searchOpen ? (
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full px-4 py-3 mt-0 rounded-full border border-gray-300 text-black text-lg placeholder-gray-500 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-center px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  {searchOpen ? (
                    <XMarkIcon className="h-5 w-5" />
                  ) : (
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex w-full items-center gap-4 px-0">
                {/* WHAT Button or Chip */}
                {displayActivity ? (
                  <div className="flex-1 min-w-[0] relative">
                    <button
                      type="button"
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-base font-semibold relative w-full bg-[#153968] text-white border-[#153968]`}
                      onClick={() => setActiveFilterTab("what")}
                      tabIndex={0}
                      style={{ cursor: "pointer" }}
                      aria-label="Show What filter options"
                    >
                      {/* Activity emoji and name */}
                      {(() => {
                        const selectedActivityName = pendingActivity || currentActivitySlug;
                        const selectedActivity = activities.find(
                          a => a.name.toLowerCase().replace(/\s+/g, "-") === selectedActivityName?.toLowerCase().replace(/\s+/g, "-")
                        );
                        return selectedActivity
                          ? (
                            <>
                              {selectedActivity.emoji && <span>{selectedActivity.emoji}</span>}
                              <span>{selectedActivity.name}</span>
                            </>
                          )
                          : <span>What?</span>;
                      })()}
                      {/* Remove badge */}
                      <button
                        type="button"
                        aria-label="Remove activity filter"
                        className="absolute -top-2 -right-2 bg-white text-black w-5 h-5 rounded-full flex items-center justify-center text-xs border border-black shadow hover:bg-gray-100"
                        onClick={e => {
                          e.stopPropagation();
                          setPendingActivity(null);
                        }}
                        tabIndex={0}
                      >
                        ×
                      </button>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveFilterTab("what")}
                    className={`flex-1 min-w-[0] flex items-center justify-center gap-2 px-6 py-3 rounded-full text-base font-semibold border ${
                      activeFilterTab === "what" ? 'border-[#153968] text-[#153968] bg-white' : 'border-gray-300 text-gray-800 bg-white'
                    } hover:border-[#153968] hover:text-[#153968] hover:bg-white cursor-pointer transition-none`}
                  >
                    What?
                  </button>
                )}
                {/* WHERE Button or Chip */}
                {displayCountry ? (
                  <div className="flex-1 min-w-[0] relative">
                    <button
                      type="button"
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-base font-semibold relative w-full bg-[#153968] text-white border-[#153968]`}
                      onClick={() => setActiveFilterTab("where")}
                      tabIndex={0}
                      style={{ cursor: "pointer" }}
                      aria-label="Show Where filter options"
                    >
                      {/* Country emoji and name */}
                      {(() => {
                        const selectedCountryName = pendingCountry || currentCountrySlug;
                        const selectedCountryObj = countries.find(
                          c => c.name.toLowerCase().replace(/\s+/g, "-") === selectedCountryName?.toLowerCase().replace(/\s+/g, "-")
                        );
                        return selectedCountryObj
                          ? (
                            <>
                              {selectedCountryObj.emoji && <span>{selectedCountryObj.emoji}</span>}
                              <span>{selectedCountryObj.name}</span>
                            </>
                          )
                          : <span>Where?</span>;
                      })()}
                      {/* Remove badge */}
                      <button
                        type="button"
                        aria-label="Remove country filter"
                        className="absolute -top-2 -right-2 bg-white text-black w-5 h-5 rounded-full flex items-center justify-center text-xs border border-black shadow hover:bg-gray-100"
                        onClick={e => {
                          e.stopPropagation();
                          setPendingCountry(null);
                          setSelectedRadius(0);
                        }}
                        tabIndex={0}
                      >
                        ×
                      </button>
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 min-w-[0] relative">
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab("where")}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-base font-semibold relative w-full ${
                        selectedRadius > 0
                          ? 'bg-[#153968] text-white border-[#153968]'
                          : 'bg-white text-black border border-gray-300 hover:border-[#153968] hover:text-[#153968]'
                      } transition-none`}
                    >
                      <span>{selectedRadiusDisplay}</span>
                    </button>
                    {/* If a radius is selected (and no country), show a removable chip */}
                    {!currentCountrySlug && selectedRadius > 0 && (
                      <button
                        type="button"
                        aria-label="Remove radius filter"
                        className="absolute -top-2 -right-2 bg-white text-black w-5 h-5 rounded-full flex items-center justify-center text-xs border border-black shadow hover:bg-gray-100"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedRadius(0);
                        }}
                        tabIndex={0}
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
                {/* WHEN Button */}
                <button
                  type="button"
                  onClick={() => setActiveFilterTab("when")}
                  className={`flex-1 min-w-[0] flex items-center justify-center gap-2 px-6 py-3 rounded-full text-base font-semibold border border-[#153968] text-[#153968] hover:bg-white transition-none cursor-pointer`}
                >
                  When?
                </button>
                {/* GO BUTTON (green), replacing search icon button */}
                <button
                  className="flex items-center justify-center px-4 py-2 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition"
                  type="button"
                  onClick={() => {
                    navigateWith(pendingActivity, pendingCountry);
                    setPendingActivity(null);
                    setPendingCountry(null);
                  }}
                >
                  GO
                </button>
              </div>
            )}
          </div>
          {/* SEARCH BAR AND CHICKLETS */}
          {searchOpen && (
            <>
              {searchTerm && (() => {
                const combinedResults = [
                  ...activities.map((a) => ({ type: "activity", name: a.name, emoji: a.emoji })),
                  ...countries.map((c) => ({ type: "country", name: c.name, emoji: c.emoji })),
                ].filter((item) =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                return (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {combinedResults.map((item) => (
                      <button
                        key={`search-${item.type}-${item.name}`}
                        onClick={() => {
                          const name = item.name;
                          if (item.type === "activity") {
                            setPendingActivity((prev) => prev === name ? null : name);
                          } else if (item.type === "country") {
                            setPendingCountry((prev) => prev === name ? null : name);
                          }
                        }}
                        className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap font-semibold ${
                          (item.type === "activity" && currentActivitySlug === item.name.toLowerCase().replace(/\s+/g, "-")) ||
                          (item.type === "country" && currentCountrySlug === item.name.toLowerCase().replace(/\s+/g, "-"))
                            ? "bg-[#153968] text-white border-[#153968]"
                            : "bg-white text-black border-black"
                        }`}
                      >
                        {item.emoji ? `${item.emoji} ${item.name}` : item.name}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </>
          )}
          {!searchOpen && activeFilterTab === "what" && (
            <div className="max-w-6xl mx-auto px-2 relative flex flex-wrap gap-2">
              {filteredActivities.map((item) => {
                const isActive = (pendingActivity
                  ? pendingActivity === item.name
                  : currentActivitySlug === item.name.toLowerCase().replace(/\s+/g, "-"));
                return (
                  <button
                    key={`activity-${item.name}`}
                    onClick={() => {
                      setPendingActivity(
                        pendingActivity === item.name ? null : item.name
                      );
                    }}
                    className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap font-semibold ${
                      isActive
                        ? "bg-[#153968] text-white border-[#153968]"
                        : "bg-white text-black border-black"
                    }`}
                  >
                    {item.emoji ? `${item.emoji} ${item.name}` : item.name}
                  </button>
                );
              })}
            </div>
          )}
          {!searchOpen && activeFilterTab === "where" && (
            <>
              {/* "Near me" header */}
              <h2 className="text-lg font-bold text-black mb-2 px-2">Near me</h2>
              <div className="mb-4 relative w-full h-92 rounded-lg overflow-hidden border border-gray-300">
                {!("geolocation" in navigator) && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 text-white flex items-center justify-center z-10">
                    Location services not supported
                  </div>
                )}
                {!userLocation && (
                  <div
                    className="absolute inset-0 bg-black bg-opacity-50 text-white flex items-center justify-center cursor-pointer z-10"
                    onClick={async () => {
                      console.log("Clicked to request location");
                      console.log("Checking if navigator.geolocation is available:", !!navigator.geolocation);

                      if (!("geolocation" in navigator)) {
                        console.log("Geolocation not supported");
                        return;
                      }

                      try {
                        const permissionStatus = await navigator.permissions.query({ name: "geolocation" as PermissionName });
                        console.log("Permission state:", permissionStatus.state);

                        if (permissionStatus.state === "denied") {
                          alert("Location access denied. Please enable it in your browser settings.");
                          return;
                        }

                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            console.log("Position obtained:", pos);
                            console.log("Setting user location state:", { lat: pos.coords.latitude, lng: pos.coords.longitude });
                            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                          },
                          (err) => {
                            console.error("Geolocation error:", err);
                            console.log("Could not obtain location, error:", err);
                            alert("Unable to access your location. Please check your browser settings.");
                          }
                        );
                      } catch (err) {
                        console.error("Permission query failed:", err);
                      }
                    }}
                  >
                    Location permission required. Click to enable.
                  </div>
                )}
                {(
                  // Add a statement to log rendering of MapComponent with center and radius
                  console.log("Rendering MapComponent with center:", userLocation, "and radius:", selectedRadius),
                  <MapComponent
                    center={userLocation}
                    radius={selectedRadius}
                    onRadiusChange={(r) => {
                      setPendingCountry(null); // Clear country when radius is selected
                      setSelectedRadius(r);
                    }}
                    renderRadiusControlsAbove
                  />
                )}  
              </div>
              {/* "Or anywhere in the world" header */}
              <h2 className="text-lg font-bold text-black mt-6 mb-2 px-2">Or anywhere in the world</h2>
              <div className="max-w-6xl mx-auto px-2 relative flex flex-wrap gap-2">
                {filteredCountries.map((item) => {
                  const countrySlug = item.name.toLowerCase().replace(/\s+/g, "-");
                  const isActive = (pendingCountry
                    ? pendingCountry === item.name
                    : currentCountrySlug === countrySlug);
                  return (
                    <button
                      key={`country-${item.name}`}
                      onClick={() => {
                        setPendingCountry(pendingCountry === item.name ? null : item.name);
                        setSelectedRadius(0); // Clear radius when country is selected
                      }}
                      className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap font-semibold ${
                        isActive
                          ? "bg-[#153968] text-white border-[#153968]"
                          : "bg-white text-black border-black"
                      }`}
                    >
                      {item.emoji ? `${item.emoji} ${item.name}` : item.name}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {!searchOpen && activeFilterTab === "when" && (
            <div className="max-w-6xl mx-auto px-2 relative flex flex-wrap gap-2 max-h-[15rem] overflow-hidden">
              {/* Placeholder for 'when' filter content */}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}