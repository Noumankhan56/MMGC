import { Button } from "@/Patient/components/ui/button";
import heroImage from "@/Patient/assets/hero-medical.jpg";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Heart,
  MessageSquare,
  Microscope,
  Shield,
  Star,
  Stethoscope,
  Users,
  Hospital,
  Clock,
  CheckCircle,
} from "lucide-react";

import { Link } from "react-router-dom";
import Navbar from "@/Patient/components/Navbar";
import Footer from "@/Patient/components/Footer";
import { useEffect, useState } from "react";

const initialServices = [
  {
    icon: Stethoscope,
    title: "General Consultation",
    desc: "Comprehensive health checkups with experienced physicians.",
  },
  {
    icon: FlaskConical,
    title: "Laboratory Tests",
    desc: "Advanced lab testing with fast and accurate diagnostics.",
  },
  {
    icon: Microscope,
    title: "Ultrasound Services",
    desc: "High-resolution ultrasound imaging for accurate results.",
  },
  {
    icon: Heart,
    title: "Gynaecological Care",
    desc: "Specialized women's health services and prenatal care.",
  },
  {
    icon: ClipboardList,
    title: "Surgical Procedures",
    desc: "Safe and reliable minor surgeries and procedures.",
  },
  {
    icon: Shield,
    title: "Preventive Health",
    desc: "Vaccinations, health screenings and wellness programs.",
  },
];

const doctors = [
  {
    name: "Dr. Ahmed Khan",
    specialty: "Cardiologist",
    hospital: "City Care Hospital",
    timing: "10 AM – 4 PM",
    exp: "10+ Years",
    rating: 4.8,
  },
  {
    name: "Dr. Sara Ali",
    specialty: "General Physician",
    hospital: "Health Plus Clinic",
    timing: "12 PM – 6 PM",
    exp: "8+ Years",
    rating: 4.7,
  },
  {
    name: "Dr. Usman Raza",
    specialty: "Dermatologist",
    hospital: "Skin Care Center",
    timing: "5 PM – 9 PM",
    exp: "6+ Years",
    rating: 4.6,
  },
];

const testimonials = [
  {
    name: "Ayesha M.",
    text: "The doctors and staff are incredibly caring. My entire prenatal journey was managed perfectly.",
    rating: 5,
  },
  {
    name: "Hassan R.",
    text: "Easy appointment booking and quick lab results. Highly recommended healthcare service.",
    rating: 5,
  },
  {
    name: "Zainab K.",
    text: "The patient portal makes accessing reports and booking follow-ups extremely easy.",
    rating: 4,
  },
];

const stats = [
  { value: "15K+", label: "Patients Served" },
  { value: "50+", label: "Expert Doctors" },
  { value: "98%", label: "Patient Satisfaction" },
  { value: "24/7", label: "Emergency Care" },
];

