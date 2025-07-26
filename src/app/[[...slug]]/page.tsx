import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

import SidebarFilters from "@/components/SidebarFilters";
import { headers } from "next/headers";
import ClientMapOverlay from "@/components/ClientMapOverlay";
import ActivityGrid from "@/components/ActivityGrid";

export default async function Home({ params }: { params: { slug?: string[] } }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: activities } = await supabase.from("activities").select("id, name");
  const { data: countries } = await supabase.from("countries").select("id, name");
  const searchParams = new URLSearchParams(headers().get("x-url")?.split("?")[1]);
  const slugParts = params.slug || [];
  const activitySlug = slugParts.find(part =>
    activities?.some(a => a.name.toLowerCase().replace(/\s+/g, "-") === part.toLowerCase())
  );
  const countrySlug = slugParts.find(part =>
    countries?.some(c => c.name.toLowerCase().replace(/\s+/g, "-") === part.toLowerCase())
  );

  let query = supabase
    .from("adventures")
    .select("*, activities(name), countries(name)");

  const activityMatch = activities?.find(a => a.name.toLowerCase().replace(/\s+/g, "-") === activitySlug?.toLowerCase());
  if (activityMatch) {
    query = query.eq("activity_id", activityMatch.id);
  }

  const countryMatch = countries?.find(c => c.name.toLowerCase().replace(/\s+/g, "-") === countrySlug?.toLowerCase());
  if (countryMatch) {
    query = query.eq("country_id", countryMatch.id);
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

  console.log(adventures);

  return (
    <main className="min-h-screen h-screen flex flex-col bg-neutral-100 w-full relative">
      <div id="content-wrapper" className="relative z-10 p-4">
        <div className="mb-6">
          <SidebarFilters activities={activities || []} countries={countries?.map(c => c.name) || []} />
        </div>
        <ActivityGrid adventures={adventures || []} />
      </div>
      <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
        <ClientMapOverlay adventures={adventures || []} />
      </div>
    </main>
  );
}
