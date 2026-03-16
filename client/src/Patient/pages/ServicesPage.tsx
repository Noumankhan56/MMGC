import Navbar from "@/Patient/components/Navbar";
import Footer from "@/Patient/components/Footer";
import heroImage from "@/Patient/assets/hero-medical.jpg";
import { Button } from "@/Patient/components/ui/button";
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Heart,
  Microscope,
  Shield,
  Stethoscope,
  Syringe,
  Baby,
  Pill,
  Thermometer,
  Eye,
  BrainCircuit,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";

const mainServices = [
  {
    icon: Stethoscope,
    title: "General Consultation",
    desc: "Comprehensive health checkups with experienced physicians.",
    details: [
      "Complete physical examinations",
      "Chronic disease management",
      "Referral to specialists",
      "Follow-up consultations",
    ],
  },
  {
    icon: FlaskConical,
    title: "Laboratory Tests",
    desc: "Advanced lab testing with fast and accurate diagnostics.",
    details: [
      "Complete blood count (CBC)",
      "Blood sugar & HbA1c testing",
      "Liver & kidney function tests",
      "Hormonal profile analysis",
    ],
  },
  {
    icon: Microscope,
    title: "Ultrasound Services",
    desc: "High-resolution ultrasound imaging for accurate diagnostics.",
    details: [
      "Abdominal ultrasound",
      "Pelvic & obstetric scans",
      "Thyroid & breast imaging",
      "Doppler ultrasound",
    ],
  },
  {
    icon: Heart,
    title: "Gynaecological Care",
    desc: "Specialized women's health services and prenatal care.",
    details: [
      "Prenatal & postnatal care",
      "Family planning consultations",
      "PAP smear & cervical screening",
      "Menstrual disorder treatment",
    ],
  },
  {
    icon: ClipboardList,
    title: "Surgical Procedures",
    desc: "Safe and reliable minor surgeries and procedures.",
    details: [
      "C-section deliveries",
      "Minor surgical procedures",
      "Wound care & suturing",
      "Post-operative care",
    ],
  },
  {
    icon: Shield,
    title: "Preventive Health",
    desc: "Vaccinations, health screenings and wellness programs.",
    details: [
      "Childhood immunizations",
      "Adult vaccination programs",
      "Annual health checkups",
      "Cancer screening panels",
    ],
  },
];

const additionalServices = [
  { icon: Baby, title: "Paediatric Care", desc: "Comprehensive healthcare for infants, children, and adolescents." },
  { icon: Syringe, title: "Vaccination Programs", desc: "Complete immunization schedules for all age groups." },
  { icon: Pill, title: "Pharmacy Services", desc: "In-house pharmacy with prescribed and over-the-counter medications." },
  { icon: Thermometer, title: "Emergency Care", desc: "24/7 emergency medical services for urgent health situations." },
  { icon: Eye, title: "Ophthalmology", desc: "Eye examinations, vision testing, and corrective prescriptions." },
  { icon: BrainCircuit, title: "Mental Health", desc: "Counseling and psychiatric support for emotional well-being." },
];

const processSteps = [
  { step: "01", title: "Book Online", desc: "Select a service and choose your preferred time slot." },
  { step: "02", title: "Confirmation", desc: "Receive instant booking confirmation via SMS or WhatsApp." },
  { step: "03", title: "Visit Clinic", desc: "Arrive at the scheduled time for your consultation." },
  { step: "04", title: "Get Reports", desc: "Access your reports and prescriptions through the patient portal." },
];

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
<section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <img
      src={heroImage} // You can use a relevant services image here
      alt="Healthcare services"
      className="w-full h-full object-cover"
    />

    <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
  </div>

  <div className="relative container mx-auto px-4 py-24 md:py-32">

    <div className="grid md:grid-cols-2 gap-10 items-center">

      {/* LEFT CONTENT */}
      <div className="space-y-6 text-white animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border rounded-full px-4 py-1 text-sm">
          <Activity className="h-4 w-4" /> Comprehensive Healthcare
        </div>

        <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight">
          Our Medical Services
        </h1>

        <p className="text-lg text-white/90 max-w-xl">
          Explore a full range of healthcare services at MMGC — from routine checkups to specialized procedures.
          Book appointments online and get personalized care from our expert team.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">

          <Button size="lg" asChild className="bg-white/10 text-white hover:bg-white/90 hover:text-primary">
            <Link to="/dashboard/appointments">
              <Calendar className="h-5 w-5 mr-2 hover:text-primary" />
              Book Appointment
            </Link>
          </Button>

          <Link
            to="/contact"
            className="px-6 py-3 rounded-md bg-white text-primary border border-primary hover:bg-primary hover:text-white transition flex items-center"
          >
            Contact Us
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>

        </div>
      </div>

      {/* RIGHT CARD */}
      <Card className="hidden md:block shadow-xl bg-white/95 backdrop-blur">
        <CardContent className="p-8 space-y-3">
          <h3 className="font-semibold text-lg">Why Choose Our Services?</h3>

          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>✔ Trusted & experienced medical professionals</li>
            <li>✔ Wide range of specialized healthcare services</li>
            <li>✔ Fast and accurate diagnostics</li>
            <li>✔ Easy online appointment booking</li>
          </ul>
        </CardContent>
      </Card>

    </div>

  </div>
</section>

      {/* Core Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              Core Medical Services
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Expert care across all major medical disciplines
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainServices.map((svc) => (
              <div
                key={svc.title}
                className="group bg-card rounded-2xl p-6 border border-border shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-5">
                  <svc.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">{svc.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{svc.desc}</p>
                <ul className="space-y-2 mb-5">
                  {svc.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                  <Link to="/dashboard/appointments">
                    Book Now <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-accent/40">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-10">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Book your appointment in 4 simple steps
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={i} className="relative bg-card rounded-2xl p-6 border border-border shadow text-center">
                <div className="absolute top-4 right-4 font-heading text-4xl font-extrabold text-primary/15">{step.step}</div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading text-xl font-bold text-primary">{step.step}</span>
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              Additional Services
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              More ways we care for you and your family
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalServices.map((svc) => (
              <div
                key={svc.title}
                className="flex items-start gap-4 bg-card rounded-xl p-5 border border-border shadow hover:shadow-lg transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svc.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">{svc.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white text-center rounded-t-3xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Book Your Service?
          </h2>
          <p className="opacity-90 mb-8 max-w-lg mx-auto">
            Choose your preferred medical service and schedule your appointment online today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="xl" asChild className="bg-white/10 text-white hover:bg-white/90 hover:text-primary">
              <Link to="/dashboard/appointments">
                <Calendar className="h-5 w-5 mr-2" />
                Book Appointment
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="px-6 py-3 rounded-md bg-white text-primary border border-white hover:bg-primary hover:text-white transition flex items-center ">
              <Link to="/contact">
                Contact Us <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
