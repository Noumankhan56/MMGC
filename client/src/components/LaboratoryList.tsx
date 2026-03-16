import { FlaskConical, User, Calendar, FileText, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LabTestDialog } from "./modals/LabTestDialog";

const labTests = [
  {
    id: 1,
    category: "Blood",
    testName: "Complete Blood Count",
    patient: "Sarah Johnson",
    date: "2025-11-05",
    status: "completed",
    reportAvailable: true,
  },
  {
    id: 2,
    category: "Radiology",
    testName: "Chest X-Ray",
    patient: "James Wilson",
    date: "2025-11-05",
    status: "in-progress",
    reportAvailable: false,
  },
  {
    id: 3,
    category: "Ultrasound",
    testName: "Abdominal Ultrasound",
    patient: "Maria Garcia",
    date: "2025-11-06",
    status: "pending",
    reportAvailable: false,
  },
  {
    id: 4,
    category: "Pathology",
    testName: "Biopsy Analysis",
    patient: "Robert Brown",
    date: "2025-11-04",
    status: "completed",
    reportAvailable: true,
  },
];

const statusColors = {
  completed: "bg-success text-success-foreground",
  "in-progress": "bg-warning text-warning-foreground",
  pending: "bg-secondary text-secondary-foreground",
};

const categoryColors = {
  Blood: "bg-destructive/10 text-destructive",
  Radiology: "bg-primary/10 text-primary",
  Ultrasound: "bg-secondary/10 text-secondary",
  Pathology: "bg-warning/10 text-warning",
};

export function LaboratoryList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  const handleEdit = (test: any) => {
    setSelectedTest(test);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedTest(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Laboratory Tests</h2>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Lab Test
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Category</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Test Name</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Patient</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Report</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {labTests.map((test) => (
                <tr key={test.id} className="border-b border-border last:border-0 hover:bg-accent transition-colors">
                  <td className="py-4">
                    <Badge className={categoryColors[test.category as keyof typeof categoryColors]}>
                      {test.category}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{test.testName}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{test.patient}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{test.date}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge className={statusColors[test.status as keyof typeof statusColors]}>
                      {test.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    {test.reportAvailable ? (
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Report
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not available</span>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(test)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Upload Report
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <LabTestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        test={selectedTest}
      />
    </>
  );
}
