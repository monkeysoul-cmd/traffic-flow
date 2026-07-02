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
import { User, Edit, Save, Award, Github } from "lucide-react";

export default function ProfileForm() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    fullName: "Ayush",
    role: "AI Software Engineer",
    email: "ayush@example.com",
    github: "github.com/ayush",
    expertise: "Retrieval-Augmented Generation (RAG), Fullstack Next.js, Vector DBs",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [e.target.id]: e.target.value,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated!",
      description: "Developer profile settings saved successfully.",
    });
    setIsEditing(false);
  };

  return (
    <Card className="max-w-2xl mx-auto border-border bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Developer Portfolio Profile</CardTitle>
              <CardDescription>
                Customize details displayed for recruiting showcases.
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="border-border"
          >
            {isEditing ? (
              "Cancel"
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" /> Edit Details
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleUpdate}>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formState.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className="border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role / Position</Label>
              <Input
                id="role"
                value={formState.role}
                onChange={handleChange}
                disabled={!isEditing}
                className="border-border"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub Profile</Label>
              <Input
                id="github"
                value={formState.github}
                onChange={handleChange}
                disabled={!isEditing}
                className="border-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expertise">Areas of Expertise</Label>
            <Input
              id="expertise"
              value={formState.expertise}
              onChange={handleChange}
              disabled={!isEditing}
              className="border-border"
            />
          </div>

          <div className="bg-muted/40 p-4 rounded-xl border border-border flex items-start gap-3 mt-4 text-sm text-muted-foreground">
            <Award className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground block">Resume Ready Showcase</span>
              This profile links your contact information to the demo platform, illustrating fullstack competency to potential recruiters.
            </div>
          </div>
        </CardContent>
        {isEditing && (
          <CardFooter className="border-t border-border pt-4">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
