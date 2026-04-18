import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Search, Star, Calendar, ChevronRight, Activity, Filter, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-medical.jpg";


const specializations = ["All", "Gynaecologist", "General Physician", "Radiologist", "Surgeon", "Paediatrician"];

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortAZ, setSortAZ] = useState(true);

  useEffect(() => {
    fetch("/api/doctors")
      .then(res => res.json())
      .then(data => {
        // Enhance data for UI
        const enhanced = data.map((d: any) => ({
          ...d,
          available: d.status === "Active", // Live status
          slots: Math.floor(Math.random() * 8) + 1, // Mock slots for now
          rating: 4.5 + Math.random() * 0.5 // Mock rating
        }));
        setDoctors(enhanced || []);
        setLoading(false);
      });
  }, []);

  const filtered = doctors
    .filter(d => filter === "All" || d.specialization === filter)
    .filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization && d.specialization.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => (sortAZ ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Our Doctors" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 text-white animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border rounded-full px-4 py-1 text-sm">
                <Activity className="h-4 w-4"/> Expert Physicians
              </div>
              <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight">Meet Our Doctors</h1>
              <p className="text-lg text-white/90 max-w-xl">
                Find and book appointments with our team of experienced specialists.
                Providing quality healthcare across all major disciplines.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button size="lg" asChild className="bg-white/10 text-white hover:bg-white/90 hover:text-primary">
                  <Link to="/dashboard/appointments">
                    <Calendar className="h-5 w-5 mr-2 hover:text-primary"/> Book Appointment
                  </Link>
                </Button>
                <Link to="/contact" className="px-6 py-3 rounded-md bg-white text-primary border border-primary hover:bg-primary hover:text-white transition flex items-center">
                  Contact Us <ChevronRight className="ml-2 h-5 w-5"/>
                </Link>
              </div>
            </div>

            <Card className="hidden md:block shadow-xl bg-white/95 backdrop-blur">
              <CardContent className="p-8 space-y-3">
                <h3 className="font-semibold text-lg">Why Choose Our Doctors?</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✔ Experienced and trusted specialists</li>
                  <li>✔ Multiple disciplines under one roof</li>
                  <li>✔ Easy online appointment booking</li>
                  <li>✔ Personalized patient care</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Search & Specializations */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input placeholder="Search by name or specialization..." value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-10"/>
          </div>
          <Button variant={sortAZ?"default":"outline"} onClick={()=>setSortAZ(!sortAZ)} size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4"/> {sortAZ?"A → Z":"Z → A"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {specializations.map(spec => (
            <Badge key={spec} variant={filter===spec?"default":"outline"} className={`cursor-pointer transition-all ${filter===spec?"gradient-primary text-primary-foreground border-transparent":"hover:bg-accent"}`} onClick={()=>setFilter(spec)}>
              {spec}
            </Badge>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
             <div className="col-span-full py-20 text-center animate-pulse text-muted-foreground font-bold tracking-widest uppercase">Fetching Specialist Directory...</div>
          ) : filtered.map(doc => (
            <Card key={doc.id} className="rounded-2xl border border-border shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="w-full h-48 bg-accent/50 relative overflow-hidden group">
                <div className="w-full h-full relative group">
                  {doc.profilePictureUrl || doc.ProfilePictureUrl ? (
                    <img 
                      src={doc.profilePictureUrl || doc.ProfilePictureUrl} 
                      alt={doc.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                        (e.target as HTMLImageElement).className = "hidden";
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback component that shows if URL is missing OR if image fails to load */}
                  {(!doc.profilePictureUrl && !doc.ProfilePictureUrl) && (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Users className="h-16 w-16 text-primary/20" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                   <Badge className="bg-white/20 backdrop-blur text-white border-white/30 text-[10px] uppercase font-bold tracking-widest">
                     {doc.clinicName || "MMGC Specialist"}
                   </Badge>
                </div>
              </div>
              <CardContent className="text-center">
                <h3 className="font-heading text-lg font-bold">{doc.name}</h3>
                <p className="text-primary font-medium mt-1">{doc.specialization}</p>
                <p className="text-muted-foreground text-sm mt-1">{doc.experience || "10+ years"} experience</p>
                <div className="flex justify-center items-center gap-1 mt-2">
                  <Star className="h-4 w-4 text-warning fill-warning"/> <span className="text-sm">{doc.rating}</span>
                </div>
                <div className="mt-2">
                  {doc.available ? <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">{doc.slots} slots available</Badge>
                    : <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">Not available</Badge>}
                </div>
                <Button variant={doc.available?"hero":"outline"} size="sm" className="w-full mt-4" disabled={!doc.available} asChild={doc.available}>
                  {doc.available?<Link to="/dashboard/appointments"><Calendar className="h-4 w-4 mr-1"/> Book Now</Link>:<span>Unavailable</span>}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length===0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50"/>
            <p className="text-lg">No doctors found matching your criteria</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white text-center rounded-t-3xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Book Your Doctor?</h2>
          <p className="opacity-90 mb-8 max-w-lg mx-auto">Choose your preferred doctor and schedule your appointment online today.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="xl" asChild className="bg-white/10 text-white hover:bg-white/90 hover:text-primary">
              <Link to="/dashboard/appointments"><Calendar className="h-5 w-5 mr-2"/> Book Appointment</Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="px-6 py-3 rounded-md bg-white text-primary border border-white hover:bg-primary hover:text-white transition flex items-center">
              <Link to="/contact">Contact Us <ChevronRight className="h-5 w-5 ml-2"/></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default DoctorsPage;
