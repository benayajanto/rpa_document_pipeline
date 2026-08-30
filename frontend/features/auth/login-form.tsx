"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600">Please sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
          Sign up
        </Link>
      </p>

      <div className="rounded-lg bg-gray-50 px-3 py-2 text-center text-xs text-gray-500">
        Demo account: <span className="font-mono">demo@example.com</span> /{" "}
        <span className="font-mono">demo1234</span>
      </div>
    </div>
  );
}
