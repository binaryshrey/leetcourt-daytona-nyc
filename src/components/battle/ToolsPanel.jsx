import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Folder, Scale } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ToolsPanel({ caseData }) {
  return (
    <div className="bg-[#1a1f3a]/50 rounded-lg border border-[#d4af37]/20 overflow-hidden">
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-[#151a2e] border-b border-[#d4af37]/20">
          <TabsTrigger value="notes" className="data-[state=active]:bg-[#d4af37]/20">
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="evidence" className="data-[state=active]:bg-[#d4af37]/20">
            <Folder className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Evidence</span>
          </TabsTrigger>
          <TabsTrigger value="precedents" className="data-[state=active]:bg-[#d4af37]/20">
            <Scale className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Precedent</span>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-64">
          <TabsContent value="notes" className="p-4 space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-[#d4af37] mb-2">Strategic Notes</h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                {caseData?.notes || "No strategic notes available."}
              </p>
            </div>
            <div className="pt-2 border-t border-[#d4af37]/20">
              <h4 className="text-sm font-semibold text-[#d4af37] mb-2">Case Facts</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                {caseData?.facts || "No case facts available."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="p-4 space-y-3">
            {caseData?.evidence?.length > 0 ? (
              <>
                <div className="mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Available Evidence ({caseData.evidence.length})</p>
                </div>
                {caseData.evidence.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-[#151a2e] rounded-lg border border-[#4a90e2]/30 hover:border-[#4a90e2]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-xs font-semibold text-[#60a5fa]">{item.name}</p>
                      <span className="text-[10px] px-2 py-0.5 bg-[#4a90e2]/20 text-[#60a5fa] rounded-full uppercase">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <Folder className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No evidence available.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="precedents" className="p-4 space-y-3">
            {caseData?.precedents?.length > 0 ? (
              <>
                <div className="mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Relevant Case Law ({caseData.precedents.length})</p>
                </div>
                {caseData.precedents.map((precedent, index) => (
                  <div
                    key={index}
                    className="p-3 bg-[#151a2e] rounded-lg border border-[#10b981]/30 hover:border-[#10b981]/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Scale className="w-3 h-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-300 leading-relaxed">{precedent}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <Scale className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No precedents listed.</p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}