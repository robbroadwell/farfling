"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Filters = {
  [key: string]: string;
};

type FiltersPopoverProps = {
  onClose: () => void;
  onApply: (filters: Filters) => void;
};

export default function FiltersPopover({ onClose, onApply }: FiltersPopoverProps) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => {
    const initial: Filters = {};
    searchParams.forEach((value, key) => {
      initial[key] = value;
    });
    return initial;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-gray-200/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Popover Content */}
      <div className="relative bg-white/95 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
        <h2 className="text-2xl font-semibold mb-4">More Filters</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-medium mb-1 text-gray-800">Difficulty</label>
            <select
              value={filters["difficulty"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("difficulty", e.target.value)}
            >
              <option>Any</option>
              <option>Easy</option>
              <option>Moderate</option>
              <option>Hard</option>
              <option>Extreme</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Season</label>
            <select
              value={filters["season"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("season", e.target.value)}
            >
              <option>Any</option>
              <option>Spring</option>
              <option>Summer</option>
              <option>Fall</option>
              <option>Winter</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Duration</label>
            <select
              value={filters["duration"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("duration", e.target.value)}
            >
              <option>Any</option>
              <option>&lt; 1 hour</option>
              <option>1–3 hours</option>
              <option>Half day</option>
              <option>Full day</option>
              <option>Multi-day</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Group Size</label>
            <select
              value={filters["groupSize"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("groupSize", e.target.value)}
            >
              <option>Any</option>
              <option>Solo</option>
              <option>Couple</option>
              <option>Family</option>
              <option>Group</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Age Suitability</label>
            <select
              value={filters["ageSuitability"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("ageSuitability", e.target.value)}
            >
              <option>Any</option>
              <option>Kids</option>
              <option>Teens</option>
              <option>Adults</option>
              <option>Seniors</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Country</label>
            <input
              type="text"
              value={filters["country"] ?? ""}
              placeholder="e.g. Italy, Peru"
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("country", e.target.value)}
            />
          </div>

          {/* New filter blocks */}
          <div>
            <label className="block font-medium mb-1 text-gray-800">Price Range</label>
            <select
              value={filters["priceRange"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("priceRange", e.target.value)}
            >
              <option>Any</option>
              <option>Free</option>
              <option>Budget</option>
              <option>Mid-range</option>
              <option>Luxury</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Weather Preference</label>
            <select
              value={filters["weatherPreference"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("weatherPreference", e.target.value)}
            >
              <option>Any</option>
              <option>Sunny</option>
              <option>Cool</option>
              <option>Rainy</option>
              <option>Snowy</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Accessibility</label>
            <select
              value={filters["accessibility"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("accessibility", e.target.value)}
            >
              <option>Any</option>
              <option>Wheelchair Accessible</option>
              <option>Low Mobility Friendly</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Pet Friendly</label>
            <select
              value={filters["petFriendly"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("petFriendly", e.target.value)}
            >
              <option>Any</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Activity Type</label>
            <select
              value={filters["activityType"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("activityType", e.target.value)}
            >
              <option>Any</option>
              <option>Water</option>
              <option>Land</option>
              <option>Air</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Fitness Level</label>
            <select
              value={filters["fitnessLevel"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("fitnessLevel", e.target.value)}
            >
              <option>Any</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Equipment Required</label>
            <select
              value={filters["equipmentRequired"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("equipmentRequired", e.target.value)}
            >
              <option>Any</option>
              <option>No</option>
              <option>Yes - Provided</option>
              <option>Yes - Bring Your Own</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Indoor / Outdoor</label>
            <select
              value={filters["indoorOutdoor"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("indoorOutdoor", e.target.value)}
            >
              <option>Any</option>
              <option>Indoor</option>
              <option>Outdoor</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Language</label>
            <select
              value={filters["language"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("language", e.target.value)}
            >
              <option>Any</option>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-800">Instructor Availability</label>
            <select
              value={filters["instructorAvailability"] ?? "Any"}
              className="w-full border p-2 rounded bg-white text-gray-900"
              onChange={(e) => handleChange("instructorAvailability", e.target.value)}
            >
              <option>Any</option>
              <option>Required</option>
              <option>Optional</option>
              <option>Not Available</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(
                  ([_, value]) => value && value.toLowerCase() !== "any"
                )
              );
              onApply(activeFilters);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}