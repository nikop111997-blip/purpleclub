import GuestRegisterClient from "@/component/GuestRegisterClient";

export default async function GuestRegisterPage({ params }) {
  const { token } = await params;
console.log("GuestRegisterPage token:", token);
  return <GuestRegisterClient token={token} />;
}