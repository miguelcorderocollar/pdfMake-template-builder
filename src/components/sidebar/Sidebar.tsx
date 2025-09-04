"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientOnly } from "@/components/ClientOnly";
import { ElementsPanel } from "@/components/sidebar/panels/ElementsPanel";
import { StylesPanel } from "@/components/sidebar/panels/StylesPanel";
import { TemplatesPanel } from "@/components/sidebar/panels/TemplatesPanel";

export interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("elements");
  if (!isOpen) return null;

  return (
    <Card className="w-80 h-full rounded-none border-y-0 border-l-0 border-r">
      <ClientOnly>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none">
            <TabsTrigger value="elements" className="rounded-none">Elements</TabsTrigger>
            <TabsTrigger value="styles" className="rounded-none">Styles</TabsTrigger>
            <TabsTrigger value="templates" className="rounded-none">Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="elements" className="flex-1 p-4 space-y-4">
            <ElementsPanel />
          </TabsContent>
          <TabsContent value="styles" className="flex-1 p-4 space-y-2">
            <StylesPanel />
          </TabsContent>
          <TabsContent value="templates" className="flex-1 p-4">
            <TemplatesPanel />
          </TabsContent>
        </Tabs>
      </ClientOnly>
    </Card>
  );
}


