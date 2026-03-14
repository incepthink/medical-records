import { Shield, Stethoscope, User, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const personas = [
  {
    icon: Stethoscope,
    title: "Doctor",
    description:
      "Create and issue verifiable medical records as blockchain assets",
    route: "/auth/doctor",
  },
  {
    icon: User,
    title: "Patient",
    description: "Own your health data and choose who can access it",
    route: "/auth/patient",
  },
  {
    icon: Building2,
    title: "Hospital",
    description: "Verify and access patient records with cryptographic proof",
    route: "/auth/hospital",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">VaultMed</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
            Your medical records.{" "}
            <span className="text-gradient">Secured on-chain.</span> Always in
            your control.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            VaultMed uses blockchain technology to give patients ownership of
            their health data — shareable, verifiable, and tamper-proof.
          </p>
        </div>

        {/* Persona Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full animate-fade-in"
          style={{ animationDelay: "0.15s" }}
        >
          {personas.map((p) => (
            <Card
              key={p.title}
              className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 rounded-xl"
            >
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <p.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {p.description}
                </p>
                <Button
                  className="mt-2 w-full"
                  onClick={() => navigate(p.route)}
                >
                  Get Started <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        © 2026 VaultMed
      </footer>
    </div>
  );
};

export default LandingPage;
