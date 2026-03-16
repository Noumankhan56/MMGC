import { UserCog, Calendar, DollarSign, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DoctorDialog } from "./modals/DoctorDialog";

const doctors = [
  {
    id: 1,
    name: "Dr. Michael Chen",
    specialization: "Gynecologist",
    appointments: 45,
    revenue: "$12,340",
    status: "active",
  },
  {
    id: 2,
    name: "Dr. Emily Rodriguez",
    specialization: "General Surgeon",
    appointments: 38,
    revenue: "$10,890",
    status: "active",
  },
  {
    id: 3,
    name: "Dr. Sarah Williams",
    specialization: "Pediatrician",
    appointments: 52,
    revenue: "$15,670",
    status: "active",
  },
  {
    id: 4,
    name: "Dr. James Anderson",
    specialization: "Radiologist",
    appointments: 28,
    revenue: "$8,920",
    status: "inactive",
  },
];

export function DoctorsList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const handleEdit = (doctor: any) => {
    setSelectedDoctor(doctor);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedDoctor(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Doctors Overview</h2>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Doctor</th>
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Specialization</th>
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Appointments</th>
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Revenue</th>
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="border-b border-border last:border-0 hover:bg-accent transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {doctor.name.split(" ")[1][0]}
                    </div>
                    <span className="font-medium text-foreground">{doctor.name}</span>
                  </div>
                </td>
                <td className="py-4 text-sm text-muted-foreground">{doctor.specialization}</td>
                <td className="py-4">
                  <div className="flex items-center gap-1 text-sm text-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{doctor.appointments}</span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-1 text-sm font-medium text-success">
                    <DollarSign className="h-4 w-4" />
                    <span>{doctor.revenue}</span>
                  </div>
                </td>
                <td className="py-4">
                  <Badge
                    className={
                      doctor.status === "active"
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {doctor.status}
                  </Badge>
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(doctor)}>
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>

    <DoctorDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      doctor={selectedDoctor}
    />
  </>
  );
}
