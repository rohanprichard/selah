import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { AuthSetlistContent } from "@/components/setlists/auth-setlist-content";
import { createClient } from "@/lib/supabase/server";
import { fetchSetlistForEditing } from "@/lib/supabase/setlists";

type SetlistPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SetlistDetailPage({ params }: SetlistPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/setlists/${id}`);
  }

  let detail;
  try {
    detail = await fetchSetlistForEditing(id);
  } catch (error) {
    console.error(error);
    notFound();
  }

  if (!detail) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? (host ? `${protocol}://${host}` : "http://localhost:3000");

  const shareUrl = `${baseUrl}/s/${detail.setlist.share_token}`;

  return <AuthSetlistContent detail={detail} shareUrl={shareUrl} />;
}
