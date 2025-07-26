import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

import SidebarFilters from "@/components/SidebarFilters";
import { headers } from "next/headers";
import ClientMapOverlay from "@/components/ClientMapOverlay";
import ActivityGrid from "@/components/ActivityGrid";

export default async function Home({ params }: { params: { slug?: string[] } }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: activities } = await supabase.from("activities").select("id, name, emoji");
  const { data: countries } = await supabase.from("countries").select("id, name, emoji");
  const searchParams = new URLSearchParams(headers().get("x-url")?.split("?")[1]);
  const slugParts = params.slug || [];
  const activitySlug = slugParts.find(part =>
    activities?.some(a => a.name.toLowerCase().replace(/\s+/g, "-") === part.toLowerCase())
  );
  const countrySlug = slugParts.find(part =>
    countries?.some(c => c.name.toLowerCase().replace(/\s+/g, "-") === part.toLowerCase())
  );

  const activityMatch = activities?.find(a => a.name.toLowerCase().replace(/\s+/g, "-") === activitySlug?.toLowerCase());
  const countryMatch = countries?.find(c => c.name.toLowerCase().replace(/\s+/g, "-") === countrySlug?.toLowerCase());

  const durationFilter = searchParams.get("duration");
  const ageFilter = searchParams.get("age");
  const strenuousnessFilter = searchParams.get("strenuousness");

  if (!activityMatch && !countryMatch && !durationFilter && !ageFilter && !strenuousnessFilter) {
    return (
      <main className="min-h-screen flex flex-col bg-white w-full relative">
        <div id="content-wrapper" className="relative z-10 p-4">
          <div className="mb-6">
            <SidebarFilters activities={activities || []} countries={countries || []} />
          </div>
          <ActivityGrid adventures={[]} />
        </div>
      </main>
    );
  }

  let query = supabase
    .from("adventures")
    .select("*, activities(name), countries(name)");

  if (activityMatch) {
    query = query.eq("activity_id", activityMatch.id);
  }

  if (countryMatch) {
    query = query.eq("country_id", countryMatch.id);
  }

  if (durationFilter === "short") {
    query = query.lte("duration_hours", 3);
  } else if (durationFilter === "medium") {
    query = query.gte("duration_hours", 3).lte("duration_hours", 6);
  } else if (durationFilter === "long") {
    query = query.gte("duration_hours", 6);
  }

  if (ageFilter) {
    query = query.eq("recommended_age", ageFilter);
  }

  if (strenuousnessFilter) {
    query = query.eq("strenuousness", strenuousnessFilter);
  }

  const { data: adventures } = await query;

  console.log(adventures);

  return (
    <main className="min-h-screen flex flex-col bg-white w-full relative">
      <div id="content-wrapper" className="relative z-10 p-4">
        <div className="mb-6">
          <SidebarFilters activities={activities || []} countries={countries || []} />
        </div>
        <ActivityGrid adventures={adventures || []} />
      </div>
    </main>
  );
}
