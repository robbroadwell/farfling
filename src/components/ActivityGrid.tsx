import { Database } from "@/types/supabase";
import Image from 'next/image';

type Adventure = Database["public"]["Tables"]["adventures"]["Row"] & {
  activities?: { name: string }[];
};

export default function ActivityGrid({ adventures }: { adventures: Adventure[] }) {
  return (
    <div
      id="adventure-list"
      className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 w-full bg-white"
    >
      {adventures.map((adventure, index) => {
        const heightClass = Math.floor(index / 5) % 2 === 0 ? "h-[320px]" : "h-[280px]";

        return (
          <div key={adventure.id} className="mb-4 break-inside-avoid">
            <div className="w-full rounded-lg overflow-hidden shadow bg-white group cursor-pointer transition-transform transition-shadow duration-200 border border-transparent hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-[1.03]">
              <div className={`relative w-full ${heightClass}`}>
                <Image
                    src={adventure.image_url  + '?w=400&auto=format&q=60' || "/default.jpg"}
                    alt={adventure.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover rounded-lg"
                    placeholder="blur"
                    blurDataURL="/tiny/placeholder.jpg" // optional
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