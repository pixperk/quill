'use client';

import { Suspense } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '../_trpc/client';
import { Loader2 } from 'lucide-react';

const PageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');

  const { data, error } = trpc.authCallback.useQuery(undefined, {
    retry: true,
    retryDelay: 500,
  });


    if (data) {
        router.push(origin ? `/${origin}/` : '/dashboard/');
      } else {
        return notFound()
      }
    

    if(error){
      if (error.data?.code === 'UNAUTHORIZED') {
        router.push('/sign-in')
      }
      else{
        return notFound()
      }
    }


  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected to your dashboard automatically.</p>
      </div>
    </div>
  );
};


const Page = () => {
  return <Suspense><PageContent/></Suspense>
}

export default Page;
