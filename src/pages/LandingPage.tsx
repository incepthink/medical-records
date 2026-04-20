import {
  Shield,
  Stethoscope,
  User,
  Building2,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileCheck,
  ClipboardList,
  FolderOpen,
  Wallet,
  Hash,
  Eye,
  ShieldCheck,
  PenLine,
  ListChecks,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const personas = [
  {
    icon: Stethoscope,
    title: "Doctor",
    tagline: "Issue verifiable records on-chain",
    route: "/auth/doctor",
    accentColor: "text-primary",
    accentBg: "bg-primary/10",
    borderHover: "hover:border-primary/40",
    badgeVariant: "default" as const,
    capabilities: [
      { icon: FileCheck, text: "Mint medical records as blockchain NFTs" },
      { icon: FolderOpen, text: "Organize records into named collections" },
      { icon: Wallet, text: "Issue records directly to patient wallets" },
      { icon: Hash, text: "Track mint status and on-chain transaction hashes" },
    ],
  },
  {
    icon: User,
    title: "Patient",
    tagline: "Own your health data, control access",
    route: "/auth/patient",
    accentColor: "text-success",
    accentBg: "bg-success/10",
    borderHover: "hover:border-success/40",
    badgeVariant: "secondary" as const,
    capabilities: [
      { icon: Wallet, text: "Own all records issued to your wallet" },
      { icon: Lock, text: "Grant or revoke hospital access per record" },
      { icon: Eye, text: "View full sharing history and audit logs" },
      { icon: ListChecks, text: "Filter records by doctor or date" },
    ],
  },
  {
    icon: Building2,
    title: "Hospital",
    tagline: "Access records with cryptographic proof",
    route: "/auth/hospital",
    accentColor: "text-warning",
    accentBg: "bg-warning/10",
    borderHover: "hover:border-warning/40",
    badgeVariant: "outline" as const,
    capabilities: [
      { icon: ShieldCheck, text: "View records patients have explicitly shared" },
      { icon: CheckCircle2, text: "Access cryptographic proof of each record" },
      { icon: PenLine, text: "Sign records with a verifiable hash" },
      { icon: ClipboardList, text: "Full audit trail of every access event" },
    ],
  },
];

const steps = [
  {
    number: "01",
    icon: Stethoscope,
    title: "Doctor Mints",
    description:
      "A doctor creates a medical record and mints it as an NFT on Base Sepolia, anchoring it permanently to the blockchain.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    number: "02",
    icon: User,
    title: "Patient Controls",
    description:
      "The patient receives the record in their wallet and decides exactly which hospitals are allowed to view it.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    number: "03",
    icon: Building2,
    title: "Hospital Verifies",
    description:
      "The hospital accesses the record with a signed audit log — every view is cryptographically proven and immutable.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const trustFeatures = [
  { icon: Zap, label: "Immutable on Base Sepolia" },
  { icon: Lock, label: "Patient-Controlled Access" },
  { icon: ClipboardList, label: "Cryptographic Audit Trail" },
  { icon: ShieldCheck, label: "NFT-Based Ownership" },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">VaultMed</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              document
                .getElementById("choose-role")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Choose Role <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full bg-success/5 blur-3xl" />
        </div>

        <div className="relative max-w-3xl text-center mb-10 animate-fade-in">
          <Badge variant="outline" className="mb-5 text-xs font-medium px-3 py-1">
            Powered by Base Sepolia Blockchain
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
            Your medical records.{" "}
            <span className="text-gradient">Secured on-chain.</span>{" "}
            Always in your control.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            VaultMed uses blockchain technology to give patients ownership of
            their health data — shareable, verifiable, and tamper-proof.
          </p>

          {/* Trust stats */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { value: "500+", label: "Records Minted" },
              { value: "100%", label: "Tamper-Proof" },
              { value: "3", label: "Role Access Control" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-2xl font-extrabold text-primary">
                  {stat.value}
                </span>
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Three roles, one seamless blockchain-powered workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {steps.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-9 left-[calc(50%+36px)] w-[calc(100%-72px)] h-px bg-border z-0" />
                )}
                <div
                  className={`relative z-10 w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mb-4`}
                >
                  <step.icon className={`h-7 w-7 ${step.color}`} />
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold text-muted-foreground bg-background border border-border rounded-full w-5 h-5 flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Feature Cards */}
      <section id="choose-role" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Select Your Role
            </h2>
            <p className="text-muted-foreground">
              Each role has a dedicated portal. Choose yours to get started.
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {personas.map((p) => (
              <Card
                key={p.title}
                className={`bg-card border border-border ${p.borderHover} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl`}
              >
                <CardContent className="p-8 flex flex-col gap-5">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${p.accentBg} flex items-center justify-center shrink-0`}
                    >
                      <p.icon className={`h-6 w-6 ${p.accentColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {p.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border" />

                  {/* Capabilities */}
                  <ul className="flex flex-col gap-3">
                    {p.capabilities.map((cap) => (
                      <li key={cap.text} className="flex items-start gap-2.5">
                        <cap.icon
                          className={`h-4 w-4 mt-0.5 shrink-0 ${p.accentColor}`}
                        />
                        <span className="text-sm text-foreground leading-snug">
                          {cap.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className="mt-auto w-full"
                    variant={p.title === "Patient" ? "secondary" : p.title === "Hospital" ? "outline" : "default"}
                    onClick={() => navigate(p.route)}
                  >
                    Enter as {p.title}{" "}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Features Strip */}
      <section className="px-6 py-10 bg-muted/30 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {trustFeatures.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-sm text-muted-foreground"
              >
                <f.icon className="h-4 w-4 text-primary" />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        © 2026 VaultMed · Blockchain-secured medical records for everyone.
      </footer>
    </div>
  );
};

export default LandingPage;
