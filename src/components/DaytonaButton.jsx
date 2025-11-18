import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Code, ExternalLink, Terminal, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createCaseSandbox, getDaytonaStatus } from "@/utils/daytonaIntegration";

export default function DaytonaButton({ caseData, onInsightsGenerated, variant = "default" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sandboxInfo, setSandboxInfo] = useState(null);

  const daytonaStatus = getDaytonaStatus();

  const handleCreateSandbox = async () => {
    setLoading(true);
    setError(null);
    setSandboxInfo(null);

    const result = await createCaseSandbox(caseData);

    if (result.success) {
      setSandboxInfo(result);
      
      // Call the callback with insights to update ToolsPanel
      if (onInsightsGenerated && result.insights) {
        onInsightsGenerated(result.insights);
      }
    } else {
      setError(result);
    }
    setLoading(false);
  };

  // Show success state
  if (sandboxInfo) {
    return (
      <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-400 mb-1">
              Analysis Complete!
            </p>
            <p className="text-xs text-gray-300 mb-2">
              AI insights have been generated and applied to the case.
            </p>

            {/* SSH Access */}
            {sandboxInfo.sshCommand && (
              <div className="bg-blue-500/10 border border-blue-400/30 rounded p-3 mb-3">
                <p className="text-xs font-semibold text-blue-300 mb-2">
                  🔐 SSH Access (valid 60 min):
                </p>
                <div className="bg-[#0d1117] rounded border border-gray-700 p-2 mb-2">
                  <code className="text-xs text-green-400 break-all">
                    {sandboxInfo.sshCommand}
                  </code>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(sandboxInfo.sshCommand);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-xs"
                >
                  <Terminal className="w-3 h-3 mr-1" />
                  Copy SSH Command
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSandboxInfo(null);
                  setError(null);
                }}
                className="border-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with setup instructions
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400 mb-1">
              Setup Required
            </p>
            <p className="text-xs text-gray-300 mb-2">
              {error.error}
            </p>
            {error.instructions && (
              <div className="bg-[#0d1117] rounded border border-gray-700 p-3 space-y-1">
                {error.instructions.map((instruction, i) => (
                  <p key={i} className="text-xs text-gray-400">
                    {instruction}
                  </p>
                ))}
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setError(null)}
              className="border-gray-700 mt-3"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show button (not configured state)
  if (!daytonaStatus.configured) {
    return (
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Terminal className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-400 mb-1">
              Daytona Not Configured
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Set up Daytona to create secure analysis sandboxes.
            </p>
            <div className="bg-[#0d1117] rounded border border-gray-700 p-3 space-y-1 text-xs text-gray-400 mb-3">
              {daytonaStatus.instructions.map((instruction, i) => (
                <p key={i}>{instruction}</p>
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => window.open('https://app.daytona.io', '_blank')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Go to Daytona
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main button
  return (
    <Button
      onClick={handleCreateSandbox}
      disabled={loading}
      variant={variant}
      className="w-full gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing in Sandbox...
        </>
      ) : (
        <>
          <Code className="w-4 h-4" />
          Generate AI Insights (Daytona)
          <ExternalLink className="w-3 h-3" />
        </>
      )}
    </Button>
  );
}
