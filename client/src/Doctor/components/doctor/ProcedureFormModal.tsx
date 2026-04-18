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
import { Textarea } from "@/Doctor/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Doctor/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/Auth/AuthContext";
import { Stethoscope, ClipboardList, Pill, TestTube } from "lucide-react";

interface ProcedureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProcedureFormModal({ isOpen, onClose, onSuccess }: ProcedureFormModalProps) {
  const { user } = useAuth();
  const doctorId = user?.doctorProfileId || 1;
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: 0,
    procedureType: "Consultation",
    amount: 1000,
    performedAt: new Date().toISOString(),
    notes: "",
    prescription: "",
    doctorId: doctorId,
  });

  const procedureTypes = [
    "Normal Delivery",
    "C-Section",
    "Ultrasound Scan",
    "Gynaecological Surgery",
    "OPD Consultation",
    "IPD Treatment",
    "Manual Removal of Placenta (MRP)",
    "Dilation and Curettage (D&C)",
    "Antenatal Checkup",
  ];

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
    if (formData.patientId === 0) {
      toast.error("Please select a patient");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/procedures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          doctorId: doctorId
        }),
      });

      if (res.ok) {
        toast.success("Procedure saved successfully");
        onSuccess();
        onClose();
      } else {
        const err = await res.text();
        toast.error(`Failed to save: ${err}`);
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
        <div className="bg-primary p-6 text-white">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md">
                 <Stethoscope className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl font-bold">New Medical Procedure</DialogTitle>
           </div>
           <p className="text-primary-foreground/70 text-xs mt-2">Document surgical, diagnostic or clinical treatments</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-white space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Select Patient</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, patientId: parseInt(val) })}>
                  <SelectTrigger className="h-11 rounded-xl">
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
                  <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Type</Label>
                  <Select defaultValue="OPD Consultation" onValueChange={(val) => setFormData({ ...formData, procedureType: val })}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {procedureTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Amount (Rs)</Label>
                  <Input 
                    type="number" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1">
                  <ClipboardList className="h-3 w-3" /> Treatment Summary / Notes
                </Label>
                <Textarea 
                  placeholder="Clinical findings, observations, or surgical steps..." 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="rounded-xl min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1">
                  <Pill className="h-3 w-3" /> Prescriptions / Lab Recommendations
                </Label>
                <Textarea 
                  placeholder="Medicine with dosage, or recommended lab tests (e.g. CBC, Ultrasound)..." 
                  value={formData.prescription}
                  onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                  className="rounded-xl min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/25 rounded-xl">
                {loading ? "Saving Records..." : "Save & Generate Invoice"}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

