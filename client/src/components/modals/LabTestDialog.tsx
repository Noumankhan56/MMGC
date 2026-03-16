import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface LabTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test?: any;
}

export function LabTestDialog({ open, onOpenChange, test }: LabTestDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(test ? "Lab test updated successfully" : "Lab test created successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{test ? "Edit Lab Test" : "Create New Lab Test"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue={test?.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blood">Blood</SelectItem>
                  <SelectItem value="Radiology">Radiology</SelectItem>
                  <SelectItem value="Pathology">Pathology</SelectItem>
                  <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                  <SelectItem value="Microbiology">Microbiology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testName">Test Name</Label>
              <Input id="testName" defaultValue={test?.testName} placeholder="Enter test name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Input id="patient" defaultValue={test?.patient} placeholder="Enter patient name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Test Date</Label>
              <Input id="date" defaultValue={test?.date} type="date" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labStaff">Lab Staff</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Assign lab staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lab Tech 1">Lab Technician - John Smith</SelectItem>
                  <SelectItem value="Lab Tech 2">Lab Technician - Emily Davis</SelectItem>
                  <SelectItem value="Lab Tech 3">Lab Technician - Michael Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Test Notes</Label>
              <Textarea id="notes" placeholder="Enter any special instructions or notes" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={test?.status || "pending"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {test ? "Update" : "Create"} Lab Test
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
