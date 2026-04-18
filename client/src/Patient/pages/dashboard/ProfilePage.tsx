import { useState, useEffect } from "react";
import { Button } from "@/Patient/components/ui/button";
import { Input } from "@/Patient/components/ui/input";
import { Label } from "@/Patient/components/ui/label";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Droplet, 
  ShieldAlert, 
  Calendar,
  Save,
  Camera
} from "lucide-react";
import { useToast } from "@/Patient/hooks/use-toast";
import { useAuth } from "@/Auth/AuthContext";
import { useRef } from "react";

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.patientProfileId) return;

    const patientId = user.patientProfileId; 
    fetch(`/api/patients/${patientId}/profile`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      });
  }, [user?.patientProfileId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.patientProfileId) return;

    setSaving(true);
    const patientId = user.patientProfileId;
    
    try {
      const res = await fetch(`/api/patients/${patientId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      
      if (res.ok) {
        toast({ title: "Success", description: "Profile updated successfully." });
      } else {
        toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.patientProfileId) return;

    const formData = new FormData();
    formData.append("file", file);

    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${user.patientProfileId}/upload-profile-picture`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({ ...profile, profilePictureUrl: data.url });
        await refreshUser(); // Update global auth state (navbar)
        toast({ title: "Success", description: "Profile picture updated." });
      } else {
        toast({ title: "Error", description: "Upload failed.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 animate-pulse uppercase tracking-widest text-sm font-bold text-muted-foreground">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and medical emergency details.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-8 text-center flex flex-col items-center shadow-sm">
            <div className="relative group cursor-pointer w-32 h-32 mb-6" onClick={() => fileInputRef.current?.click()}>
              {profile.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt={profile.name} className="w-full h-full rounded-full object-cover border-4 border-primary/20 shadow-xl group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-full rounded-full gradient-primary flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-xl group-hover:scale-105 transition-transform">
                  {profile.name?.charAt(0) || "P"}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{profile.mrNumber}</p>
            <div className="mt-6 w-full pt-6 border-t border-border flex justify-around">
               <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Gender</p>
                  <p className="text-sm font-semibold mt-1">{profile.gender}</p>
               </div>
               <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Age</p>
                  <p className="text-sm font-semibold mt-1">28 Yrs</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-accent/10 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h3 className="font-bold">Contact Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="name" className="pl-9" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="email" className="pl-9" type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" className="pl-9" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="address" className="pl-9" value={profile.address || ""} onChange={e => setProfile({...profile, address: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-accent/10 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <h3 className="font-bold">Emergency & Medical</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="blood">Blood Group</Label>
                <div className="relative">
                  <Droplet className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground text-red-500" />
                  <Input id="blood" className="pl-9" value={profile.bloodGroup || ""} placeholder="e.g. A+" onChange={e => setProfile({...profile, bloodGroup: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-name">Emergency Contact Name</Label>
                <Input id="e-name" value={profile.emergencyContactName || ""} onChange={e => setProfile({...profile, emergencyContactName: e.target.value})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="e-phone">Emergency Contact Phone</Label>
                <Input id="e-phone" value={profile.emergencyContactPhone || ""} onChange={e => setProfile({...profile, emergencyContactPhone: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <Button type="submit" className="gradient-primary text-primary-foreground h-12 px-10 rounded-xl" disabled={saving}>
                {saving ? "Saving Changes..." : <span className="flex items-center gap-2"><Save className="h-5 w-5" /> Save Profile</span>}
             </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
