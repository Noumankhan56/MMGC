import { Activity, User, UserCog, Calendar, DollarSign, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ProcedureDialog } from "./modals/ProcedureDialog";

const procedures = [
  {
    id: 1,
    type: "Normal Delivery",
    patient: "Sarah Johnson",
    doctor: "Dr. Michael Chen",
    nurse: "Nurse Emma Wilson",
    date: "2025-11-05",
    status: "completed",
    cost: "$1,200",
  },
  {
    id: 2,
    type: "C-Section",
    patient: "Maria Garcia",
    doctor: "Dr. Michael Chen",
    nurse: "Nurse Emma Wilson",
    date: "2025-11-05",
    status: "in-progress",
    cost: "$2,500",
  },
  {
    id: 3,
    type: "Ultrasound",
    patient: "Lisa Anderson",
    doctor: "Dr. James Anderson",
    nurse: "Nurse Sarah Brown",
    date: "2025-11-06",
    status: "scheduled",
    cost: "$180",
  },
  {
    id: 4,
    type: "Surgery",
    patient: "Robert Brown",
    doctor: "Dr. Emily Rodriguez",
    nurse: "Nurse Emma Wilson",
    date: "2025-11-06",
    status: "scheduled",
    cost: "$3,200",
  },
];

const statusColors = {
  completed: "bg-success text-success-foreground",
  "in-progress": "bg-warning text-warning-foreground",
  scheduled: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

export function ProceduresList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);

  const handleEdit = (procedure: any) => {
    setSelectedProcedure(procedure);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedProcedure(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Procedures Management</h2>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Procedure
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Type</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Patient</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Doctor</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Nurse</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Cost</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {procedures.map((procedure) => (
                <tr key={procedure.id} className="border-b border-border last:border-0 hover:bg-accent transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{procedure.type}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{procedure.patient}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserCog className="h-4 w-4" />
                      <span>{procedure.doctor}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">{procedure.nurse}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{procedure.date}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1 text-sm font-medium text-success">
                      <DollarSign className="h-4 w-4" />
                      <span>{procedure.cost}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge className={statusColors[procedure.status as keyof typeof statusColors]}>
                      {procedure.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(procedure)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ProcedureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        procedure={selectedProcedure}
      />
    </>
  );
}
