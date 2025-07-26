import { Database } from "@/types/supabase";

type Adventure = Database["public"]["Tables"]["adventures"]["Row"] & {
  activities?: { name: string }[];
};

export default function ActivityGrid({ adventures }: { adventures: Adventure[] }) {
  return (
    <div
      id="adventure-list"
      className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 w-full"
    >
      {adventures.map((adventure, index) => {
        const heightClass = Math.floor(index / 5) % 2 === 0 ? "h-[320px]" : "h-[280px]";

        return (
          <div key={adventure.id} className="mb-4 break-inside-avoid">
            <div className="w-full rounded-lg overflow-hidden shadow bg-white group cursor-pointer transition-transform duration-200">
              <div className={`relative w-full ${heightClass}`}>
                <img
                  src={adventure.image_url || "/default.jpg"}
                  alt={adventure.title}
                  className="w-full h-full object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                  <h2 className="text-md font-semibold">{adventure.title}</h2>
                  <p className="text-xs">{adventure.location}</p>
                  <p className="text-xs mt-1">{adventure.created_by}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}