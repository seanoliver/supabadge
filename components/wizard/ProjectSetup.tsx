"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight } from "lucide-react";

interface ProjectSetupProps {
  onNext: (data: { projectUrl: string; anonKey: string }) => void;
  initialData?: {
    projectUrl: string;
    anonKey: string;
  };
}

export function ProjectSetup({ onNext, initialData }: ProjectSetupProps) {
  const [projectUrl, setProjectUrl] = useState(initialData?.projectUrl || "");
  const [anonKey, setAnonKey] = useState(initialData?.anonKey || "");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsValidating(true);

    try {
      // Validate URL format
      if (!projectUrl.match(/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/)) {
        throw new Error("Invalid Supabase project URL format");
      }

      // Test the connection
      const response = await fetch(`${projectUrl}/rest/v1/`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid project URL or API key");
      }

      onNext({ projectUrl, anonKey });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate credentials");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Connect Your Supabase Project</h2>
        <p className="mt-2 text-gray-600">
          Enter your Supabase project details to get started
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="projectUrl">Project URL</Label>
          <Input
            id="projectUrl"
            type="url"
            placeholder="https://your-project.supabase.co"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            required
            className="mt-1"
          />
          <p className="mt-1 text-sm text-gray-500">
            Found in your Supabase Dashboard → Settings → API
          </p>
        </div>

        <div>
          <Label htmlFor="anonKey">Anon (Public) Key</Label>
          <Input
            id="anonKey"
            type="text"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            required
            className="mt-1"
          />
          <p className="mt-1 text-sm text-gray-500">
            Safe to store - this is your public API key
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!projectUrl || !anonKey || isValidating}
        className="w-full"
      >
        {isValidating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validating...
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}