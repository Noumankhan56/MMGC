import { useState, useEffect } from "react";
import { Button } from "@/Patient/components/ui/button";
import { Input } from "@/Patient/components/ui/input";
import { Label } from "@/Patient/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Patient/components/ui/select";
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  FlaskConical, 
  ClipboardList, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/Patient/hooks/use-toast";
import { cn } from "@/Patient/lib/utils";
import { useAuth } from "@/Auth/AuthContext";

const BookService = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    labTestTypeId: "",
    procedureType: "",
    notes: ""
  });

  useEffect(() => {
    // Parallel fetching for performance
    Promise.all([
      fetch("/api/doctors").then(res => res.json()),
      fetch("/api/laboratory/types").then(res => res.json())
    ]).then(([dData, lData]) => {
      setDoctors(dData || []);
      setLabTests(lData || []);
      setLoading(false);
    });
  }, []);

  const handleBooking = async () => {
    if (!user?.patientProfileId) {
      toast({ title: "Error", description: "You must be logged in as a patient.", variant: "destructive" });
      return;
    }

    const patientId = user.patientProfileId;
    setLoading(true);
    
    try {
      const endpoint = serviceType === "appointment" ? "/appointments" : 
                       serviceType === "lab" ? "/laboratory" : "/procedures";
      
      const payload: any = {
        patientId: Number(patientId),
        notes: formData.notes
      };

      if (serviceType === "appointment") {
        payload.doctorId = Number(formData.doctorId);
        payload.date = formData.date;
        payload.time = formData.time;
        payload.status = "Scheduled";
      } else if (serviceType === "lab") {
        payload.labTestTypeId = Number(formData.labTestTypeId);
        payload.doctorNotes = formData.notes;
        payload.isUrgent = false;
      } else if (serviceType === "procedure") {
        payload.procedureType = formData.procedureType;
        payload.status = "Pending";
      }

      const res = await fetch(`/api${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStep(4); // Success step
        toast({ title: "Booking Successful", description: "Your request has been received and is pending approval." });
      } else {
        toast({ title: "Booking Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Connection error.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return "Choose Service Type";
      case 2: return `Configure ${serviceType?.toUpperCase()} Settings`;
      case 3: return "Review & Confirm";
      case 4: return "Booking Confirmed";
      default: return "";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{getStepTitle()}</h1>
        <p className="text-muted-foreground">Follow the steps to schedule your healthcare service at MMGC.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center gap-4 mb-8">
         {[1, 2, 3].map((s) => (
           <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                step === s ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" : 
                step > s ? "bg-primary/20 text-primary" : "bg-accent text-muted-foreground"
              )}>
                {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
              {s < 3 && <div className={cn("w-12 h-0.5 rounded-full", step > s ? "bg-primary/30" : "bg-border")} />}
           </div>
         ))}
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-xl shadow-foreground/5 overflow-hidden">
        {/* Step 1: Select Type */}
        {step === 1 && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: "appointment", title: "Doctor Appointment", icon: Stethoscope, desc: "In-person or online consultation" },
              { id: "lab", title: "Laboratory Test", icon: FlaskConical, desc: "Blood, urine, or diagnostic tests" },
              { id: "procedure", title: "Medical Procedure", icon: ClipboardList, desc: "Gynae requests (Subject to Approval)" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => { setServiceType(type.id); setStep(2); }}
                className={cn(
                  "p-8 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-4 group",
                  serviceType === type.id ? "border-primary bg-primary/5 shadow-inner" : "border-border hover:border-primary/40 hover:bg-accent/50"
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <type.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1">
                   <h3 className="font-bold text-lg">{type.title}</h3>
                   <p className="text-xs text-muted-foreground leading-relaxed">{type.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && (
          <div className="p-8 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serviceType === "appointment" && (
                   <div className="space-y-2 md:col-span-2">
                     <Label>Preferred Specialist</Label>
                     <Select onValueChange={v => setFormData({...formData, doctorId: v})}>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select a Doctor" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                           {doctors.map(d => (
                             <SelectItem key={d.id} value={d.id.toString()}>{d.name} ({d.specialization || "Physician"})</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                   </div>
                )}
                
                {serviceType === "lab" && (
                   <div className="space-y-2 md:col-span-2">
                     <Label>Test Required</Label>
                     <Select onValueChange={v => setFormData({...formData, labTestTypeId: v})}>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select Diagnostic Test" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                           {labTests.map(t => (
                             <SelectItem key={t.id} value={t.id.toString()}>{t.name} - Rs. {t.defaultPrice}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                   </div>
                )}

                {serviceType === "procedure" && (
                   <div className="space-y-2 md:col-span-2">
                     <Label>Requested Procedure</Label>
                     <Input 
                        placeholder="e.g. Delivery, Follow-up Surgery" 
                        className="h-12 rounded-xl"
                        onChange={e => setFormData({...formData, procedureType: e.target.value})}
                     />
                     <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Requests for gynaecological procedures are forwarded to Dr. Sarah Wilson for manual approval.
                     </p>
                   </div>
                )}

                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Input 
                    type="date" 
                    className="h-12 rounded-xl"
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Time Slot</Label>
                  <Select onValueChange={v => setFormData({...formData, time: v})}>
                     <SelectTrigger className="h-12 rounded-xl">
                       <SelectValue placeholder="Select Slot" />
                     </SelectTrigger>
                     <SelectContent className="bg-background">
                        {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map(t => (
                           <SelectItem key={t} value={t}>{t} AM</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                   <Label>Additional Notes (Optional)</Label>
                   <Input 
                     placeholder="Any specific symptoms or requests?" 
                     className="h-12 rounded-xl"
                     onChange={e => setFormData({...formData, notes: e.target.value})}
                   />
                </div>
             </div>
             
             <div className="flex justify-between pt-6 border-t border-border">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-12 rounded-xl px-6">
                   <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(3)} className="gradient-primary text-primary-foreground h-12 rounded-xl px-10 shadow-lg shadow-primary/20">
                   Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
             </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="p-8 space-y-8">
             <div className="p-6 rounded-2xl bg-accent/30 border border-border space-y-4">
                <div className="flex justify-between items-center border-b border-border/50 pb-4">
                   <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">Selected Service</p>
                   <span className="font-bold text-primary">{serviceType?.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Date</p>
                      <p className="font-semibold">{formData.date}</p>
                   </div>
                   <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Time Slot</p>
                      <p className="font-semibold">{formData.time}</p>
                   </div>
                </div>
                {formData.notes && (
                   <div className="pt-2">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Self-Assessment Notes</p>
                      <p className="text-sm italic mt-1 font-medium">{formData.notes}</p>
                   </div>
                )}
             </div>

             <div className="bg-amber-500/5 rounded-xl p-4 flex gap-3 border border-amber-500/20">
                <HelpCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                   By confirming, you agree to our clinic's cancellation policy. Your booking will be reviewed by our reception staff within 30 minutes.
                </p>
             </div>

             <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)} className="h-12 rounded-xl px-6">
                   <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleBooking} className="gradient-primary text-primary-foreground h-12 rounded-xl px-12 shadow-lg shadow-primary/20 font-bold" disabled={loading}>
                   {loading ? "Confirming..." : "Confirm Booking"}
                </Button>
             </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="p-16 text-center space-y-8 animate-in zoom-in duration-500">
             <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5 transition-transform hover:rotate-12 duration-500">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
             </div>
             <div className="space-y-2">
                <h2 className="text-3xl font-extrabold">Request Submitted!</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">Your booking has been placed in the queue. You will receive a notification via SMS once approved.</p>
             </div>
             <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="gradient-primary text-primary-foreground h-12 px-8 rounded-xl" asChild>
                   <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" className="h-12 px-8 rounded-xl" asChild>
                   <Link to="/dashboard/appointments">View My Bookings</Link>
                </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookService;
