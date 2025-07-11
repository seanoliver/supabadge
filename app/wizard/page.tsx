"use client";

import { useState } from "react";
import { ProjectSetup } from "@/components/wizard/ProjectSetup";
import { MetricSelector } from "@/components/wizard/MetricSelector";
import { BadgeCustomizer } from "@/components/wizard/BadgeCustomizer";
import { Card, CardContent } from "@/components/ui/card";

type WizardStep = "project" | "metric" | "customize";

interface WizardData {
  projectUrl: string;
  anonKey: string;
  serviceKey: string;
  metricType: string;
  tableName?: string;
}

export default function WizardPage() {
  const [step, setStep] = useState<WizardStep>("project");
  const [data, setData] = useState<Partial<WizardData>>({});

  const handleProjectNext = (projectData: { projectUrl: string; anonKey: string; serviceKey: string }) => {
    setData({ ...data, ...projectData });
    setStep("metric");
  };

  const handleMetricNext = (metricData: { metricType: string; tableName?: string }) => {
    setData({ ...data, ...metricData });
    setStep("customize");
  };

  const handleBack = () => {
    if (step === "metric") setStep("project");
    else if (step === "customize") setStep("metric");
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="mb-8">
            <div className="flex justify-between">
              {["project", "metric", "customize"].map((s, index) => (
                <div
                  key={s}
                  className={`flex items-center ${
                    index < 2 ? "flex-1" : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      step === s
                        ? "bg-blue-600 text-white"
                        : index < ["project", "metric", "customize"].indexOf(step)
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        index < ["project", "metric", "customize"].indexOf(step)
                          ? "bg-green-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span>Connect</span>
              <span className="text-center flex-1">Choose Metric</span>
              <span className="text-right">Customize</span>
            </div>
          </div>

          {step === "project" && (
            <ProjectSetup
              onNext={handleProjectNext}
              initialData={
                data.projectUrl && data.anonKey && data.serviceKey
                  ? { projectUrl: data.projectUrl, anonKey: data.anonKey, serviceKey: data.serviceKey }
                  : undefined
              }
            />
          )}

          {step === "metric" && (
            <MetricSelector
              onNext={handleMetricNext}
              onBack={handleBack}
              initialData={
                data.metricType
                  ? { metricType: data.metricType, tableName: data.tableName }
                  : undefined
              }
              projectData={
                data.projectUrl && data.anonKey && data.serviceKey
                  ? { projectUrl: data.projectUrl, anonKey: data.anonKey, serviceKey: data.serviceKey }
                  : undefined
              }
            />
          )}

          {step === "customize" && data.projectUrl && data.anonKey && data.metricType && (
            <BadgeCustomizer
              onBack={handleBack}
              projectData={data as WizardData}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}