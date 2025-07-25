'use client';

import { useState, useEffect } from 'react';

interface TopBarFiltersProps {
  selectedFilters: Record<string, string>;
  onToggle: () => void;
  showAdvanced: boolean;
  setShowAdvanced: (val: boolean) => void;
  onApply: (filters: Record<string, string>) => void;
}

export default function TopBarFilters({
  selectedFilters,
  onToggle,
  showAdvanced,
  setShowAdvanced,
  onApply,
}: TopBarFiltersProps) {
  const [filterSelections, setFilterSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    setFilterSelections(selectedFilters);
  }, [selectedFilters]);

  const selectedCount = Object.values(filterSelections).filter(Boolean).length;

  return (
    <>
      <div className="w-full bg-white px-4 py-2 border-b border-gray-200 flex items-center gap-4 overflow-x-auto whitespace-nowrap">
        {Object.entries(selectedFilters).map(([key, value]) => (
          <span
            key={key}
            className="text-sm text-gray-800 bg-gray-100 px-3 py-1 rounded-full"
          >
            {key}: {value}
          </span>
        ))}

        <button
          onClick={() => onApply(filterSelections)}
          className="relative text-sm px-4 py-2 border rounded bg-white hover:bg-gray-100 text-gray-800 font-semibold"
        >
          Filters
          {selectedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedCount}
            </span>
          )}
        </button>
      </div>

      {showAdvanced && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/95 p-[50px] w-[90vw] h-[80vh] max-w-4xl rounded-lg overflow-y-auto transition-opacity duration-300 ease-in-out">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  onApply(filterSelections);
                  setShowAdvanced(false);
                }}
                className="text-sm px-4 py-2 border rounded bg-white hover:bg-gray-100 text-gray-800 font-semibold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {[
                'Season',
                'Group Size',
                'Accessibility',
                'Budget',
                'Weather Preference',
                'Kid Friendly',
                'Pet Friendly',
                'Language',
                'Guide Availability',
                'Lodging Included',
                'Meals Included',
                'Transportation Included',
                'Required Fitness Level',
                'Travel Insurance Required',
                'Risk Level',
                'Equipment Included',
                'Skill Level',
                'Experience Required',
                'Remote Location',
                'Urban Access',
                'Cultural Immersion',
                'Environmental Impact',
                'Wi-Fi Availability',
                'Solo Friendly',
                'Couples Friendly',
                'Family Friendly',
                'Photography Friendly',
                'Duration Range',
                'Age Range',
                'Climate',
              ].map((filter, i) => (
                <label key={i} className="text-sm font-medium text-gray-700">
                  {filter}:
                  <select
                    className="ml-2 mt-1 px-2 py-1 border rounded text-sm w-full"
                    value={filterSelections[filter] || ''}
                    onChange={(e) =>
                      setFilterSelections((prev) => ({ ...prev, [filter]: e.target.value }))
                    }
                  >
                    <option value="">Any</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}