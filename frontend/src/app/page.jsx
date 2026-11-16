"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { LogIn, Loader2 } from "lucide-react";
import AuthShell from "@/components/traffic/auth-shell";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { apiLogin } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("admin@trafficflow.com");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await apiLogin(email, password);

      if (result?.success) {
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${result.user.fullName}.`,
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: result?.message || "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Use your traffic department account to open the control center.
        </p>
      </div>
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@domain.gov"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" /> Sign in
            </>
          )}
        </Button>
      </form>
      <div className="lane-divider" aria-hidden="true" />
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          Demo account is pre-filled: <span className="text-foreground">admin@trafficflow.com</span>
        </p>
        <p>
          New to the system?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
