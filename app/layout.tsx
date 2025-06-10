import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { InspectionProvider } from "@/hooks/use-inspection"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Crack Capture",
  description: "Document structural issues and defects",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased")}>
        <AuthProvider>
          <InspectionProvider>{children}</InspectionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
