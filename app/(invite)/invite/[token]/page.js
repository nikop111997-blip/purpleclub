import GuestInviteClient from "@/component/GuestInviteClient";

export default async function InvitePage({ params }) {
  const { token } = await params;

  return <GuestInviteClient token={token} />;
}