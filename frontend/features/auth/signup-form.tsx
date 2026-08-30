"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { apiClient, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiClient.signup(email, password, name);

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Account created, but automatic login failed. Please log in.");
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Create an Account</h2>
        <p className="text-gray-600">Start extracting structured data from invoices</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}

        <Input
          id="name"
          name="name"
          type="text"
          label="Name"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Log in
        </Link>
      </p>
    </div>
  );
}
