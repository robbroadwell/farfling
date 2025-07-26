"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FiltersPopover from "./FiltersPopover";
import shuffle from "lodash.shuffle";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentActivity = searchParams.get("activity");

  const [showPopover, setShowPopover] = useState(false);

  const [showAllCountries, setShowAllCountries] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const [activeFilterTab, setActiveFilterTab] = useState<"what" | "where" | "when" | null>("what");

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
    const activitySlug = activityName.toLowerCase().replace(/\s+/g, "-");
    const isActive = currentActivitySlug === activitySlug;
    // When deselecting, pass selectedCountry instead of null
    navigateWith(isActive ? null : activityName, isActive ? selectedCountry : selectedCountry);
  };

  const isMapVisible = typeof window !== "undefined" && window.location.hash.includes("map");

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
        <div className="flex gap-4">
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
          <div className="flex w-full items-center gap-4 mb-6 px-0">
            {/* WHAT Button or Chip */}
            {currentActivitySlug ? (
              <div className="flex-1 min-w-[0] relative">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black text-white text-base font-medium relative w-full"
                  onClick={() => setActiveFilterTab("what")}
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  aria-label="Show What filter options"
                >
                  {/* Activity emoji and name */}
                  {(() => {
                    const selectedActivity = activities.find(
                      a => a.name.toLowerCase().replace(/\s+/g, "-") === currentActivitySlug
                    );
                    return selectedActivity
                      ? (
                        <>
                          {selectedActivity.emoji && <span>{selectedActivity.emoji}</span>}
                          <span>{selectedActivity.name}</span>
                        </>
                      )
                      : <span>What</span>;
                  })()}
                  {/* Remove badge */}
                  <button
                    type="button"
                    aria-label="Remove activity filter"
                    className="absolute -top-2 -right-2 bg-white text-black w-5 h-5 rounded-full flex items-center justify-center text-xs border border-black shadow hover:bg-gray-100"
                    onClick={e => {
                      e.stopPropagation();
                      // Remove only activity, preserve country if selected (use "" to clear)
                      navigateWith(null, selectedCountry || "");
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
                className={`flex-1 min-w-[0] flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-100 text-base font-medium${activeFilterTab === "what" ? " !bg-gray-200" : ""}`}
              >
                What
              </button>
            )}
            {/* WHERE Button or Chip */}
            {currentCountrySlug ? (
              <div className="flex-1 min-w-[0] relative">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black text-white text-base font-medium relative w-full"
                  onClick={() => setActiveFilterTab("where")}
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  aria-label="Show Where filter options"
                >
                  {/* Country emoji and name */}
                  {(() => {
                    const selectedCountryObj = countries.find(
                      c => c.name.toLowerCase().replace(/\s+/g, "-") === currentCountrySlug
                    );
                    return selectedCountryObj
                      ? (
                        <>
                          {selectedCountryObj.emoji && <span>{selectedCountryObj.emoji}</span>}
                          <span>{selectedCountryObj.name}</span>
                        </>
                      )
                      : <span>Where</span>;
                  })()}
                  {/* Remove badge */}
                  <button
                    type="button"
                    aria-label="Remove country filter"
                    className="absolute -top-2 -right-2 bg-white text-black w-5 h-5 rounded-full flex items-center justify-center text-xs border border-black shadow hover:bg-gray-100"
                    onClick={e => {
                      e.stopPropagation();
                      // Remove only country, preserve activity if selected (use "" to clear)
                      navigateWith(currentActivity || "", null);
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
                onClick={() => setActiveFilterTab("where")}
                className={`flex-1 min-w-[0] flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-100 text-base font-medium${activeFilterTab === "where" ? " !bg-gray-200" : ""}`}
              >
                Where
              </button>
            )}
            {/* WHEN Button */}
            <button
              type="button"
              onClick={() => setActiveFilterTab("when")}
              className={`flex-1 min-w-[0] flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-100 text-base font-medium${activeFilterTab === "when" ? " !bg-gray-200" : ""}`}
            >
              When
            </button>
          </div>
          {activeFilterTab === "what" && (
            <div className="max-w-6xl mx-auto px-2 relative flex flex-wrap gap-2 max-h-[15rem] overflow-hidden">
              {(showAllActivities ? filteredActivities : filteredActivities.slice(0, 20)).map((item) => {
                const isActive = currentActivitySlug === item.name.toLowerCase().replace(/\s+/g, "-");
                return (
                  <button
                    key={`activity-${item.name}`}
                    onClick={() => {
                      const name = item.name;
                      const isActive = currentActivitySlug === name.toLowerCase().replace(/\s+/g, "-");
                      navigateWith(isActive ? null : name, selectedCountry);
                    }}
                    className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap font-semibold ${
                      isActive
                        ? "!bg-black !text-white !border-black"
                        : "bg-white text-black border-black"
                    }`}
                  >
                    {item.emoji ? `${item.emoji} ${item.name}` : item.name}
                  </button>
                );
              })}
              {filteredActivities.length > 20 && !showAllActivities && (
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent flex items-center justify-end pr-2">
                  <button
                    onClick={() => {
                      setShowAllActivities(true);
                      const url = new URL(window.location.href);
                      const hash = url.hash.replace(/^#/, "");
                      const parts = new Set(hash.match(/[a-z]+/gi) || []);
                      parts.add("expanded");
                      url.hash = "#" + Array.from(parts).join("");
                      window.history.replaceState(null, "", url.toString());
                    }}
                    className="text-sm px-3 py-1 border rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
                  >
                    More
                  </button>
                </div>
              )}
              {showAllActivities && (
                <button
                  onClick={() => {
                    setShowAllActivities(false);
                    const url = new URL(window.location.href);
                    const parts = new Set((url.hash.match(/[a-z]+/gi) || []).filter(Boolean));
                    parts.delete("expanded");
                    url.hash = parts.size > 0 ? `#${Array.from(parts).join("")}` : "";
                    window.history.replaceState(null, "", url.toString());
                  }}
                  className="px-3 py-1 text-sm border rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold"
                >
                  Collapse
                </button>
              )}
            </div>
          )}
          {activeFilterTab === "where" && (
            <div className="max-w-6xl mx-auto px-2 relative flex flex-wrap gap-2 max-h-[15rem] overflow-hidden">
              {(showAllCountries ? filteredCountries : filteredCountries.slice(0, 20)).map((item) => {
                const countrySlug = item.name.toLowerCase().replace(/\s+/g, "-");
                const isActive = currentCountrySlug === countrySlug;
                return (
                  <button
                    key={`country-${item.name}`}
                    onClick={() => {
                      const name = item.name;
                      const countrySlug = name.toLowerCase().replace(/\s+/g, "-");
                      const isActive = currentCountrySlug === countrySlug;
                      setSelectedCountry(isActive ? "" : name);
                      navigateWith(currentActivitySlug, isActive ? null : name);
                    }}
                    className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap font-semibold ${
                      isActive
                        ? "!bg-black !text-white !border-black"
                        : "bg-white text-black border-black"
                    }`}
                  >
                    {item.emoji ? `${item.emoji} ${item.name}` : item.name}
                  </button>
                );
              })}
              {filteredCountries.length > 20 && !showAllCountries && (
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent flex items-center justify-end pr-2">
                  <button
                    onClick={() => {
                      setShowAllCountries(true);
                      const url = new URL(window.location.href);
                      const hash = url.hash.replace(/^#/, "");
                      const parts = new Set(hash.match(/[a-z]+/gi) || []);
                      parts.add("expanded");
                      url.hash = "#" + Array.from(parts).join("");
                      window.history.replaceState(null, "", url.toString());
                    }}
                    className="text-sm px-3 py-1 border rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
                  >
                    More
                  </button>
                </div>
              )}
              {showAllCountries && (
                <button
                  onClick={() => {
                    setShowAllCountries(false);
                    const url = new URL(window.location.href);
                    const parts = new Set((url.hash.match(/[a-z]+/gi) || []).filter(Boolean));
                    parts.delete("expanded");
                    url.hash = parts.size > 0 ? `#${Array.from(parts).join("")}` : "";
                    window.history.replaceState(null, "", url.toString());
                  }}
                  className="px-3 py-1 text-sm border rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold"
                >
                  Collapse
                </button>
              )}
            </div>
          )}
          {activeFilterTab === "when" && (
            <div className="max-w-6xl mx-auto px-2 relative flex flex-wrap gap-2 max-h-[15rem] overflow-hidden">
              {/* Placeholder for 'when' filter content */}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}