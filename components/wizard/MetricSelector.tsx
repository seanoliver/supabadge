"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

interface MetricSelectorProps {
  onNext: (data: { metricType: string; tableName?: string }) => void;
  onBack: () => void;
  initialData?: {
    metricType: string;
    tableName?: string;
  };
  projectData?: {
    projectUrl: string;
    anonKey: string;
    serviceKey: string;
  };
}

export function MetricSelector({ onNext, onBack, initialData, projectData }: MetricSelectorProps) {
  const [tableName, setTableName] = useState(initialData?.tableName || "");
  const [tables, setTables] = useState<Array<{ schema: string; table: string; fullName: string }>>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [tablesError, setTablesError] = useState("");

  useEffect(() => {
    const loadTables = async () => {
      if (!projectData) return;

      setIsLoadingTables(true);
      setTablesError("");

      try {
        const response = await fetch("/api/tables", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectUrl: projectData.projectUrl,
            serviceKey: projectData.serviceKey,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tables");
        }

        const { tables: fetchedTables } = await response.json();
        setTables(fetchedTables || []);
      } catch (error) {
        setTablesError("Failed to fetch tables. Please check your credentials.");
        console.error("Error fetching tables:", error);
      } finally {
        setIsLoadingTables(false);
      }
    };

    loadTables();
  }, [projectData]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableName) {
      return;
    }

    onNext({
      metricType: "table_count",
      tableName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choose a Table</h2>
        <p className="mt-2 text-gray-600">
          Select which table to track for your badge
        </p>
      </div>

      <div>
        <Label htmlFor="tableName">Table Name</Label>
        {isLoadingTables ? (
          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading tables...</span>
          </div>
        ) : tablesError ? (
          <p className="mt-1 text-sm text-red-600">{tablesError}</p>
        ) : tables.length > 0 ? (
          <Select value={tableName} onValueChange={setTableName}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a table" />
            </SelectTrigger>
            <SelectContent>
              {tables.map((table) => (
                <SelectItem key={table.fullName} value={table.fullName}>
                  {table.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <>
            <Input
              id="tableName"
              type="text"
              placeholder="e.g., posts, comments, users"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              required
              className="mt-1"
            />
            <p className="mt-1 text-sm text-amber-600">
              No tables found. Enter your table name manually.
            </p>
          </>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Your badge will show the total row count for this table
        </p>
      </div>

      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={!tableName}
          className="flex-1"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}