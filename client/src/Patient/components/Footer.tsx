import logo from "@/assets/logo.png";
import { Heart, Mail, MapPin, Phone, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">MMGC</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Medical Management & General Care System — providing quality healthcare services with compassion and excellence.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Home</Link>
              <Link to="/doctors" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Our Doctors</Link>
              <Link to="/services" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Services</Link>
              <Link to="/dashboard" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Patient Portal</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Services</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <span>General Consultation</span>
              <span>Laboratory Tests</span>
              <span>Ultrasound Services</span>
              <span>Gynaecological Procedures</span>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@mmgc.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Medical Plaza, Healthcare City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/60">
          <p className="flex items-center justify-center gap-1">
            © 2026 MMGC. All rights reserved. A Platform by the MMGC Team.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
