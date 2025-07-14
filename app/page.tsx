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

          <div className="grid md:grid-cols-3 gap-6 pb-20">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 mb-2 text-blue-600" />
                <CardTitle>Dynamic Updates</CardTitle>
                <CardDescription>
                  Table count badges update automatically without any manual refresh
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 mb-2 text-green-600" />
                <CardTitle>Secure by Design</CardTitle>
                <CardDescription>
                  Only stores public anon keys. Service keys are never saved
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="h-8 w-8 mb-2 text-purple-600" />
                <CardTitle>Easy to Use</CardTitle>
                <CardDescription>
                  Create badges in under 2 minutes with our simple 3-step wizard
                </CardDescription>
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
