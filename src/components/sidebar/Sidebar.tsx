"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientOnly } from "@/components/ClientOnly";
import { ElementsPanel } from "@/components/sidebar/panels/ElementsPanel";
import { StylesPanel } from "@/components/sidebar/panels/StylesPanel";
import { TemplatesPanel } from "@/components/sidebar/panels/TemplatesPanel";
import { SettingsPanel } from "./panels/SettingsPanel";

export interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("elements");
  if (!isOpen) return null;

  return (
    <Card className="w-96 h-full rounded-none border-y-0 border-l-0 border-r">
      <ClientOnly>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 rounded-none">
            <TabsTrigger value="elements" className="rounded-none">Elements</TabsTrigger>
            <TabsTrigger value="styles" className="rounded-none">Styles</TabsTrigger>
            <TabsTrigger value="templates" className="rounded-none">Templates</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="elements" className="flex-1 overflow-y-auto p-4 space-y-4">
            <ElementsPanel />
          </TabsContent>
          <TabsContent value="styles" className="flex-1 overflow-y-auto p-4 space-y-2">
            <StylesPanel />
          </TabsContent>
          <TabsContent value="templates" className="flex-1 overflow-y-auto p-4">
            <TemplatesPanel />
          </TabsContent>
          <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 space-y-4">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </ClientOnly>
    </Card>
  );
}


