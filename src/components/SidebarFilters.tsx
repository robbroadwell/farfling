"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FiltersPopover from "./FiltersPopover";

type Activity = {
  name: string;
};

type Props = {
  activities: Activity[];
};

const COUNTRIES = ["USA", "France", "Japan", "Brazil", "New Zealand"];

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

    // Get current path segments from URL
    const currentPath = window.location.pathname.split("/").filter(Boolean);
    let currentActivitySlug = "";
    let currentCountrySlug = "";

    if (currentPath.length === 2) {
      [currentActivitySlug, currentCountrySlug] = currentPath;
    } else if (currentPath.length === 1) {
      if (COUNTRIES.map(c => c.toLowerCase().replace(/\s+/g, "-")).includes(currentPath[0])) {
        currentCountrySlug = currentPath[0];
      } else {
        currentActivitySlug = currentPath[0];
      }
    }

    const activitySlug = activityName
      ? activityName.toLowerCase().replace(/\s+/g, "-")
      : currentActivitySlug;
    const countrySlug = countryName
      ? countryName.toLowerCase().replace(/\s+/g, "-")
      : currentCountrySlug;

    const slugParts = [activitySlug, countrySlug].filter(Boolean).join("/");
    router.push(`/${slugParts}?${params.toString()}`);
  };

  const handleClick = (activityName: string) => {
    setSelectedCountry(selectedCountry); // preserve selected country
    navigateWith(activityName, selectedCountry);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-0 pb-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Activities</h2>
        <button
          className="relative text-sm px-3 py-1 border rounded bg-white hover:bg-gray-100 text-gray-800 font-semibold"
          onClick={() => setShowPopover(true)}
        >
          Filters
          {Object.keys(appliedFilters).length > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.keys(appliedFilters).length}
            </span>
          )}
        </button>
        {showPopover && (
          <FiltersPopover
            onClose={() => setShowPopover(false)}
            onApply={(filters) => {
              setShowPopover(false);
              setAppliedFilters(filters);
              const params = new URLSearchParams(searchParams.toString());

              Object.keys(filters).forEach((key) => {
                if (filters[key]) {
                  params.set(key, filters[key]);
                } else {
                  params.delete(key);
                }
              });

              router.push(`/?${params.toString()}`);
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
                setSelectedCountry(country);
                navigateWith(searchParams.get("activity"), country);
              }}
              className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap ${
                selectedCountry === country
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto flex flex-wrap gap-2">
        {filteredActivities.map((activity) => (
          <button
            key={activity.name}
            onClick={() => handleClick(activity.name)}
            className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap ${
              activity.name === currentActivity
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