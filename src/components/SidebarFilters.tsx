"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FiltersPopover from "./FiltersPopover";
import shuffle from "lodash.shuffle";

type Activity = {
  name: string;
};

type Props = {
  activities: Activity[];
  countries: string[];
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
      country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [countries, searchQuery]);

  const currentPath = usePathSegments();

  const currentActivitySlug = useMemo(() => {
    if (currentPath.length === 2) return currentPath[0];
    if (currentPath.length === 1 && !countries.map(c => c.toLowerCase().replace(/\s+/g, "-")).includes(currentPath[0])) {
      return currentPath[0];
    }
    return "";
  }, [currentPath, countries]);

  const currentCountrySlug = useMemo(() => {
    if (currentPath.length === 2) return currentPath[1];
    if (currentPath.length === 1 && countries.map(c => c.toLowerCase().replace(/\s+/g, "-")).includes(currentPath[0])) {
      return currentPath[0];
    }
    return "";
  }, [currentPath, countries]);

  const unifiedItems = useMemo(() => {
    const selectedItems = [];

    if (currentCountrySlug) {
      const selectedCountry = countries.find(
        c => c.toLowerCase().replace(/\s+/g, "-") === currentCountrySlug
      );
      if (selectedCountry) {
        selectedItems.push({ type: "country", name: selectedCountry });
      }
    }

    if (currentActivitySlug) {
      const selectedActivity = activities.find(
        a => a.name.toLowerCase().replace(/\s+/g, "-") === currentActivitySlug
      );
      if (selectedActivity) {
        selectedItems.push({ type: "activity", name: selectedActivity.name });
      }
    }

    const countryItems = filteredCountries.map((name) => ({ type: "country", name }));
    const activityItems = filteredActivities.map((item) => ({ type: "activity", name: item.name }));

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

    const currentPath = window.location.pathname.split("/").filter(Boolean);
    const currentActivitySlug = currentPath.find(
      (segment) => !countries.map((c) => c.toLowerCase().replace(/\s+/g, "-")).includes(segment)
    );
    const currentCountrySlug = currentPath.find((segment) =>
      countries.map((c) => c.toLowerCase().replace(/\s+/g, "-")).includes(segment)
    );

    const nextActivitySlug = activityName
      ? activityName.toLowerCase().replace(/\s+/g, "-")
      : currentActivitySlug;

    const nextCountrySlug = countryName
      ? countryName.toLowerCase().replace(/\s+/g, "-")
      : currentCountrySlug;

    const finalActivitySlug =
      nextActivitySlug === currentActivitySlug && activityName ? "" : nextActivitySlug;
    const finalCountrySlug =
      nextCountrySlug === currentCountrySlug && countryName ? "" : nextCountrySlug;

    const slugParts = [finalActivitySlug, finalCountrySlug].filter(Boolean).join("/");

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
    <div className="flex flex-col gap-4 px-4 pt-0 pb-4">
      <div className="flex items-center justify-between gap-4 pt-4 px-4">
        <button
          onClick={() => router.push("/")}
          className="text-xl font-bold text-gray-800 hover:text-green-600 transition-colors"
        >
          🌍 Logo
        </button>
        <div className="flex-1 max-w-6xl mx-auto flex items-center gap-2">
          <input
            type="text"
            placeholder="Search activities or countries"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-2 rounded-md border border-gray-300 text-gray-900"
          />
          <button
            className="relative text-sm px-3 py-1 border rounded bg-white hover:bg-gray-100 text-gray-800 font-semibold"
            onClick={() => setShowPopover(true)}
          >
            Filters
            {searchParams && Array.from(searchParams.entries()).filter(([_, value]) => value && value.toLowerCase() !== "any").length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {Array.from(searchParams.entries()).filter(([_, value]) => value && value.toLowerCase() !== "any").length}
              </span>
            )}
          </button>
          <button
            className="text-sm px-3 py-1 border rounded bg-white hover:bg-gray-100 text-gray-800 font-semibold"
            onClick={() => {
              const url = new URL(window.location.href);
              const hasMap = url.hash.includes("map");

              const newHash = url.hash
                .replace("map", "")
                .replace(/#+$/, "")
                .replace(/^#+/, "#")
                .replace("##", "#");

              url.hash = hasMap ? newHash : (newHash === "#" || newHash === "" ? "#map" : `${newHash}map`);
              window.history.replaceState(null, "", url.toString());
            }}
          >
            {isMapVisible ? "View as List" : "View on Map"}
          </button>
        </div>
        <div className="text-sm text-gray-600">👤 Account</div>
      </div>

      {showPopover && (
        <FiltersPopover
          onClose={() => setShowPopover(false)}
          onApply={(filters) => {
            setShowPopover(false);
            setAppliedFilters(filters);
            const params = new URLSearchParams();

            let nextActivitySlug = currentActivitySlug;
            let nextCountrySlug = currentCountrySlug;

            Object.entries(filters).forEach(([key, value]) => {
              if (value && value.toLowerCase() !== "any") {
                params.set(key, value);
                if (key === "activity") {
                  nextActivitySlug = value.toLowerCase().replace(/\s+/g, "-");
                }
                if (key === "country") {
                  nextCountrySlug = value.toLowerCase().replace(/\s+/g, "-");
                }
              }
            });

            const slugParts = [nextActivitySlug, nextCountrySlug].filter(Boolean).join("/");
            router.push(`/${slugParts}?${params.toString()}`);
          }}
        />
      )}

      <div className={`w-full max-w-full flex gap-2 relative ${showAllActivities ? 'flex-wrap overflow-visible whitespace-normal' : 'overflow-hidden whitespace-nowrap'}`}>
        {visibleItems.map((item) => (
          <button
            key={`${item.type}-${item.name}`}
            onClick={() => {
              const name = item.name;
              if (item.type === "country") {
                const countrySlug = name.toLowerCase().replace(/\s+/g, "-");
                const isActive = currentCountrySlug === countrySlug;
                setSelectedCountry(isActive ? "" : name);
                navigateWith(currentActivitySlug, isActive ? null : name);
              } else {
                const isActive = currentActivitySlug === name.toLowerCase().replace(/\s+/g, "-");
                navigateWith(isActive ? null : name, selectedCountry);
              }
            }}
            className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap ${
              item.type === "country" && currentCountrySlug === item.name.toLowerCase().replace(/\s+/g, "-")
                ? "bg-red-600 text-white border-red-600"
                : item.type === "activity" && currentActivitySlug === item.name.toLowerCase().replace(/\s+/g, "-")
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
          >
            {item.name}
          </button>
        ))}
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
        {unifiedItems.length > 20 && !showAllActivities && (
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
      </div>
    </div>
  );
}