"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight, ExternalLink } from "lucide-react";

interface ProjectSetupProps {
  onNext: (data: { projectUrl: string; anonKey: string; serviceKey: string }) => void;
  initialData?: {
    projectUrl: string;
    anonKey: string;
    serviceKey: string;
  };
}

export function ProjectSetup({ onNext, initialData }: ProjectSetupProps) {
  const [projectRef, setProjectRef] = useState("");
  const [anonKey, setAnonKey] = useState(initialData?.anonKey || "");
  const [serviceKey, setServiceKey] = useState(initialData?.serviceKey || "");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  // Extract project ref from initial URL if provided
  useState(() => {
    if (initialData?.projectUrl) {
      const match = initialData.projectUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
      if (match) {
        setProjectRef(match[1]);
      }
    }
  });

  const projectUrl = projectRef ? `https://${projectRef}.supabase.co` : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsValidating(true);

    try {
      // Validate project ref format
      if (!projectRef.match(/^[a-zA-Z0-9-]+$/)) {
        throw new Error("Invalid project reference format");
      }

      const validProjectUrl = `https://${projectRef}.supabase.co`;

      // Test the connection
      const response = await fetch(`${validProjectUrl}/rest/v1/`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid project reference or API keys");
      }

      onNext({ projectUrl: validProjectUrl, anonKey, serviceKey });
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
          <Label htmlFor="projectRef">Project ID</Label>
          <Input
            id="projectRef"
            type="text"
            placeholder="your-project-ref"
            value={projectRef}
            onChange={(e) => setProjectRef(e.target.value.toLowerCase())}
            required
            className="mt-1"
          />
          <p className="mt-1 text-sm text-gray-500">
            Found in your Supabase Dashboard → Project Settings → General → Project ID
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
            disabled={!projectRef}
            className="mt-1"
          />
          <p className="mt-1 text-sm text-gray-500">
            {projectRef ? (
              <>
                Safe to store - this is your public API key.
                {' '}
                <a
                  href={`https://supabase.com/dashboard/project/${projectRef}/settings/api-keys`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Get your keys here →
                </a>
              </>
            ) : (
              "Enter your project reference first"
            )}
          </p>
        </div>

        <div>
          <Label htmlFor="serviceKey">Service Role Key</Label>
          <Input
            id="serviceKey"
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={serviceKey}
            onChange={(e) => setServiceKey(e.target.value)}
            required
            disabled={!projectRef}
            className="mt-1"
          />
          <div className="mt-1 space-y-1">
            <p className="text-sm text-amber-600 font-medium">
              ⚠️ This key will NOT be stored anywhere
            </p>
            <p className="text-sm text-gray-500">
              {projectRef ? (
                <>
                  Used only for this session to discover your tables.
                  {' '}
                  <a
                    href={`https://supabase.com/dashboard/project/${projectRef}/settings/api`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Get your keys here →
                  </a>
                </>
              ) : (
                "Enter your project reference first"
              )}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!projectRef || !anonKey || !serviceKey || isValidating}
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
