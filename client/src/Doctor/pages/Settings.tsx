import { useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Clock,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building2,
  Stethoscope,
  Moon,
  Sun,
  Monitor,
  Check,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Input } from "@/Doctor/components/ui/input";
import { Label } from "@/Doctor/components/ui/label";
import { Badge } from "@/Doctor/components/ui/badge";
import { Switch } from "@/Doctor/components/ui/switch";
import { Textarea } from "@/Doctor/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Doctor/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/Doctor/lib/utils";
import { useAuth } from "@/Auth/AuthContext";
import { useEffect } from "react";

type TabKey = "profile" | "notifications" | "appearance" | "security" | "clinic";

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

const tabs: TabItem[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "clinic", label: "Clinic Info", icon: Building2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "security", label: "Security", icon: Shield },
];

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    address: "",
    bio: "",
    profilePictureUrl: "",
  });

  // Notification state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    appointmentReminders: true,
    labResultNotifications: true,
    systemUpdateNotifications: false,
    patientMessageNotifications: true,
  });

  // Appearance state
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Clinic state
  const [clinic, setClinic] = useState({
    name: "",
    phone: "",
    address: "",
    timings: "",
    consultationFee: "0",
    followUpFee: "0",
  });

  // Security state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    if (!user?.doctorProfileId) return;

    fetch(`/api/doctors/${user.doctorProfileId}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          specialization: data.specialization || "",
          licenseNumber: data.licenseNumber || "",
          address: data.address || "",
          bio: data.bio || "",
          profilePictureUrl: data.profilePictureUrl || "",
        });

        setNotifications({
          emailAlerts: data.emailAlerts ?? true,
          smsAlerts: data.smsAlerts ?? false,
          appointmentReminders: data.appointmentReminders ?? true,
          labResultNotifications: data.labResultNotifications ?? true,
          systemUpdateNotifications: data.systemUpdateNotifications ?? false,
          patientMessageNotifications: data.patientMessageNotifications ?? true,
        });

        setClinic({
          name: data.clinicName || "",
          phone: data.clinicPhone || "",
          address: data.clinicAddress || "",
          timings: data.clinicTimings || "",
          consultationFee: String(data.consultationFee || 0),
          followUpFee: String(data.followUpFee || 0),
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching doctor settings:", err);
        setLoading(false);
      });
  }, [user?.doctorProfileId]);

  const handleSave = async () => {
    if (!user?.doctorProfileId) return;
    setSaving(true);

    const payload = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      specialization: profile.specialization,
      licenseNumber: profile.licenseNumber,
      address: profile.address,
      bio: profile.bio,

      clinicName: clinic.name,
      clinicPhone: clinic.phone,
      clinicAddress: clinic.address,
      clinicTimings: clinic.timings,
      consultationFee: parseFloat(clinic.consultationFee),
      followUpFee: parseFloat(clinic.followUpFee),

      emailAlerts: notifications.emailAlerts,
      smsAlerts: notifications.smsAlerts,
      appointmentReminders: notifications.appointmentReminders,
      labResultNotifications: notifications.labResultNotifications,
      systemUpdateNotifications: notifications.systemUpdateNotifications,
      patientMessageNotifications: notifications.patientMessageNotifications,
    };

    try {
      const res = await fetch(`/api/doctors/${user.doctorProfileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Settings saved successfully!");
      await refreshUser();
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.doctorProfileId) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/doctors/${user.doctorProfileId}/upload-profile-picture`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setProfile({ ...profile, profilePictureUrl: data.url });
      toast.success("Profile picture updated!");
      await refreshUser();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image");
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update password");
      }

      toast.success("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground animate-pulse font-bold">Loading Settings...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <SettingsIcon className="h-8 w-8 text-primary" /> Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile, preferences, and clinic configuration.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-2xl font-black shadow-lg shadow-primary/20 gap-2"
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-5 w-5" /> Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Tab Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl border border-border/50 shadow-xl shadow-black/5 p-4 space-y-1 sticky top-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300",
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-3xl border border-border/50 shadow-2xl shadow-black/5 overflow-hidden">
              {/* ── Profile ── */}
              {activeTab === "profile" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-8 bg-gradient-to-r from-primary to-primary/80 text-white relative overflow-hidden">
                    <div className="relative z-10 flex items-center gap-6">
                      <div className="relative group">
                        <label className="cursor-pointer block">
                          {(profile.profilePictureUrl || (user as any)?.profilePictureUrl) ? (
                            <img
                              src={profile.profilePictureUrl || (user as any)?.profilePictureUrl}
                              alt={profile.name}
                              className="w-24 h-24 rounded-3xl object-cover border-4 border-white/30"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "";
                                (e.target as HTMLImageElement).className = "hidden";
                              }}
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black border-4 border-white/30">
                              {profile.name?.charAt(0) || "D"}
                            </div>
                          )}
                          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-white text-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-4 w-4" />
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">
                          {profile.name}
                        </h2>
                        <p className="text-white/70 text-sm font-medium flex items-center gap-2 mt-1">
                          <Stethoscope className="h-3.5 w-3.5" />{" "}
                          {profile.specialization}
                        </p>
                        <Badge className="mt-2 bg-white/20 text-white border-white/30 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {profile.licenseNumber}
                        </Badge>
                      </div>
                    </div>
                    <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Full Name
                        </Label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            value={profile.name}
                            onChange={(e) =>
                              setProfile({ ...profile, name: e.target.value })
                            }
                            className="pl-10 h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Email
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            value={profile.email}
                            onChange={(e) =>
                              setProfile({ ...profile, email: e.target.value })
                            }
                            className="pl-10 h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Phone
                        </Label>
                        <div className="relative group">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            value={profile.phone}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })
                            }
                            className="pl-10 h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Specialization
                        </Label>
                        <div className="relative group">
                          <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            value={profile.specialization}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                specialization: e.target.value,
                              })
                            }
                            className="pl-10 h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-bold"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Address
                      </Label>
                      <div className="relative group">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          value={profile.address}
                          onChange={(e) =>
                            setProfile({ ...profile, address: e.target.value })
                          }
                          className="pl-10 h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Professional Bio
                      </Label>
                      <Textarea
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        className="bg-muted/30 border-0 shadow-inner rounded-xl p-4 font-medium resize-none min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Clinic Info ── */}
              {activeTab === "clinic" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight">
                        Clinic Configuration
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Update your clinic's details and fee structure.
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Clinic Name
                      </Label>
                      <Input
                        value={clinic.name}
                        onChange={(e) =>
                          setClinic({ ...clinic, name: e.target.value })
                        }
                        className="h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Clinic Phone
                      </Label>
                      <Input
                        value={clinic.phone}
                        onChange={(e) =>
                          setClinic({ ...clinic, phone: e.target.value })
                        }
                        className="h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-bold"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Address
                      </Label>
                      <Input
                        value={clinic.address}
                        onChange={(e) =>
                          setClinic({ ...clinic, address: e.target.value })
                        }
                        className="h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Working Hours
                      </Label>
                      <div className="relative group">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          value={clinic.timings}
                          onChange={(e) =>
                            setClinic({ ...clinic, timings: e.target.value })
                          }
                          className="pl-10 h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">
                      Fee Structure (PKR)
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Consultation Fee
                        </Label>
                        <Input
                          type="number"
                          value={clinic.consultationFee}
                          onChange={(e) =>
                            setClinic({
                              ...clinic,
                              consultationFee: e.target.value,
                            })
                          }
                          className="h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-black text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Follow-Up Fee
                        </Label>
                        <Input
                          type="number"
                          value={clinic.followUpFee}
                          onChange={(e) =>
                            setClinic({
                              ...clinic,
                              followUpFee: e.target.value,
                            })
                          }
                          className="h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-black text-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Notifications ── */}
              {activeTab === "notifications" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight">
                        Notification Preferences
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Control how and when you receive alerts.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "emailAlerts" as const,
                        label: "Email Alerts",
                        desc: "Receive notifications via email",
                      },
                      {
                        key: "smsAlerts" as const,
                        label: "SMS Alerts",
                        desc: "Receive notifications via SMS",
                      },
                      {
                        key: "appointmentReminders" as const,
                        label: "Appointment Reminders",
                        desc: "Get reminders before upcoming appointments",
                      },
                      {
                        key: "labResultNotifications" as const,
                        label: "Lab Result Notifications",
                        desc: "Be notified when lab results are ready",
                      },
                      {
                        key: "patientMessageNotifications" as const,
                        label: "Patient Messages",
                        desc: "Receive patient inquiries and messages",
                      },
                      {
                        key: "systemUpdateNotifications" as const,
                        label: "System Updates",
                        desc: "Get notified about system maintenance",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50"
                      >
                        <div>
                          <p className="font-bold text-foreground">
                            {item.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                        <Switch
                          checked={notifications[item.key]}
                          onCheckedChange={(checked) =>
                            setNotifications({
                              ...notifications,
                              [item.key]: checked,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Appearance ── */}
              {activeTab === "appearance" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Palette className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight">
                        Appearance & Theme
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Customize the look and feel of the application.
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-4 block">
                      Theme Selection
                    </Label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        {
                          key: "light" as const,
                          label: "Light",
                          icon: Sun,
                          bg: "bg-white",
                        },
                        {
                          key: "dark" as const,
                          label: "Dark",
                          icon: Moon,
                          bg: "bg-gray-900",
                        },
                        {
                          key: "system" as const,
                          label: "System",
                          icon: Monitor,
                          bg: "bg-gradient-to-br from-white to-gray-900",
                        },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setTheme(opt.key)}
                          className={cn(
                            "relative p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group",
                            theme === opt.key
                              ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg"
                              : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                          )}
                        >
                          {theme === opt.key && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "w-16 h-16 rounded-2xl border border-border/30 flex items-center justify-center",
                              opt.bg
                            )}
                          >
                            <opt.icon
                              className={cn(
                                "h-7 w-7",
                                opt.key === "dark"
                                  ? "text-white"
                                  : "text-foreground"
                              )}
                            />
                          </div>
                          <span className="font-bold text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50 space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 block">
                      Display Settings
                    </Label>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Language
                        </Label>
                        <Select defaultValue="en">
                          <SelectTrigger className="h-12 bg-muted/30 border-0 rounded-xl font-bold shadow-inner">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ur">Urdu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Timezone
                        </Label>
                        <Select defaultValue="pkt">
                          <SelectTrigger className="h-12 bg-muted/30 border-0 rounded-xl font-bold shadow-inner">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="pkt">
                              Pakistan (PKT, UTC+5)
                            </SelectItem>
                            <SelectItem value="utc">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Security ── */}
              {activeTab === "security" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight">
                        Security & Access
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your password and account security.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-muted/20 border border-border/50 space-y-4">
                      <h4 className="font-bold text-foreground">
                        Change Password
                      </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Current Password
                              </Label>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="h-12 bg-background/50 border-0 shadow-inner rounded-xl font-medium"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                New Password
                              </Label>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="h-12 bg-background/50 border-0 shadow-inner rounded-xl font-medium"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Confirm New Password
                              </Label>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="h-12 bg-background/50 border-0 shadow-inner rounded-xl font-medium"
                              />
                            </div>
                          </div>
                          <Button 
                            onClick={handleUpdatePassword}
                            className="bg-primary hover:bg-primary/90 h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20"
                          >
                            Update Password
                          </Button>
                        </div>
                      </div>

                    <div className="p-6 rounded-2xl bg-muted/20 border border-border/50 space-y-4">
                      <h4 className="font-bold text-foreground">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account.
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-warning/10 text-warning border-warning/30 rounded-xl font-black text-[10px] uppercase tracking-widest">
                          Not Enabled
                        </Badge>
                        <Button
                          variant="outline"
                          className="h-11 rounded-xl font-bold border-border/50"
                        >
                          Enable 2FA
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-muted/20 border border-border/50 space-y-3">
                      <h4 className="font-bold text-foreground">
                        Active Sessions
                      </h4>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              Windows · Chrome
                            </p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                              Islamabad · Current Session
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-success/10 text-success border-success/30 rounded-lg text-[10px] font-black uppercase">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
