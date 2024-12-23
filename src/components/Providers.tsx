"use client"

import { PropsWithChildren, useState } from "react"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import { trpc } from "@/app/_trpc/client"
import { httpBatchLink } from "@trpc/client"
import { absoluteUrl } from "@/lib/utils"
import { AuthProvider } from "@/components/AuthProvider"

const Providers = ({children} : PropsWithChildren) => {
    const [queryClient] = useState(()=>new QueryClient())
    const [trpcClient] = useState(()=>trpc.createClient({
        links : [
            httpBatchLink({
                url : absoluteUrl('/api/trpc')
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
