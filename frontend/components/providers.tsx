"use client"

import { SWRConfig } from "swr"
import { AuthProvider } from "@/lib/auth"
import { ToastProvider } from "@/components/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </SWRConfig>
  )
}
