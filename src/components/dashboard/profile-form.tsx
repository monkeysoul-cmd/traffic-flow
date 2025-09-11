'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Edit, Save } from 'lucide-react';

export default function ProfileForm() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    fullName: 'bitfusion',
    email: 'admin@trafficflow.com',
    governmentId: 'GOV12345',
    department: 'Traffic Police',
    location: 'Bangalore City',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [e.target.id]: e.target.value,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile updated:', formState);
    toast({
      title: 'Profile Updated!',
      description: 'Your information has been successfully saved.',
    });
    setIsEditing(false);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8" />
            <div>
              <CardTitle className="text-2xl">User Profile</CardTitle>
              <CardDescription>
                View and manage your account details.
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : <><Edit className="mr-2 h-4 w-4" /> Edit Profile</>}
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleUpdate}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formState.fullName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
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
            <Label htmlFor="location">Location / Jurisdiction</Label>
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
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
