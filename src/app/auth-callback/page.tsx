'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '../_trpc/client';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const Page = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');

  const { mutate, isPending, isError } = trpc.authCallback.useMutation({
    onSuccess: ({ success }) => {
      if (success) {
        // User is synced to the database
        router.push(origin ? `/${origin}` : '/dashboard');
      }
    },
    onError: (err) => {
      if (err.data?.code === 'UNAUTHORIZED') {
        router.push('/sign-in');
      } else {
        console.error('An unexpected error occurred:', err);
      }
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  if (isPending) {
    return (
      <div className="w-full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <h3 className="font-semibold text-xl">Setting up your account...</h3>
          <p>You will be redirected automatically.</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-semibold text-xl text-red-500">An error occurred!</h3>
          <p className="text-gray-700">We couldn't set up your account. Please try again.</p>
          <button
            className="px-4 py-2 mt-4 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            onClick={() => mutate()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <h3 className="font-semibold text-xl text-green-700">
          Redirecting to your dashboard...
        </h3>
        <p className="text-gray-600">
          Hang tight! We're preparing everything for you.
        </p>
      </div>
    </div>
  );
};

export default Page;
