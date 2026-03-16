import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ProcedureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedure?: any;
}

export function ProcedureDialog({ open, onOpenChange, procedure }: ProcedureDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(procedure ? "Procedure updated successfully" : "Procedure scheduled successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{procedure ? "Edit Procedure" : "Schedule New Procedure"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Procedure Type</Label>
              <Select defaultValue={procedure?.type}>
                <SelectTrigger>
                  <SelectValue placeholder="Select procedure type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal Delivery">Normal Delivery</SelectItem>
                  <SelectItem value="C-Section">C-Section</SelectItem>
                  <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="Endoscopy">Endoscopy</SelectItem>
                  <SelectItem value="Biopsy">Biopsy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Input id="patient" defaultValue={procedure?.patient} placeholder="Enter patient name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Select defaultValue={procedure?.doctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Michael Chen">Dr. Michael Chen</SelectItem>
                  <SelectItem value="Dr. Emily Rodriguez">Dr. Emily Rodriguez</SelectItem>
                  <SelectItem value="Dr. Sarah Williams">Dr. Sarah Williams</SelectItem>
                  <SelectItem value="Dr. James Anderson">Dr. James Anderson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nurse">Nurse</Label>
              <Select defaultValue={procedure?.nurse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nurse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nurse Emma Wilson">Nurse Emma Wilson</SelectItem>
                  <SelectItem value="Nurse Sarah Brown">Nurse Sarah Brown</SelectItem>
                  <SelectItem value="Nurse Lisa Taylor">Nurse Lisa Taylor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" defaultValue={procedure?.date} type="date" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" defaultValue={procedure?.cost} type="text" placeholder="$0.00" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Enter procedure notes or special instructions" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={procedure?.status || "scheduled"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {procedure ? "Update" : "Schedule"} Procedure
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
