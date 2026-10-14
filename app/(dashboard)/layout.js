import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDashboardLayout from "@/component/UserDashboardLayout";
import "@sjmc11/tourguidejs/src/scss/tour.scss";
export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth?mode=login");
  }

  return (
    <UserDashboardLayout session={session}>
      {children}
    </UserDashboardLayout>
  );
}