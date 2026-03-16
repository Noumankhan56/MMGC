import Navbar from "@/Patient/components/Navbar";
import Footer from "@/Patient/components/Footer";
import heroImage from "@/Patient/assets/hero-medical.jpg";
import { Button } from "@/Patient/components/ui/button";
import {
  Activity,
  Award,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  MapPin,
  Phone,
  Shield,
  Users,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";

const milestones = [
  { year: "2010", title: "Foundation", desc: "MMGC was established with a vision to provide accessible, quality healthcare." },
  { year: "2014", title: "Expansion", desc: "Added surgical wing, ultrasound imaging, and expanded lab facilities." },
  { year: "2018", title: "Digital Transformation", desc: "Launched online appointment booking and digital patient records." },
  { year: "2022", title: "Centre of Excellence", desc: "Recognized as a leading healthcare provider with 50+ specialists." },
  { year: "2025", title: "Smart Healthcare", desc: "Introduced AI-assisted diagnostics and the patient self-service portal." },
];

const values = [
  { icon: Heart, title: "Compassion", desc: "Every patient is treated with empathy, dignity, and respect." },
  { icon: Shield, title: "Integrity", desc: "Transparent practices and honest communication at every step." },
  { icon: Award, title: "Excellence", desc: "Continuous pursuit of the highest standards in medical care." },
  { icon: Users, title: "Teamwork", desc: "Collaborative approach among doctors, staff, and patients." },
];

const leadership = [
  { name: "Dr. Muhammad Arif", role: "Founder & Chief Medical Officer", exp: "25+ years", specialty: "General Medicine" },
  { name: "Dr. Amina Raza", role: "Head of Gynaecology", exp: "18+ years", specialty: "Obstetrics & Gynaecology" },
  { name: "Dr. Kamran Ali", role: "Chief of Surgery", exp: "20+ years", specialty: "General Surgery" },
  { name: "Dr. Sarah Ahmed", role: "Head of Diagnostics", exp: "15+ years", specialty: "Radiology & Pathology" },
];

const stats = [
  { value: "15+", label: "Years of Service" },
  { value: "50+", label: "Expert Doctors" },
  { value: "15,000+", label: "Patients Served" },
  { value: "98%", label: "Satisfaction Rate" },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="About MMGC"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-10 items-center">

            {/* LEFT HERO CONTENT */}
            <div className="space-y-6 text-white animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border rounded-full px-4 py-1 text-sm">
                <Activity className="h-4 w-4" /> About MMGC
              </div>

              <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight">
                Who We Are
              </h1>

              <p className="text-lg text-white/90 max-w-xl">
                A trusted healthcare institution committed to delivering compassionate, quality medical services since 2010.
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

            {/* RIGHT HERO CARD - CORE VALUES */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              {values.map((v) => (
                <Card key={v.title} className="bg-white/80 backdrop-blur shadow-xl">
                  <CardContent className="p-6 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <v.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-8 border border-border shadow hover:shadow-lg transition">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-5">
              <Target className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To provide accessible, affordable, and high-quality healthcare services to every individual. We combine modern medical technology with compassionate care, ensuring every patient receives personalized attention and the best possible outcomes.
            </p>
          </div>
          <div className="bg-card rounded-2xl p-8 border border-border shadow hover:shadow-lg transition">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-5">
              <Eye className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To become the region's leading healthcare institution, recognized for clinical excellence, innovative technology, and a patient-first approach. We envision a future where quality healthcare is within reach for every community.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl p-6 text-center shadow border border-border">
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Our Journey</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Key milestones in our growth story</p>
          </div>
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={m.year} className={`relative flex items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10 mt-1" />
                  <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                    <div className="bg-card rounded-xl p-5 border border-border shadow hover:shadow-lg transition">
                      <span className="font-heading text-sm font-bold text-primary">{m.year}</span>
                      <h3 className="font-heading font-semibold text-foreground mt-1">{m.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{m.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Leadership Team</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Meet the experts behind MMGC</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader) => (
              <div key={leader.name} className="bg-card rounded-2xl p-6 border border-border shadow hover:shadow-lg transition-all duration-300 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground">{leader.name}</h3>
                <p className="text-primary text-sm font-medium mt-1">{leader.role}</p>
                <p className="text-muted-foreground text-xs mt-1">{leader.specialty}</p>
                <div className="flex items-center justify-center gap-1 mt-3 text-muted-foreground text-xs">
                  <Clock className="h-3.5 w-3.5" /> {leader.exp} experience
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-20 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Visit Us</h2>
            <p className="text-muted-foreground mt-3">We're here to help — reach out anytime</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-6 border border-border shadow text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1">Location</h3>
              <p className="text-muted-foreground text-sm">Medical Plaza, Healthcare City, Pakistan</p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border shadow text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1">Phone</h3>
              <p className="text-muted-foreground text-sm">+92 300 1234567</p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border shadow text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1">Hours</h3>
              <p className="text-muted-foreground text-sm">Mon–Sat: 8AM – 10PM<br />Emergency: 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white text-center rounded-t-3xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Growing Family
          </h2>
          <p className="opacity-90 mb-8 max-w-lg mx-auto">
            Experience healthcare that puts you first. Book your appointment today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="xl" asChild className="bg-white/10 text-white hover:bg-white/90 hover:text-primary">
              <Link to="/dashboard/appointments">
                <Calendar className="h-5 w-5 mr-2" />
                Book Appointment
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="px-6 py-3 rounded-md bg-white text-primary border border-white hover:bg-primary hover:text-white transition flex items-center">
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

export default AboutPage;
