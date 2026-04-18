import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Mail, MapPin, Phone, Send, Activity, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-medical.jpg";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      toast.error("You must agree to the terms and conditions.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      toast.success(data.message || "Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setAgree(false);
    } catch (err) {
      console.error("Contact error:", err);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    { icon: Phone, title: "Phone", text: "+92 300 1234567" },
    { icon: Mail, title: "Email", text: "info@mmgc.com" },
    { icon: MapPin, title: "Location", text: "Medical Plaza, Healthcare City" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Contact Us" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* LEFT CONTENT */}
            <div className="space-y-6 text-white animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border rounded-full px-4 py-1 text-sm">
                <Activity className="h-4 w-4" /> Get in Touch
              </div>

              <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight">
                Contact Our Team
              </h1>

              <p className="text-lg text-white/90 max-w-xl">
                We’d love to hear from you! Reach out for appointments, inquiries, or general questions about our healthcare services.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/dashboard/appointments"
                  className="px-6 py-3 rounded-md bg-white/10 text-white border border-white/30 hover:bg-white/90 hover:text-primary flex items-center transition"
                >
                  <Calendar className="h-5 w-5 mr-2 hover:text-primary"/>  Book Appointment
                </Link>
                <Link
                  to="/"
                  className="px-6 py-3 rounded-md bg-white text-primary border border-primary hover:bg-primary hover:text-white flex items-center transition"
                >
                  Home <ChevronRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* RIGHT CARD */}
            <div className="hidden md:block">
              <div className="bg-white/95 backdrop-blur rounded-xl shadow-xl p-8">
                <h3 className="font-semibold text-lg mb-4">Reach Us Through</h3>
                <div className="space-y-4">
                  {contactMethods.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition"
                    >
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-foreground">{item.title}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM & MAP */}
      <section className="container mx-auto px-4 py-16 space-y-12">
        {/* Section Heading */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold">Send Us a Message</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Fill out the form below and our team will get back to you promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl p-8 shadow-lg border border-border space-y-5 hover:shadow-2xl transition"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="John Doe"
                  className="placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="john@example.com"
                  className="placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                placeholder="Reason for contact"
                className="placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                placeholder="Write your message here..."
                className="placeholder:text-muted-foreground"
              />
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="agree"
                checked={agree}
                onCheckedChange={(checked) => setAgree(!!checked)}
              />
              <Label htmlFor="agree" className="text-sm text-muted-foreground">
                I agree to the <Link to="/terms" className="text-primary underline">terms and conditions</Link>
              </Label>
            </div>

            <Button
              variant="hero"
              size="lg"
              type="submit"
              className="w-full flex items-center justify-center bg-primary hover:bg-primary/90 text-white"
              disabled={!agree || loading}
            >
              {loading ? (
                <Activity className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
            <iframe
              title="MMGC Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.5648746220025!2d67.07513711492087!3d24.902847451996336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f23a1a0cceb%3A0x123456789abcdef!2sMedical%20Plaza%2C%20Karachi!5e0!3m2!1sen!2s!4v1670000000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              className="w-full h-full"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white text-center rounded-t-3xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Connect With Us?
          </h2>
          <p className="opacity-90 mb-8 max-w-lg mx-auto">
            Book your appointment or send us a message. We are here to assist you with your healthcare needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="xl" asChild className="bg-white/10 text-white hover:bg-white/90 hover:text-primary">
              <Link to="/dashboard/appointments">
                <Calendar className="h-5 w-5 mr-2" /> Book Appointment
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

export default ContactPage;
