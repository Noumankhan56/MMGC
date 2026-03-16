import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Activity,
  CalendarCheck,
  MessageCircle,
  Star,
  Clock,
  Hospital,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* ================= NAVBAR ================= */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">MMGC</h1>
              <p className="text-xs text-muted-foreground">
                Medical Management & General Care
              </p>
            </div>
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#doctors">Doctors</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/doctor">Doctor Panel</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/appointments">Admin Panel</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-5xl font-bold">
              Smart Healthcare <br /> Made Simple
            </h2>
            <p className="text-lg text-muted-foreground">
              MMGC is a complete medical management and general care system
              designed for patients to easily connect with doctors, book
              appointments, and manage healthcare digitally.
            </p>
            <div className="flex gap-4">
              <Button size="lg">Get Started</Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/doctor">Doctor Login</Link>
              </Button>
            </div>
          </div>

          <Card className="hidden md:block shadow-xl">
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


      {/* ================= SERVICES ================= */}
      <section id="services" className="bg-muted/40 py-24">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">Our Services</h3>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Online Doctor Consultation",
              "Appointment Booking",
              "Patient Medical Records",
              "Laboratory Reports",
              "Billing & Payments",
              "Health Reports & Analytics",
            ].map((service) => (
              <Card key={service} className="hover:shadow-lg transition">
                <CardContent className="p-6 text-center space-y-3">
                  <Activity className="mx-auto text-primary" />
                  <h4 className="font-semibold">{service}</h4>
                  <p className="text-sm text-muted-foreground">
                    Reliable and secure healthcare service for patients.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DOCTORS ================= */}
      <section id="doctors" className="container mx-auto px-6 py-24">
        <h3 className="text-3xl font-bold text-center mb-12">Our Doctors</h3>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Dr. Ahmed Khan",
              specialty: "Cardiologist",
              hospital: "City Care Hospital",
              timing: "10:00 AM - 4:00 PM",
              exp: "10+ Years",
              fee: "Rs. 2000",
              rating: "4.8",
            },
            {
              name: "Dr. Sara Ali",
              specialty: "General Physician",
              hospital: "Health Plus Clinic",
              timing: "12:00 PM - 6:00 PM",
              exp: "8+ Years",
              fee: "Rs. 1500",
              rating: "4.7",
            },
            {
              name: "Dr. Usman Raza",
              specialty: "Dermatologist",
              hospital: "Skin Care Center",
              timing: "5:00 PM - 9:00 PM",
              exp: "6+ Years",
              fee: "Rs. 1800",
              rating: "4.6",
            },
          ].map((doc) => (
            <Card key={doc.name} className="hover:shadow-xl transition">
              <CardContent className="p-6 space-y-3">
                <h4 className="font-bold text-lg">{doc.name}</h4>
                <p className="text-primary">{doc.specialty}</p>

                <p className="text-sm flex gap-2">
                  <Hospital className="h-4 w-4" /> {doc.hospital}
                </p>
                <p className="text-sm flex gap-2">
                  <Clock className="h-4 w-4" /> {doc.timing}
                </p>
                <p className="text-sm">Experience: {doc.exp}</p>
                <p className="text-sm flex gap-1 items-center">
                  <Star className="h-4 w-4 text-yellow-500" /> {doc.rating}
                </p>
                <p className="text-sm font-semibold">
                  Consultation Fee: {doc.fee}
                </p>

                <div className="flex gap-2 pt-2">
                  <Button size="sm">
                    <CalendarCheck className="h-4 w-4 mr-1" />
                    Book
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Consult
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="bg-muted/40 py-24">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">Contact Us</h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="flex gap-2">
                <Phone /> +92 300 1234567
              </p>
              <p className="flex gap-2">
                <Mail /> support@mmgc.com
              </p>
              <p className="flex gap-2">
                <MapPin /> Pakistan
              </p>
            </div>

            <iframe
              className="w-full h-64 rounded-lg"
              src="https://maps.google.com/maps?q=pakistan&t=&z=6&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-primary text-white py-10">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold">MMGC</p>
              <p className="text-xs opacity-80">
                Medical Management & General Care
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm opacity-90">
              <li><a href="/">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#doctors">Doctors</a></li>
              <li><Link to="/admin/appointments">Admin Panel</Link></li>
              <li><Link to="/doctor">Doctor Panel</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-2">Contact</h4>
            <p className="text-sm opacity-90">support@mmgc.com</p>
            <p className="text-sm opacity-90">+92 300 1234567</p>
          </div>
        </div>

        <p className="text-center text-xs opacity-80 mt-6">
          © 2026 MMGC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
