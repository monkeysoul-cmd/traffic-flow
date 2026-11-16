"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { User, Edit, Save } from "lucide-react";

export default function ProfileForm() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    fullName: "bitfusion-I",
    email: "admin@trafficflow.com",
    governmentId: "GOV12345",
    department: "Traffic Police",
    location: "Bangalore City",
  });

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.id]: e.target.value,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("Profile updated:", formState);
    toast({
      title: "Profile Updated!",
      description: "Your information has been successfully saved.",
    });
    setIsEditing(false);
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 font-headline text-xl font-semibold text-primary">
              {formState.fullName.slice(0, 1).toUpperCase() || <User className="h-6 w-6" />}
            </span>
            <div>
              <CardTitle className="text-2xl">User profile</CardTitle>
              <CardDescription>
                View and manage your account details.
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              "Cancel"
            ) : (
              <>
                <Edit className="h-4 w-4" /> Edit profile
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleUpdate}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={formState.fullName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="governmentId">Government ID</Label>
              <Input
                id="governmentId"
                value={formState.governmentId}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formState.department}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location / jurisdiction</Label>
            <Input
              id="location"
              value={formState.location}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
        {isEditing && (
          <CardFooter>
            <Button type="submit">
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
