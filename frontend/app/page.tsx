import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

const templates = [
  {
    name: "Northwind Retail",
    description: "Retail invoice layout with itemized line items and tax breakdown.",
  },
  {
    name: "Acme Distribution Co.",
    description: "Wholesale purchase-order style invoice with bulk quantities.",
  },
  {
    name: "Generic Invoice",
    description: "Fallback template — and optional LLM-assisted extraction — for anything else.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 py-16 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Turn PDF invoices into structured data
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-600">
          Upload an invoice or receipt and get vendor, totals, and line items back automatically — via
          fast rule-based templates, with an optional LLM fallback for anything unfamiliar.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/signup">
            <Button size="md">Get started</Button>
          </Link>
          <Link href="/login">
            <Button size="md" variant="outline">
              I have an account
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid w-full gap-4 sm:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.name} className="text-left">
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        Demo project — sample data only, no real vendors or invoices.
      </footer>
    </div>
  );
}
