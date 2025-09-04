"use client";

import { Sidebar as SidebarImpl } from "@/components/sidebar/Sidebar";

export interface SidebarProps { isOpen: boolean }

export function Sidebar(props: SidebarProps) {
  return <SidebarImpl {...props} />;
}

