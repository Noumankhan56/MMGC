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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Doctor/components/ui/select";
import { toast } from "sonner";

import { useAuth } from "@/Auth/AuthContext";

export function AppointmentFormModal({ isOpen, onClose, onSuccess }: AppointmentFormModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: user?.doctorProfileId || 0,
    date: new Date().toISOString()?.split('T')[0] || "",
    time: "09:00",
    amount: 1000,
    status: "Scheduled",
  });


  useEffect(() => {
    if (user?.doctorProfileId) {
      setFormData(prev => ({ ...prev, doctorId: user.doctorProfileId }));
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);


  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) {
      toast.error("Please select a patient");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          patientId: parseInt(formData.patientId),
        }),
      });

      if (res.ok) {
        toast.success("Appointment created successfully");
        onSuccess();
        onClose();
      } else {
        const err = await res.text();
        toast.error(`Failed: ${err}`);
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Patient</Label>
              <Select onValueChange={(val) => setFormData({ ...formData, patientId: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Search Patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name} ({p.mrNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input 
                  type="time" 
                  value={formData.time} 
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Consultation Fee (Rs)</Label>
              <Input 
                type="number" 
                value={formData.amount} 
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
