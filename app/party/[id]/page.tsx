import { getPartyDetails } from "@/lib/actions/party";
import { createClient } from "@/lib/supabase/server";
import { PartyStatusView } from "@/components/ui/PartyStatusView";
import { redirect } from "next/navigation";

export default async function PartyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let partyDetails;
  try {
    partyDetails = await getPartyDetails(id);
  } catch {
    redirect('/');
  }

  const { party, expense, splits } = partyDetails!;

  return (
    <PartyStatusView
      party={party}
      expense={expense}
      splits={splits}
      currentUserId={user!.id}
    />
  );
}
