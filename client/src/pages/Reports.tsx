import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Download, Calendar, Users, DollarSign, Activity } from "lucide-react";
import { useState } from "react";

const Reports = () => {
  const [open, setOpen] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports Management</h1>
            <p className="mt-1 text-muted-foreground">
              Generate medical, financial & patient reports in PDF or Excel
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FileText className="w-4 h-4" />
                Generate New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Report Type</Label>
                  <Select defaultValue="revenue">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Monthly Revenue Report
                        </div>
                      </SelectItem>
                      <SelectItem value="patient-history">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Patient Treatment History
                        </div>
                      </SelectItem>
                      <SelectItem value="lab-summary">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Lab Tests Summary
                        </div>
                      </SelectItem>
                      <SelectItem value="appointments">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Appointments Report
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Format</Label>
                  <Select defaultValue="PDF">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF Document</SelectItem>
                      <SelectItem value="Excel">Excel Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Generate & Download
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Excel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">26</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <FileText className="mx-auto h-16 w-16 text-green-600 mb-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;