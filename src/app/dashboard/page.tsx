import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Dashboard from "./Dashboard";
import { getUserSubscriptionPlan } from "@/lib/stripe";



const page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect("/api/auth/login?post_login_redirect_url=/dashboard");

  const dbUser = await db.user.findFirst({
    where: { id: user.id },
  });

  const subscriptionPlan = await getUserSubscriptionPlan()

  if(!dbUser) redirect("/auth-callback?origin-dashboard");

  return <Dashboard subscriptionPlan={subscriptionPlan}/>


};

export default page;
