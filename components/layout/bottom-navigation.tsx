"use client"

import {
  Home,
  Camera,
  ImageIcon,
  FileText,
  Settings,
  HomeIcon as HomeFilled,
  CameraIcon as CameraFilled,
  ImageIcon as ImageFilled,
  FileTextIcon as FileTextFilled,
  SettingsIcon as SettingsFilled,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/home",
    icon: Home,
    iconFilled: HomeFilled,
    label: "Home",
  },
  {
    href: "/camera",
    icon: Camera,
    iconFilled: CameraFilled,
    label: "Camera",
  },
  {
    href: "/gallery",
    icon: ImageIcon,
    iconFilled: ImageFilled,
    label: "Gallery",
  },
  {
    href: "/instructions",
    icon: FileText,
    iconFilled: FileTextFilled,
    label: "Instructions",
  },
  {
    href: "/settings",
    icon: Settings,
    iconFilled: SettingsFilled,
    label: "Settings",
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  // Check if current path is camera-related
  const isCameraActive = pathname.startsWith("/camera")

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ href, icon: Icon, iconFilled: IconFilled, label }) => {
          // Special handling for camera routes
          const isActive = href === "/camera" ? isCameraActive : pathname === href

          // Use filled icon when active
          const DisplayIcon = isActive ? IconFilled : Icon

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 text-xs transition-all duration-200",
                isActive ? "text-slate-900 scale-105" : "text-slate-500 hover:text-slate-700",
              )}
            >
              <div className={cn("p-1 rounded-lg transition-all duration-200", isActive && "bg-slate-100")}>
                <DisplayIcon className={cn("h-5 w-5 transition-all duration-200", isActive && "drop-shadow-sm")} />
              </div>
              <span className={cn("font-medium transition-all duration-200", isActive && "text-slate-900")}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
