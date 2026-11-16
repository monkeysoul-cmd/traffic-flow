"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import AuthShell from "@/components/traffic/auth-shell";
import { useToast } from "@/hooks/use-toast";
import { apiSignup } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
    governmentId: "",
    department: "",
    location: "",
  });

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.id]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await apiSignup(formState);

      if (result?.success) {
        toast({
          title: "Signup Successful!",
          description: `Welcome, ${result.user.fullName}! Redirecting to dashboard...`,
        });
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        toast({
          title: "Signup Failed",
          description: result?.message || "Could not create account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Signup Failed",
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
        <h1 className="font-headline text-3xl font-semibold">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Register with your government details to use the traffic management system.
        </p>
      </div>
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="Your full name"
                required
                onChange={handleChange}
                value={formState.fullName}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@domain.gov"
                required
                onChange={handleChange}
                value={formState.email}
                disabled={isLoading}
              />
            </div>
        </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                onChange={handleChange}
                value={formState.password}
                disabled={isLoading}
              />
            </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="governmentId">Government ID</Label>
              <Input
                id="governmentId"
                placeholder="Your government ID"
                required
                onChange={handleChange}
                value={formState.governmentId}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g., Traffic Police"
                required
                onChange={handleChange}
                value={formState.department}
                disabled={isLoading}
              />
            </div>
        </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location / jurisdiction</Label>
              <Input
                id="location"
                placeholder="e.g., Bangalore City"
                required
                onChange={handleChange}
                value={formState.location}
                disabled={isLoading}
              />
            </div>
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" /> Create account
            </>
          )}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
