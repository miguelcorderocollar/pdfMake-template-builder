"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import { useApp } from "@/lib/app-context";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("elements");
  const { state, dispatch } = useApp();

  if (!isOpen) return null;

  return (
    <Card className="w-80 h-full rounded-none border-y-0 border-l-0 border-r">
      <ClientOnly>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-3 rounded-none">
          <TabsTrigger value="elements" className="rounded-none">
            Elements
          </TabsTrigger>
          <TabsTrigger value="styles" className="rounded-none">
            Styles
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-none">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="flex-1 p-4 space-y-4">
          <div>
            <h3 className="font-medium mb-3">Element Palette</h3>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_STRING', payload: { value: 'New paragraph' } } })}
              >
                Add Paragraph
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_TEXT_NODE', payload: { text: 'New text', style: undefined } } })}
              >
                Add Text Node
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="styles" className="flex-1 p-4 space-y-2">
          <h3 className="font-medium mb-2">Styles</h3>
          <div className="grid gap-2">
            {state.currentTemplate && state.currentTemplate.docDefinition.styles &&
              Object.entries(state.currentTemplate.docDefinition.styles).map(([name, def]) => (
                <div key={name} className="border rounded p-2 text-sm">
                  <div className="font-medium">{name}</div>
                  <div className="text-xs mt-1">fontSize: {def.fontSize ?? '-'} | bold: {def.bold ? 'true' : 'false'} | italics: {def.italics ? 'true' : 'false'}</div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="flex-1 p-4">
          <div className="space-y-3">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (confirm('Clear template? This removes all content and styles.')) {
                  dispatch({ type: 'CLEAR_TEMPLATE' });
                }
              }}
            >
              Clear Template
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => dispatch({ type: 'RELOAD_DEFAULT_TEMPLATE' })}
            >
              Reload Default (styles-simple)
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      </ClientOnly>
    </Card>
  );
}
