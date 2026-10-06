import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDashboardLayout from "@/component/UserDashboardLayout";

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth?mode=login");
  }

  if (session.user.role !== "USER") {
    redirect("/auth?mode=login");
  }

  return (
    <UserDashboardLayout session={session}>
      {children}
    </UserDashboardLayout>
  );
}