"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/app/_trpc/client";

const UpgradeButton = () => {
  const { mutate: createStripeSession, isPending } = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url ?? "/dashboard/billing";
    },
  });

  return (
    <Button
      onClick={() => createStripeSession()}
      className="w-full flex items-center justify-center"
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
        </>
      )}
    </Button>
  );
};

export default UpgradeButton;
