"use client"

import * as React from "react"
import { cn } from "@/core/lib/utils"

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [selectedTab, setSelectedTab] = React.useState(defaultValue)
  const activeTab = value !== undefined ? value : selectedTab

  const setActiveTab = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setSelectedTab(newValue)
      }
      onValueChange?.(newValue)
    },
    [value, onValueChange]
  )

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400 w-full sm:w-auto",
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")

  const isActive = context.activeTab === value

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "inline-flex min-h-[36px] flex-1 items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50 font-semibold"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")

  if (context.activeTab !== value) return null

  return <div className={cn("mt-4 focus-visible:outline-none", className)}>{children}</div>
}
