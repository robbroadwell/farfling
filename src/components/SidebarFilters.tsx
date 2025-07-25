"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FiltersPopover from "./FiltersPopover";

type Activity = {
  name: string;
};

type Props = {
  activities: Activity[];
};

const COUNTRIES = ["USA", "France", "Japan", "Brazil", "New Zealand"];

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

export default function SidebarFilters({ activities }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});
  const [selectedCountry, setSelectedCountry] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentActivity = searchParams.get("activity");

  const [showPopover, setShowPopover] = useState(false);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) =>
      activity.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activities, searchQuery]);

  const navigateWith = (activityName: string | null, countryName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    const currentPath = window.location.pathname.split("/").filter(Boolean);
    const currentActivitySlug = currentPath.find(
      (segment) => !COUNTRIES.map((c) => c.toLowerCase().replace(/\s+/g, "-")).includes(segment)
    );
    const currentCountrySlug = currentPath.find((segment) =>
      COUNTRIES.map((c) => c.toLowerCase().replace(/\s+/g, "-")).includes(segment)
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

    router.push(`/${slugParts}?${params.toString()}`);
  };

  const currentPath = usePathSegments();

  const currentActivitySlug = useMemo(() => {
    if (currentPath.length === 2) return currentPath[0];
    if (currentPath.length === 1 && !COUNTRIES.map(c => c.toLowerCase().replace(/\s+/g, "-")).includes(currentPath[0])) {
      return currentPath[0];
    }
    return "";
  }, [currentPath]);

  const currentCountrySlug = useMemo(() => {
    if (currentPath.length === 2) return currentPath[1];
    if (currentPath.length === 1 && COUNTRIES.map(c => c.toLowerCase().replace(/\s+/g, "-")).includes(currentPath[0])) {
      return currentPath[0];
    }
    return "";
  }, [currentPath]);

  const handleClick = (activityName: string) => {
    const activitySlug = activityName.toLowerCase().replace(/\s+/g, "-");
    const isActive = currentActivitySlug === activitySlug;
    // When deselecting, pass selectedCountry instead of null
    navigateWith(isActive ? null : activityName, isActive ? selectedCountry : selectedCountry);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-0 pb-4">
      <div className="flex justify-between items-center">
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
      </div>

      <input
        type="text"
        placeholder="Search activities"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 rounded-md border border-gray-300 text-gray-900"
      />

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-800">Country</h3>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((country) => (
            <button
              key={country}
              onClick={() => {
                const countrySlug = country.toLowerCase().replace(/\s+/g, "-");
                const isActive = currentCountrySlug === countrySlug;
                setSelectedCountry(isActive ? "" : country);
                // When deselecting, pass currentActivitySlug instead of null
                navigateWith(isActive ? currentActivitySlug : currentActivitySlug, isActive ? null : country);
              }}
              className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap ${
                currentCountrySlug === country.toLowerCase().replace(/\s+/g, "-")
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

    <h3 className="text-sm font-semibold text-gray-800">Activity</h3>
      <div className="overflow-y-auto flex flex-wrap gap-2">
        {filteredActivities.map((activity) => (
          <button
            key={activity.name}
            onClick={() => handleClick(activity.name)}
            className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap ${
              currentActivitySlug === activity.name.toLowerCase().replace(/\s+/g, "-")
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
          >
            {activity.name}
          </button>
        ))}
      </div>
    </div>
  );
}