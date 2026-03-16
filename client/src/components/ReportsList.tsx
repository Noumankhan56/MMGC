import { FileText, Download, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const reports = [
  {
    id: 1,
    name: "Monthly Revenue Report",
    type: "Financial",
    period: "October 2025",
    generatedOn: "2025-11-01",
    size: "2.4 MB",
  },
  {
    id: 2,
    name: "Patient Visit Analysis",
    type: "Medical",
    period: "Q3 2025",
    generatedOn: "2025-10-28",
    size: "1.8 MB",
  },
  {
    id: 3,
    name: "Lab Tests Summary",
    type: "Laboratory",
    period: "October 2025",
    generatedOn: "2025-11-01",
    size: "3.2 MB",
  },
  {
    id: 4,
    name: "Procedure Statistics",
    type: "Medical",
    period: "October 2025",
    generatedOn: "2025-11-02",
    size: "1.5 MB",
  },
];

const typeColors = {
  Financial: "bg-success/10 text-success",
  Medical: "bg-primary/10 text-primary",
  Laboratory: "bg-secondary/10 text-secondary",
};

export function ReportsList() {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Generated Reports</h2>
        <Button size="sm">Generate New Report</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <Badge className={typeColors[report.type as keyof typeof typeColors]}>
                {report.type}
              </Badge>
            </div>

            <h3 className="font-semibold text-foreground mb-2">{report.name}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Period:</span>
                <span className="text-foreground font-medium">{report.period}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generated:</span>
                <div className="flex items-center gap-1 text-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{report.generatedOn}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Size:</span>
                <span className="text-foreground">{report.size}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <FileText className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
