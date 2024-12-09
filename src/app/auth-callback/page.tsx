'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '../_trpc/client';
import { Loader2 } from 'lucide-react';

const PageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');

  const { data } = trpc.authCallback.useQuery(undefined, {
    retry: true,
    retryDelay: 500,
  });

  useEffect(() => {
    if (data) {
      if (data.success) {
        router.push(origin ? `/${origin}/` : '/dashboard/');
      } else {
        router.push('/api/auth/login?post_login_redirect_url=/dashboard/');
      }
    }
    else{
      router.push('/api/auth/login?post_login_redirect_url=/dashboard/');
    }
  }, [data, origin, router]);

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
