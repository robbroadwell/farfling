import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

import SidebarFilters from "@/components/SidebarFilters";
import { headers } from "next/headers";
import ClientMapOverlay from "@/components/ClientMapOverlay";

export default async function Home({ params }: { params: { slug?: string[] } }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: activities } = await supabase.from("activities").select("name");
  const searchParams = new URLSearchParams(headers().get("x-url")?.split("?")[1]);
  const slugParts = params.slug || [];
  const [activitySlug, countrySlug] = slugParts;

  let query = supabase
    .from("adventures")
    .select("*, activities(adventure_activities(*), name)");

  if (activitySlug) {
    query = query.contains("activities.name", [activitySlug]);
  }

  if (countrySlug) {
    query = query.ilike("location", `%${countrySlug}%`);
  }

  const durationFilter = searchParams.get("duration");
  if (durationFilter === "short") {
    query = query.lte("duration_hours", 3);
  } else if (durationFilter === "medium") {
    query = query.gte("duration_hours", 3).lte("duration_hours", 6);
  } else if (durationFilter === "long") {
    query = query.gte("duration_hours", 6);
  }

  const ageFilter = searchParams.get("age");
  if (ageFilter) {
    query = query.eq("recommended_age", ageFilter);
  }

  const strenuousnessFilter = searchParams.get("strenuousness");
  if (strenuousnessFilter) {
    query = query.eq("strenuousness", strenuousnessFilter);
  }

  const { data: adventures } = await query;

  return (
    <main className="min-h-screen h-screen flex flex-col bg-neutral-100 w-full relative">
      <div id="content-wrapper" className="relative z-10 p-4">
        <div className="mb-6">
          <SidebarFilters activities={activities || []} />
        </div>
        <div
          id="adventure-list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 z-0"
          style={{ display: typeof window !== "undefined" && window.location.hash.includes("map") ? "none" : undefined }}
        >
          {adventures?.map((adventure) => (
            <div
              key={adventure.id}
              className="rounded-lg overflow-hidden shadow bg-white"
            >
              <img
                src={adventure.image_url || "/default.jpg"}
                alt={adventure.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{adventure.title}</h2>
                <p className="text-sm text-gray-500">{adventure.location}</p>
                <p className="text-sm text-gray-700 mt-2">{adventure.created_by}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
        <ClientMapOverlay adventures={adventures || []} />
      </div>
    </main>
  );
}
