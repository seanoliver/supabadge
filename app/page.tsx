import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"} className="flex items-center gap-2">
                <Badge className="h-5 w-5" />
                Supabadge
              </Link>
            </div>
            <Link href="/wizard">
              <Button>Create Badge</Button>
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <div className="flex flex-col items-center gap-6 text-center pt-20">
            <h1 className="text-4xl font-bold">Live Metrics Badges for Supabase</h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Generate dynamic badges that display real-time metrics from your Supabase projects.
              Perfect for READMEs, dashboards, and documentation.
            </p>
            <Link href="/wizard">
              <Button size="lg" className="mt-4">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pb-8">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 mb-2 text-blue-600" />
                <CardTitle>Smart Auto-Updates</CardTitle>
                <CardDescription>
                  Badges auto-update when your table&apos;s RLS policy allows anonymous read access. Otherwise, use our simple refresh API.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 mb-2 text-green-600" />
                <CardTitle>Secure by Design</CardTitle>
                <CardDescription>
                  Only stores public anon keys. Service keys are never saved - you provide them only when refreshing.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="h-8 w-8 mb-2 text-purple-600" />
                <CardTitle>Easy to Use</CardTitle>
                <CardDescription>
                  Create badges in under 2 minutes with our simple 3-step wizard. Copy-paste ready!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="w-full max-w-4xl mx-auto pb-20">
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <h3 className="text-lg font-semibold mb-3">How Badge Updates Work</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-900 mb-1">🔓 Public Tables (RLS allows anonymous reads)</p>
                    <p className="text-slate-600">Your badge fetches live data every time it&apos;s viewed. No manual updates needed!</p>
                  </div>

                  <div>
                    <p className="font-medium text-slate-900 mb-1">🔒 Protected Tables (RLS blocks anonymous reads)</p>
                    <p className="text-slate-600 mb-2">Badge shows cached count from setup. Refresh anytime with this one-liner:</p>
                    <code className="block bg-slate-900 text-slate-100 p-3 rounded-md text-xs overflow-x-auto">
                      {`curl -X POST https://zdpqxgwvzlspdbfsqxmi.supabase.co/functions/v1/badge-refresh/[badge-id] \\
  -H "Content-Type: application/json" \\
  -d '{"serviceKey": "your-secret-key"}'`}
                    </code>
                    <p className="text-slate-500 mt-2 text-xs">Pro tip: Automate this with a secure cron job or GitHub Action!</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Built with{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
