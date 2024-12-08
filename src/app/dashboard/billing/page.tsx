import { getUserSubscriptionPlan } from '@/lib/stripe'
import { FC } from 'react'
import BillingForm from './BillingForm'



const page: FC= async() => {
    const subscriptionPlan = await getUserSubscriptionPlan()
  return <BillingForm subscriptionPlan={subscriptionPlan}/>
}

export default page