const Index = () => {
  const [stats, setStats] = useState([
    { value: "0", label: "Patients Served" },
    { value: "0", label: "Expert Doctors" },
    { value: "0", label: "Patient Satisfaction" },
    { value: "24/7", label: "Emergency Care" },
  ]);
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Fetch Public Stats
    fetch("/api/public/stats")
      .then(res => res.json())
      .then(data => {
        // Handle both camelCase and PascalCase
        const patients = data.patientsServed || data.PatientsServed;
        const doctors = data.expertDoctors || data.ExpertDoctors;
        const rate = data.successRate || data.SuccessRate || "98%";

        setStats([
          { value: patients?.toLocaleString() || "15K+", label: "Patients Served" },
          { value: doctors?.toString() || "50+", label: "Expert Doctors" },
          { value: rate, label: "Patient Satisfaction" },
          { value: "24/7", label: "Emergency Care" },
        ]);
        setStatsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        // Fallback to defaults
        setStats([
          { value: "15K+", label: "Patients Served" },
          { value: "50+", label: "Expert Doctors" },
          { value: "98%", label: "Patient Satisfaction" },
          { value: "24/7", label: "Emergency Care" },
        ]);
        setStatsLoading(false);
      });

    // Fetch Featured Doctors (Top 3)
    fetch("/api/doctors")
      .then(res => res.json())
      .then(data => {
        setFeaturedDoctors(data.slice(0, 3));
      })
      .catch(err => console.error("Error fetching featured doctors:", err));
  }, []);

  const services = initialServices;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
{/* HERO */}
<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <img
      src={heroImage}
      alt="Medical clinic"
      className="w-full h-full object-cover"
    />

    <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
  </div>

  <div className="relative container mx-auto px-4 py-24 md:py-32">

    <div className="grid md:grid-cols-2 gap-10 items-center">

      {/* LEFT CONTENT */}
      <div className="space-y-6 text-white animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border rounded-full px-4 py-1 text-sm">
          <Heart className="h-4 w-4" /> Trusted Healthcare Partner
        </div>

        <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight">
          Your Health, Our Priority
        </h1>

        <p className="text-lg text-white/90 max-w-xl">
          MMGC offers modern healthcare services with compassionate care.
          Book appointments, access reports and manage your health easily.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">

          <Button size="lg" asChild className="bg-white/10 text-white hover:bg-white/90 hover:text-primary">
            <Link to="/dashboard">
              <Calendar className="h-5 w-5 mr-2 hover:text-primary" />
              Book Appointment
            </Link>
          </Button>

          <Link
            to="/doctors"
            className="px-6 py-3 rounded-md bg-white text-primary border border-primary hover:bg-primary hover:text-white transition flex items-center"
          >
            Our Doctors
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>

        </div>
      </div>

      {/* RIGHT CARD */}
      <Card className="hidden md:block shadow-xl bg-white/95 backdrop-blur">
        <CardContent className="p-8 space-y-3">
          <h3 className="font-semibold text-lg">Why MMGC?</h3>

          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>✔ Trusted & verified doctors</li>
            <li>✔ Easy appointment booking</li>
            <li>✔ Secure medical records</li>
            <li>✔ Modern admin & doctor panels</li>
          </ul>
        </CardContent>
      </Card>

    </div>

  </div>
</section>


      {/* STATS */}
      <section className="relative -mt-10 z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl p-6 text-center shadow hover:shadow-lg transition"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* ================= ABOUT ================= */}
<section
  id="about"
  className="container mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center"
>
  {/* LEFT — TEXT */}
  <div className="space-y-6 animate-fade-in-left">
    <h3 className="text-3xl font-bold">
      About Medical Management & General Care System
    </h3>

    <p className="text-muted-foreground leading-relaxed">
      Medical Management & General Care System (MMGC) is a modern healthcare
      platform designed to digitally connect patients, doctors, and
      administrators. Our system simplifies appointment booking, online
      consultation, patient record management, and healthcare operations.
    </p>

    <p className="text-muted-foreground leading-relaxed">
      With MMGC, patients can easily find qualified doctors, view their
      availability, consult online, and maintain a complete medical history —
      all through a secure and user-friendly interface.
    </p>

    <div className="flex gap-4 pt-2">
      <Button>Explore Services</Button>
      <Button variant="outline" asChild>
        <Link to="/doctor">Doctor Login</Link>
      </Button>
    </div>
  </div>

  {/* RIGHT — LAPTOP IMAGE / SYSTEM PREVIEW */}
  <div className="relative animate-fade-in-right">
    {/* Glow background */}
    <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-xl"></div>

    {/* Laptop frame */}
    <div className="relative bg-card border rounded-xl shadow-2xl overflow-hidden">
      <div className="bg-muted px-4 py-2 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-500"></span>
        <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
        <span className="h-3 w-3 rounded-full bg-green-500"></span>
      </div>

      {/* 👇 Replace src with your actual system screenshot */}
      <img
        src="/images/mmgc-dashboard.png"
        alt="MMGC Medical Management System"
        className="w-full object-cover hover:scale-105 transition-transform duration-700"
      />
    </div>
  </div>
