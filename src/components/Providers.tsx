"use client"

import { trpc } from "@/app/_trpc/client"
import { AuthProvider } from "@/components/AuthProvider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { PropsWithChildren, useState } from "react"

const Providers = ({children} : PropsWithChildren) => {
    const [queryClient] = useState(()=>new QueryClient())
    const [trpcClient] = useState(()=>trpc.createClient({
        links : [
            httpBatchLink({
                url : `${process.env.PUBLIC_URL!}/api/trpc`
            })
        ]
    }))

    return (
       
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
            <AuthProvider>
            {children}
            </AuthProvider>
            </QueryClientProvider>
        </trpc.Provider>
       
    )
}

export default Providers
