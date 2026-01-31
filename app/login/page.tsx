"use client";
import { authClient } from "@/lib/auth-client";

export default function SignInButton() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  return <button onClick={handleSignIn}>Sign in with GitHub</button>;
}
