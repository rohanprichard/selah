import { notFound } from "next/navigation";

import { fetchSetlistByShareToken } from "@/lib/supabase/setlists";
import { SharedSetlistContent } from "@/components/setlists/shared-setlist-content";

type SharedSetlistPageProps = {
  params: Promise<{ token: string }>;
};

export default async function SharedSetlistPage({ params }: SharedSetlistPageProps) {
  const { token } = await params;
  const detail = await fetchSetlistByShareToken(token);

  if (!detail) {
    notFound();
  }

  return <SharedSetlistContent detail={detail} token={token} />;
}
