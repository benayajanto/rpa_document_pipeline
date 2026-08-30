import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/auth-shell";
import { SignupForm } from "@/features/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up — Invoice Extractor",
};

export default function SignupPage() {
  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  );
}
