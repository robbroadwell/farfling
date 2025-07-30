// Minimal MapComponent for demonstration; replace with real map implementation as needed
export default function MapComponent({
  center,
  radius,
  onRadiusChange,
}: {
  center: { lat: number; lng: number } | null;
  radius: number;
  onRadiusChange: (r: number) => void;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 relative">
      <div className="w-full h-40 bg-gray-300 flex items-center justify-center rounded mb-2">
        {center ? (
          <span>
            Map: lat {center.lat.toFixed(4)}, lng {center.lng.toFixed(4)}, radius {radius} mi
          </span>
        ) : (
          <span>Map will appear here</span>
        )}
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {[5, 10, 20, 30, 50, 100, 200].map((r) => (
          <button
            key={r}
            className={`px-3 py-1 rounded-full border text-sm font-semibold ${
              radius === r ? "bg-black text-white border-black" : "bg-white text-black border-gray-400"
            }`}
            onClick={() => onRadiusChange(r)}
          >
            🧭 {r} mi
          </button>
        ))}
      </div>
    </div>
  );
}