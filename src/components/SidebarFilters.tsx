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

export default function SidebarFilters({ activities }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentActivity = searchParams.get("activity");

  const [showPopover, setShowPopover] = useState(false);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) =>
      activity.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activities, searchQuery]);

  const handleClick = (activityName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("activity") === activityName) {
      params.delete("activity");
    } else {
      params.set("activity", activityName);
    }
    router.push(`/?${params.toString()}`);
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

              // Clear all existing filter params before applying new ones
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