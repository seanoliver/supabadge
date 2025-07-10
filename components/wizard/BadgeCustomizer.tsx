"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BadgePreview } from "@/components/badge/BadgePreview";
import { ArrowLeft, Loader2, Copy, CheckCircle } from "lucide-react";
import { PRESET_METRICS, PRESET_COLORS } from "@/lib/metrics";

interface BadgeCustomizerProps {
  onBack: () => void;
  projectData: {
    projectUrl: string;
    anonKey: string;
    metricType: string;
    tableName?: string;
  };
}

export function BadgeCustomizer({ onBack, projectData }: BadgeCustomizerProps) {
  const metric = PRESET_METRICS[projectData.metricType];
  const [label, setLabel] = useState(metric.label);
  const [color, setColor] = useState("#3ECF8E");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [badgeUrl, setBadgeUrl] = useState("");
  const [refreshUrl, setRefreshUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...projectData,
          label,
          color,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create badge");
      }

      const { badgeId, badgeUrl: url } = await response.json();
      setBadgeUrl(url);
      
      if (projectData.metricType === "users") {
        const baseUrl = url.replace("/badge/", "/badge-refresh/");
        setRefreshUrl(baseUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create badge");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (badgeUrl) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Badge is Ready!</h2>
          <p className="mt-2 text-gray-600">
            Copy the URL below to embed your badge anywhere
          </p>
        </div>

        <div className="flex justify-center">
          <img src={badgeUrl} alt="Badge preview" className="h-8" />
        </div>

        <div className="space-y-4">
          <div>
            <Label>Badge URL</Label>
            <div className="mt-1 flex space-x-2">
              <Input value={badgeUrl} readOnly />
              <Button
                type="button"
                variant="outline"
                onClick={() => copyToClipboard(badgeUrl)}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {refreshUrl && (
            <Alert>
              <AlertDescription>
                <strong>Manual Refresh Required:</strong> User count badges need to be refreshed manually.
                POST your service key to: <code className="text-xs">{refreshUrl}</code>
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900">Embed in Markdown</h3>
            <code className="mt-2 block text-sm">
              ![{label}]({badgeUrl})
            </code>
          </div>
        </div>

        <Button
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Create Another Badge
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Customize Your Badge</h2>
        <p className="mt-2 text-gray-600">
          Personalize the appearance of your badge
        </p>
      </div>

      <BadgePreview label={label} value="123" color={color} />

      <div className="space-y-4">
        <div>
          <Label htmlFor="label">Badge Label</Label>
          <Input
            id="label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="color">Badge Color</Label>
          <div className="mt-2 space-y-3">
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setColor(preset.value)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    color === preset.value
                      ? "ring-2 ring-offset-2 ring-gray-900"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: preset.value, color: "white" }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isCreating}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={!label || isCreating}
          className="flex-1"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Badge"
          )}
        </Button>
      </div>
    </form>
  );
}