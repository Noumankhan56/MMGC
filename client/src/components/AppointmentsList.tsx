import { Calendar, Clock, User, UserCog, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AppointmentDialog } from "./modals/AppointmentDialog";

const appointments = [
  {
    id: 1,
    patient: "Sarah Johnson",
    doctor: "Dr. Michael Chen",
    date: "2025-11-05",
    time: "09:00 AM",
    type: "Ultrasound",
    status: "confirmed",
  },
  {
    id: 2,
    patient: "James Wilson",
    doctor: "Dr. Emily Rodriguez",
    date: "2025-11-05",
    time: "10:30 AM",
    type: "Consultation",
    status: "pending",
  },
  {
    id: 3,
    patient: "Maria Garcia",
    doctor: "Dr. Michael Chen",
    date: "2025-11-05",
    time: "02:00 PM",
    type: "Surgery",
    status: "confirmed",
  },
  {
    id: 4,
    patient: "Robert Brown",
    doctor: "Dr. Sarah Williams",
    date: "2025-11-06",
    time: "11:00 AM",
    type: "Check-up",
    status: "pending",
  },
];

const statusColors = {
  confirmed: "bg-success text-success-foreground",
  pending: "bg-warning text-warning-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

export function AppointmentsList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedAppointment(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Today's Appointments</h2>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Appointment
          </Button>
        </div>

        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{appointment.patient}</span>
                  <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                    {appointment.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <UserCog className="h-4 w-4" />
                    <span>{appointment.doctor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{appointment.time}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-foreground">Type: </span>
                  <span className="text-muted-foreground">{appointment.type}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(appointment)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={selectedAppointment}
      />
    </>
  );
}
