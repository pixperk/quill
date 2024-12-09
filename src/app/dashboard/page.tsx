import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Dashboard from "./Dashboard";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { Button } from "@/components/ui/button";

const DashboardPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-50">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">Welcome to the Dashboard</h1>
        <p className="text-lg text-purple-600 mb-8">Please sign in to access your dashboard.</p>
        <Link href="/api/auth/login">
          <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  const dbUser = await db.user.findFirst({
    where: { id: user.id },
  });

  const subscriptionPlan = await getUserSubscriptionPlan();

  if (!dbUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-50">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">Account Setup Required</h1>
        <p className="text-lg text-purple-600 mb-8">Your account isn't fully set up yet. Let's complete the process!</p>
        <Link href="/auth-callback?origin=dashboard">
          <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-100">
            Complete Setup
          </Button>
        </Link>
      </div>
    );
  }

  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default DashboardPage;

