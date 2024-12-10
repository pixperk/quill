'use client'

import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { trpc } from '@/app/_trpc/client'
import { useToast } from '@/hooks/use-toast'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface BillingFormProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const BillingForm = ({ subscriptionPlan }: BillingFormProps) => {
  const { toast } = useToast()

  const { mutate: createStripeSession, isPending: isLoading } =
    trpc.createStripeSession.useMutation({
      onSuccess: ({ url }) => {
        if (url) {
          window.location.href = url
        } else {
          toast({
            title: 'There was a problem...',
            description: 'Please try again in a moment',
            variant: 'destructive',
          })
        }
      },
    })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createStripeSession()
  }

  return (
    <MaxWidthWrapper className="max-w-5xl">
      <form className="mt-12" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the{' '}
              <strong>{subscriptionPlan.name}</strong> plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button type="submit">
              {isLoading && (
                <Loader2 className="mr-4 h-4 w-4 animate-spin" />
              )}
              {subscriptionPlan.isSubscribed
                ? 'Manage Subscription'
                : 'Upgrade to PRO'}
            </Button>

            {subscriptionPlan.isSubscribed && (
              <p className="rounded-full text-xs font-medium">
                {subscriptionPlan.isCanceled
                  ? 'Your plan will be canceled on '
                  : 'Your plan renews on '}
                {format(
                  subscriptionPlan.stripeCurrentPeriodEnd!,
                  'dd.MM.yyyy'
                )}
                .
              </p>
            )}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  )
}

export default BillingForm

