import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Doctor/components/ui/dialog";
import { Badge } from "@/Doctor/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Doctor/components/ui/tabs";
import {
  Calendar,
  FileText,
  Stethoscope,
  Activity,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Download,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/Auth/AuthContext";

interface PatientHistoryModalProps {
  patientId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientHistoryModal({ patientId, isOpen, onClose }: PatientHistoryModalProps) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchHistory();
    }
  }, [isOpen, patientId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patient-history/${patientId}`);
      if (res.ok) {
        const historyData = await res.json();
        setData(historyData);
      } else {
        toast.error("Failed to load patient history");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error fetching history");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (procedure: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Treatment Summary - ${data?.patientInfo?.name || "Patient"}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px; }
            .hospital-name { font-size: 24px; font-bold; color: #0056b3; margin: 0; }
            .doc-type { font-size: 18px; color: #666; margin: 5px 0 0; text-transform: uppercase; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0056b3; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .item { margin-bottom: 10px; }
            .label { font-size: 12px; color: #888; display: block; }
            .value { font-size: 14px; font-weight: 500; }
            .notes-box { background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; white-space: pre-wrap; margin-top: 10px; }
            .footer { margin-top: 50px; border-top: 1px solid #eee; pt-10; font-size: 12px; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="hospital-name">MMGC Medical Center</h1>
            <p class="doc-type">Medical Procedure Summary</p>
          </div>
          <div class="section">
            <h2 class="section-title">Patient Information</h2>
            <div class="grid">
              <div class="item"><span class="label">Patient Name</span><span class="value">${data.patientInfo.name}</span></div>
              <div class="item"><span class="label">MR Number</span><span class="value">${data.patientInfo.mrNumber}</span></div>
              <div class="item"><span class="label">Gender</span><span class="value">${data.patientInfo.gender}</span></div>
              <div class="item"><span class="label">Date of Birth</span><span class="value">${data.patientInfo.dateOfBirth?.split('T')[0]}</span></div>
            </div>
          </div>
          <div class="section">
            <h2 class="section-title">Procedure Details</h2>
            <div class="grid">
              <div class="item"><span class="label">Procedure Type</span><span class="value">${procedure.procedureType}</span></div>
              <div class="item"><span class="label">Date Performed</span><span class="value">${new Date(procedure.performedAt).toLocaleDateString()}</span></div>
              <div class="item"><span class="label">Doctor</span><span class="value">Dr. ${procedure.doctorName}</span></div>
              <div class="item"><span class="label">Amount Paid</span><span class="value">Rs. ${procedure.amount}</span></div>
            </div>
          </div>
          <div class="section">
            <h2 class="section-title">Clinical Findings & Summary</h2>
            <div class="notes-box">${procedure.notes || 'No notes recorded.'}</div>
          </div>
          <div class="section">
            <h2 class="section-title">Prescriptions & Advice</h2>
            <div class="notes-box">${procedure.prescription || 'No prescriptions recorded.'}</div>
          </div>
          <div class="footer">
            Generated on ${new Date().toLocaleString()} - Digital Medical Record
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const approveReport = async (reportId: number) => {
    try {
      const res = await fetch(`/api/laboratory-reports/${reportId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: `Dr. ${user?.name || "Doctor"}` })
      });

      if (res.ok) {
        toast.success("Report approved successfully");
        fetchHistory();
      } else {
        toast.error("Failed to approve report");
      }
    } catch (e) {
      toast.error("Network error while approving");
    }
  };


  if (!isOpen) return null;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-0 shadow-2xl">
        <DialogHeader className="bg-primary p-6 text-white rounded-t-3xl">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
               <Activity className="h-6 w-6 text-white" />
            </div>
            Medical History - {data?.patientInfo?.name || "Patient"}
            <Badge variant="outline" className="ml-2 text-white border-white/30 bg-white/10">{data?.patientInfo?.mrNumber}</Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
             <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             <p className="text-muted-foreground font-medium italic">Synchronizing medical records...</p>
          </div>
        ) : !data ? (
          <div className="py-20 text-center text-muted-foreground">No records found</div>
        ) : (
          <div className="p-8 space-y-8">
            {/* Patient Info Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-muted/30 p-6 rounded-2xl border border-border/50">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Gender</p>
                <p className="font-bold flex items-center gap-2 text-foreground">
                   {data.patientInfo.gender === 'Female' ? <span className="w-2 h-2 rounded-full bg-pink-500"></span> : <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                   {data.patientInfo.gender}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Contact</p>
                <p className="font-bold text-foreground">{data.patientInfo.phone || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">DOB</p>
                <p className="font-bold text-foreground">{data.patientInfo.dateOfBirth?.split('T')[0] || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Registered</p>
                <p className="font-bold text-foreground">{data.patientInfo.createdAt?.split('T')[0] || "N/A"}</p>
              </div>
            </div>

            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl mb-6">
                <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold">
                  <Calendar className="h-4 w-4 mr-2" /> Appointments
                </TabsTrigger>
                <TabsTrigger value="procedures" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold">
                  <Stethoscope className="h-4 w-4 mr-2" /> Procedures
                </TabsTrigger>
                <TabsTrigger value="lab" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold">
                  <Activity className="h-4 w-4 mr-2" /> Lab Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appointments" className="space-y-4">
                {data.appointments.length === 0 ? (
                  <div className="p-12 text-center bg-muted/10 border-2 border-dashed rounded-2xl">
                     <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                     <p className="text-muted-foreground italic">No appointment history found for this patient.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border border rounded-2xl overflow-hidden shadow-sm bg-card">
                    {data.appointments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((a: any) => (
                      <div key={a.id} className="p-4 hover:bg-muted/30 flex justify-between items-center transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{a.date}</p>
                            <p className="text-xs text-muted-foreground">Consultation with Dr. {a.doctorName}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-bold text-foreground">{a.time}</p>
                            <Badge variant={a.status === 'Completed' ? 'success' as any : 'outline'} className="text-[10px] h-5">
                               {a.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="procedures" className="space-y-5">
                 {data.procedures.length === 0 ? (
                  <div className="p-12 text-center bg-muted/10 border-2 border-dashed rounded-2xl">
                    <Stethoscope className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground italic">No procedures or treatments recorded.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.procedures.map((p: any) => (
                      <div key={p.id} className="p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                              <Stethoscope className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-black text-lg text-primary">{p.procedureType}</h4>
                              <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {new Date(p.performedAt).toLocaleDateString()}
                                <span className="mx-1">•</span> 
                                <User className="h-3 w-3" /> Dr. {p.doctorName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xl font-black text-foreground">Rs.{p.amount}</p>
                             <Badge className="bg-success/10 text-success border-0 text-[10px]">Payment Received</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                           <div className="space-y-2">
                             <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 border-l-2 border-primary/30">Treatment Summary</h5>
                             <div className="text-sm text-foreground bg-muted/20 p-4 rounded-xl border border-dashed min-h-[60px]">
                               {p.notes || <span className="italic text-muted-foreground/50">No clinical notes recorded.</span>}
                             </div>
                           </div>
                           <div className="space-y-2">
                             <h5 className="text-[10px] font-black uppercase text-success tracking-widest pl-1 border-l-2 border-success/30 font-bold">Prescriptions & Advice</h5>
                             <div className="text-sm text-success-foreground bg-success/5 p-4 rounded-xl border border-success/10 min-h-[60px]">
                               {p.prescription || <span className="italic text-muted-foreground/50">No specific prescription provided.</span>}
                             </div>
                           </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-2">
                           <Button 
                             onClick={() => handlePrint(p)}
                             variant="outline" 
                             size="sm" 
                             className="h-9 px-4 rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white font-bold transition-all shadow-sm"
                           >
                             <Download className="h-4 w-4 mr-2" /> Download Summary
                           </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lab" className="space-y-4">
                {data.labTests.length === 0 ? (
                  <div className="p-12 text-center bg-muted/10 border-2 border-dashed rounded-2xl">
                    <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground italic">No lab reports or scans currently available.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.labTests.map((l: any) => (
                      <div key={l.id} className="flex items-center justify-between p-4 border rounded-2xl hover:bg-muted/10 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{l.testName}</p>
                            <p className="text-[10px] font-bold text-muted-foreground">{new Date(l.orderedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {l.isCompleted ? (
                            l.isApproved ? (
                              <div className="flex flex-col items-end">
                                <Badge className="bg-success text-white border-0 text-[10px] h-6 px-3">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
                                </Badge>
                                <span className="text-[10px] font-bold text-muted-foreground mt-1">Dr. {l.approvedBy}</span>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white font-bold rounded-lg"
                                onClick={() => approveReport(l.id)}
                              >
                                Review & Approve
                              </Button>
                            )
                          ) : (
                            <Badge variant="outline" className="flex gap-1 items-center text-orange-600 border-orange-200 bg-orange-50 text-[10px] h-6">
                              <Clock className="h-3 w-3" /> Processing
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" disabled={!l.isCompleted} className="rounded-full hover:bg-muted group-hover:bg-white shadow-none">
                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

