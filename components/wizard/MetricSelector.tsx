"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Database, Users } from "lucide-react";
import { PRESET_METRICS } from "@/lib/metrics";

interface MetricSelectorProps {
  onNext: (data: { metricType: string; tableName?: string }) => void;
  onBack: () => void;
  initialData?: {
    metricType: string;
    tableName?: string;
  };
}

export function MetricSelector({ onNext, onBack, initialData }: MetricSelectorProps) {
  const [metricType, setMetricType] = useState(initialData?.metricType || "");
  const [tableName, setTableName] = useState(initialData?.tableName || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (metricType === "table_count" && !tableName) {
      return;
    }

    onNext({
      metricType,
      tableName: metricType === "table_count" ? tableName : undefined,
    });
  };

  const selectedMetric = metricType ? PRESET_METRICS[metricType] : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choose a Metric</h2>
        <p className="mt-2 text-gray-600">
          Select what data you want to display in your badge
        </p>
      </div>

      <RadioGroup value={metricType} onValueChange={setMetricType}>
        <div className="space-y-4">
          <label className="flex cursor-pointer rounded-lg border p-4 hover:bg-gray-50">
            <RadioGroupItem value="table_count" className="mt-1" />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <Database className="mr-2 h-4 w-4 text-gray-600" />
                <span className="font-medium">Table Row Count</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Display the number of rows in any table
              </p>
              <p className="mt-1 text-sm text-green-600">
                ✓ Updates automatically
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer rounded-lg border p-4 hover:bg-gray-50">
            <RadioGroupItem value="users" className="mt-1" />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-gray-600" />
                <span className="font-medium">Authenticated Users</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Display total number of registered users
              </p>
              <p className="mt-1 text-sm text-amber-600">
                ⚡ Requires manual refresh with service key
              </p>
            </div>
          </label>
        </div>
      </RadioGroup>

      {metricType === "table_count" && (
        <div className="mt-4">
          <Label htmlFor="tableName">Table Name</Label>
          <Input
            id="tableName"
            type="text"
            placeholder="e.g., posts, comments, users"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            required
            className="mt-1"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the name of the table you want to track
          </p>
        </div>
      )}

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
          disabled={!metricType || (metricType === "table_count" && !tableName)}
          className="flex-1"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}