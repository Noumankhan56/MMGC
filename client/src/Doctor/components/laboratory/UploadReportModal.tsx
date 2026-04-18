import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Doctor/components/ui/dialog";
import { Button } from "@/Doctor/components/ui/button";
import { Input } from "@/Doctor/components/ui/input";
import { Label } from "@/Doctor/components/ui/label";
import { Textarea } from "@/Doctor/components/ui/textarea";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, X } from "lucide-react";

interface UploadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testId: number;
  patientName: string;
  testName: string;
}

export function UploadReportModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  testId, 
  patientName, 
  testName 
}: UploadReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const [findings, setFindings] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/laboratory/${testId}/upload-report`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reportFilePath: reportUrl || "/uploads/mock-report.pdf", 
          reportFindings: findings 
        }),
      });

      if (res.ok) {
        toast.success("Report uploaded and doctor notified!");
        onSuccess();
        onClose();
        setReportUrl("");
        setFindings("");
      } else {
        toast.error("Failed to upload report");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
        <DialogHeader className="p-8 bg-primary text-white relative">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
            <Upload className="h-7 w-7" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">Upload Test Report</DialogTitle>
          <p className="text-primary-foreground/70 text-sm mt-1">Tagging results for {patientName}</p>
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Target Diagnostic</p>
             <p className="text-sm font-bold text-foreground">{testName}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Report Source (URL/Path)</Label>
              <div className="relative group">
                 <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input 
                   placeholder="e.g., medical-server/reports/2024/..." 
                   value={reportUrl} 
                   onChange={(e) => setReportUrl(e.target.value)}
                   className="pl-10 h-12 bg-muted/30 border-0 shadow-inner rounded-xl font-medium"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Key Clinical Findings (FR14.2)</Label>
              <Textarea 
                placeholder="Summarize the test results here..." 
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                className="min-h-[120px] bg-muted/30 border-0 shadow-inner rounded-xl p-4 font-medium resize-none"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-primary hover:bg-primary/90 h-14 rounded-2xl font-black shadow-lg shadow-primary/25 gap-2"
            >
              {loading ? "Processing..." : <><CheckCircle2 className="h-5 w-5" /> Finalize & Notify Doctor</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
