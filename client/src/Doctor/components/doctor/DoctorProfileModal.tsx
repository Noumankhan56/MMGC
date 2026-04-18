import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Doctor/components/ui/dialog";
import { Button } from "@/Doctor/components/ui/button";
import { Input } from "@/Doctor/components/ui/input";
import { Label } from "@/Doctor/components/ui/label";
import { toast } from "sonner";
import { User, Phone, Mail, Stethoscope, Save, X, Plus, Trash2, Clock } from "lucide-react";
import { useAuth } from "@/Auth/AuthContext";

interface DoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DoctorProfileModal({ isOpen, onClose, onSuccess }: DoctorProfileModalProps) {
  const { user } = useAuth();
  const doctorId = user?.doctorProfileId || 1;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
    isActive: true,
    workSchedule: [] as any[],
  });

  useEffect(() => {
    if (isOpen) {
      fetchDoctor();
    }
  }, [isOpen]);

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`/api/doctors/${doctorId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name,
          specialization: data.specialization || "",
          phone: data.phone || "",
          email: data.email || "",
          isActive: data.status === "Active",
          workSchedule: data.workSchedule || [],
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load profile data");
    }
  };

  const addScheduleSlot = () => {
    setFormData({
      ...formData,
      workSchedule: [...formData.workSchedule, { day: "Monday", start: "09:00", end: "17:00" }]
    });
  };

  const removeScheduleSlot = (index: number) => {
    const next = [...formData.workSchedule];
    next.splice(index, 1);
    setFormData({ ...formData, workSchedule: next });
  };

  const updateScheduleSlot = (index: number, field: string, value: string) => {
    const next = [...formData.workSchedule];
    next[index] = { ...next[index], [field]: value };
    setFormData({ ...formData, workSchedule: next });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/doctors/${doctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        onSuccess();
        onClose();
      } else {
        const errorText = await res.text();
        toast.error(`Update failed: ${errorText || "Please check your information"}`);
      }
    } catch (e) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
        <div className="bg-primary p-6 text-white text-center relative">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            <User className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">Doctor Profile</DialogTitle>
          <p className="text-primary-foreground/70 text-xs mt-1">Update your professional identity</p>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/10 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b pb-1">Basic Info</h3>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="pl-10 h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Specialization</Label>
                <div className="relative group">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.specialization} 
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="pl-10 h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-10 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Email</Label>
                <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-10 rounded-xl" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Work Schedule</h3>
                <Button type="button" variant="ghost" size="sm" onClick={addScheduleSlot} className="h-7 text-primary hover:bg-primary/10">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              <div className="space-y-3">
                {formData.workSchedule.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground italic py-4">No schedule set</p>
                )}
                {formData.workSchedule.map((slot, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-xl space-y-2 relative group">
                    <button 
                      type="button" 
                      onClick={() => removeScheduleSlot(idx)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="grid grid-cols-1 gap-2">
                      <select 
                        className="w-full bg-white border rounded-lg text-xs p-1"
                        value={slot.day}
                        onChange={(e) => updateScheduleSlot(idx, "day", e.target.value)}
                      >
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <div className="flex gap-2 items-center">
                        <Input 
                          type="time" 
                          className="h-7 text-[10px] p-1" 
                          value={slot.start} 
                          onChange={(e) => updateScheduleSlot(idx, "start", e.target.value)}
                        />
                        <span className="text-xs">to</span>
                        <Input 
                          type="time" 
                          className="h-7 text-[10px] p-1" 
                          value={slot.end} 
                          onChange={(e) => updateScheduleSlot(idx, "end", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 mt-6 border-t">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-primary hover:bg-primary/90 h-11 rounded-xl font-bold shadow-lg shadow-primary/25"
            >
              {loading ? "Saving Changes..." : <><Save className="h-4 w-4 mr-2" /> Save Profile</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

