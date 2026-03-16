import { User, Phone, Calendar, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PatientDialog } from "./modals/PatientDialog";

const patients = [
  {
    id: 1,
    mrNumber: "MR001234",
    name: "Sarah Johnson",
    phone: "+1 234-567-8901",
    age: 32,
    gender: "Female",
    lastVisit: "2025-11-02",
  },
  {
    id: 2,
    mrNumber: "MR001235",
    name: "James Wilson",
    phone: "+1 234-567-8902",
    age: 45,
    gender: "Male",
    lastVisit: "2025-11-01",
  },
  {
    id: 3,
    mrNumber: "MR001236",
    name: "Maria Garcia",
    phone: "+1 234-567-8903",
    age: 28,
    gender: "Female",
    lastVisit: "2025-10-30",
  },
  {
    id: 4,
    mrNumber: "MR001237",
    name: "Robert Brown",
    phone: "+1 234-567-8904",
    age: 55,
    gender: "Male",
    lastVisit: "2025-10-28",
  },
];

export function PatientsList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const handleEdit = (patient: any) => {
    setSelectedPatient(patient);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedPatient(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Patients Overview</h2>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 text-sm font-semibold text-muted-foreground">MR Number</th>
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Patient</th>
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Contact</th>
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Age</th>
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Gender</th>
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Last Visit</th>
              <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-b border-border last:border-0 hover:bg-accent transition-colors">
                <td className="py-4">
                  <span className="font-mono text-sm text-muted-foreground">{patient.mrNumber}</span>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold">
                      {patient.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="font-medium text-foreground">{patient.name}</span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{patient.phone}</span>
                  </div>
                </td>
                <td className="py-4 text-sm text-foreground">{patient.age}</td>
                <td className="py-4">
                  <Badge variant="outline">{patient.gender}</Badge>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{patient.lastVisit}</span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(patient)}>
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

    <PatientDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      patient={selectedPatient}
    />
  </>
  );
}
