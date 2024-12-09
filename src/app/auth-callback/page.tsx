'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '../_trpc/client';
import { Loader2 } from 'lucide-react';
import { Suspense, useEffect } from 'react';

const PageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');

  const { mutate, isPending, isError, isSuccess } = trpc.authCallback.useMutation({
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

  // Trigger the mutation when the component mounts
  useEffect(() => {
    mutate();
  }, [mutate]);

  if (isPending) {
    return (
      <div className="w-full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <h3 className="font-semibold text-xl">Setting up your account...</h3>
          <p className="text-gray-600">You will be redirected automatically.</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-semibold text-xl text-red-500">An error occurred!</h3>
          <p className="text-gray-700">We couldn&apos;t set up your account. Please try again.</p>
          <button
            className="px-4 py-2 mt-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            onClick={() => mutate()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <h3 className="font-semibold text-xl text-green-700">
            Redirecting to your dashboard...
          </h3>
          <p className="text-gray-600">
            Hang tight! We&apos;re preparing everything for you.
          </p>
        </div>
      </div>
    );
  }

  // This shouldn't be reached, but it's good to have a fallback
  return null;
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;

