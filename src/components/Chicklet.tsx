

import React from "react";

type Props = {
  name: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  large?: boolean;
};

export default function Chicklet({
  name,
  selected = false,
  onClick,
  onRemove,
  large = false,
}: Props) {
  return (
    <div
      className={`relative inline-flex items-center rounded-full px-4 py-2 text-sm border ${
        selected
          ? "bg-black text-white border-black"
          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
      } ${large ? "text-base px-5 py-2.5" : ""} cursor-pointer`}
      onClick={onClick}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 bg-white text-black border border-gray-300 rounded-full p-1 text-xs leading-none hover:bg-gray-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}