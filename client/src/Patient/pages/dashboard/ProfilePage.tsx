import { Button } from "@/Patient/components/ui/button";
import { Input } from "@/Patient/components/ui/input";
import { Label } from "@/Patient/components/ui/label";
import { Separator } from "@/Patient/components/ui/separator";
import { Save, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "Patient Demo",
    email: "patient@mmgc.com",
    phone: "+92 300 1234567",
    dob: "1990-05-15",
    gender: "Female",
    bloodGroup: "O+",
    address: "123 Healthcare Ave, Medical City",
    emergencyContact: "+92 300 7654321",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Update your personal information</p>
      </div>

      <div className="bg-card rounded-xl shadow-soft border border-border overflow-hidden">
        {/* Avatar */}
        <div className="gradient-primary p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-card/20 flex items-center justify-center">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-primary-foreground text-lg">{profile.name}</h2>
            <p className="text-primary-foreground/80 text-sm">{profile.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Input value={profile.bloodGroup} onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })} />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input value={profile.emergencyContact} onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })} />
            </div>
          </div>

          <Button variant="hero" type="submit">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
