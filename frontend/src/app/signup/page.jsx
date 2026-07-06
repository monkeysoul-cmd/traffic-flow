"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <h1 className="text-4xl font-bold font-headline">Traffic Flow</h1>
          </div>
          <CardTitle className="text-2xl">Create Government Account</CardTitle>
          <CardDescription>
            Register for access to the traffic management system.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  required
                  onChange={handleChange}
                  value={formState.fullName}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
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
                required
                onChange={handleChange}
                value={formState.password}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="location">Location / Jurisdiction</Label>
              <Input
                id="location"
                placeholder="e.g., Bangalore City"
                required
                onChange={handleChange}
                value={formState.location}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
