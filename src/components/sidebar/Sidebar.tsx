"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientOnly } from "@/components/ClientOnly";
import { ElementsPanel } from "@/components/sidebar/panels/ElementsPanel";
import { StylesPanel } from "@/components/sidebar/panels/StylesPanel";
import { TemplatesPanel } from "@/components/sidebar/panels/TemplatesPanel";
import { SettingsPanel } from "./panels/SettingsPanel";
import { Blocks, Palette, FileStack, Settings } from "lucide-react";

export interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("elements");

  if (!isOpen) return null;

  return (
    <aside className="w-64 lg:w-80 h-full border-r border-border bg-card flex flex-col">
      <ClientOnly>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-border bg-transparent h-12 p-0">
            <TabsTrigger
              value="elements"
              className="flex flex-col gap-0.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 h-full"
            >
              <Blocks className="h-4 w-4" />
              <span className="text-[10px]">Elements</span>
            </TabsTrigger>
            <TabsTrigger
              value="styles"
              className="flex flex-col gap-0.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 h-full"
            >
              <Palette className="h-4 w-4" />
              <span className="text-[10px]">Styles</span>
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="flex flex-col gap-0.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 h-full"
            >
              <FileStack className="h-4 w-4" />
              <span className="text-[10px]">Templates</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex flex-col gap-0.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 h-full"
            >
              <Settings className="h-4 w-4" />
              <span className="text-[10px]">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="elements"
            className="flex-1 overflow-y-auto p-4 m-0 data-[state=inactive]:hidden"
          >
            <ElementsPanel />
          </TabsContent>
          <TabsContent
            value="styles"
            className="flex-1 overflow-y-auto p-4 m-0 data-[state=inactive]:hidden"
          >
            <StylesPanel />
          </TabsContent>
          <TabsContent
            value="templates"
            className="flex-1 overflow-y-auto p-4 m-0 data-[state=inactive]:hidden"
          >
            <TemplatesPanel />
          </TabsContent>
          <TabsContent
            value="settings"
            className="flex-1 overflow-y-auto p-4 m-0 data-[state=inactive]:hidden"
          >
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </ClientOnly>
    </aside>
  );
}