</section>


      {/* HOW IT WORKS */}
      <section className="py-20 bg-accent/40">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-10">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div>
              <Users className="mx-auto text-primary mb-3" />
              <h3 className="font-semibold mb-2">Create Account</h3>
              <p className="text-muted-foreground text-sm">
                Register and access the patient portal.
              </p>
            </div>

            <div>
              <Calendar className="mx-auto text-primary mb-3" />
              <h3 className="font-semibold mb-2">Book Appointment</h3>
              <p className="text-muted-foreground text-sm">
                Choose doctor and schedule your visit.
              </p>
            </div>

            <div>
              <ClipboardList className="mx-auto text-primary mb-3" />
              <h3 className="font-semibold mb-2">Get Treatment</h3>
              <p className="text-muted-foreground text-sm">
                Receive consultation and manage reports online.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Our Services
            </h2>
            <p className="text-muted-foreground mt-3">
              Comprehensive healthcare services tailored for patients.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div
                key={svc.title}
                className="group bg-card rounded-xl p-6 border shadow hover:shadow-lg transition"
              >
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                  <svc.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="font-semibold text-lg mb-2">{svc.title}</h3>

                <p className="text-muted-foreground text-sm">
                  {svc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section className="py-20 bg-accent/50">
        <div className="container mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Meet Our Doctors
            </h2>
            <p className="text-muted-foreground mt-2">
              Experienced specialists dedicated to your health
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredDoctors.length > 0 ? featuredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-card p-6 rounded-xl border shadow hover:shadow-lg transition flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-4 overflow-hidden border-4 border-primary/20 relative group">
                  {doc.profilePictureUrl ? (
                    <img 
                      src={doc.profilePictureUrl} 
                      alt={doc.name} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                        (e.target as HTMLImageElement).className = "hidden";
                      }}
                    />
                  ) : (
                    <Users className="text-white h-10 w-10" />
                  )}
                  {!doc.profilePictureUrl && <Users className="text-white h-10 w-10 absolute" />}
                </div>

                <h3 className="font-semibold text-lg">{doc.name}</h3>
                <p className="text-primary font-medium text-sm mb-3">
                  {doc.specialization}
                </p>

                <div className="space-y-2 mb-4 w-full">
                  <p className="text-sm flex items-center justify-center gap-2">
                    <Hospital className="h-4 w-4 text-muted-foreground" /> {doc.clinicName || "MMGC Specialist Center"}
                  </p>
                  <p className="text-sm flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" /> {doc.clinicTimings || "Mon-Fri: 9AM - 5PM"}
                  </p>
                </div>

                <div className="flex items-center gap-1 mb-5">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold">4.9</span>
                  <span className="text-xs text-muted-foreground font-medium ml-1">(120+ Reviews)</span>
                </div>

                <Button size="sm" className="w-full mt-auto" asChild>
                  <Link to="/dashboard/appointments">Book Appointment</Link>
                </Button>
              </div>
            )) : (
              <div className="col-span-full py-10 text-center animate-pulse text-muted-foreground font-bold uppercase tracking-widest">
                Loading Specialist Profiles...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20">
        <div className="container mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Patient Stories
            </h2>
            <p className="text-muted-foreground mt-2">
              What our patients say about us
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 border shadow hover:shadow-lg transition"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>

                <p className="text-muted-foreground text-sm mb-4">
                  "{t.text}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {t.name[0]}
                  </div>

                  <span className="font-medium text-sm">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Medical Help?
          </h2>

          <p className="opacity-90 mb-8">
            Our team is ready to assist you with appointments, reports and
            consultations.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">

            <Button variant="secondary" size="lg" asChild>
              <Link to="/contact">
                <MessageSquare className="mr-2 h-5 w-5" />
                Contact Us
              </Link>
            </Button>

            {/* FIXED BUTTON */}
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-md bg-white text-primary border border-white hover:bg-primary hover:text-white transition flex items-center"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Now
            </Link>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;