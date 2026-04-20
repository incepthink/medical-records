import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  FileText,
  User,
  Stethoscope,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Share2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollections } from "@/context/CollectionsContext";
import { useAuth } from "@/context/AuthContext";
import { truncateAddress, simulateDelay } from "@/mock/data";

const HospitalDashboard = () => {
  const { sharedRecordsForHospital } = useCollections();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    simulateDelay(600).then(() => setLoading(false));
  }, []);

  const verifiedCount = sharedRecordsForHospital.filter((r) => r.signed).length;
  const pendingCount = sharedRecordsForHospital.filter((r) => !r.signed).length;

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "HO";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-24 -translate-x-24 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg">
              {initials}
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gradient">
              Hospital Records Portal
            </h1>
            <p className="text-muted-foreground mt-1 max-w-xl">
              Patients have shared these medical records with your institution.
              Verify your identity with your wallet to access full record details.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="gap-1.5 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Base Sepolia
              </Badge>
              <Badge variant="secondary" className="gap-1.5 text-xs">
                <ShieldCheck className="h-3 w-3" /> Secure Access
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Records Shared</p>
              <p className="text-2xl font-bold text-foreground">
                {sharedRecordsForHospital.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold text-foreground">{verifiedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Verification</p>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="bg-card border border-border shadow-sm rounded-xl">
        <CardContent className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-5">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                icon: Share2,
                iconBg: "bg-primary/10",
                iconColor: "text-primary",
                title: "Patient Shares",
                desc: "A patient grants your hospital access to their medical NFT record from their dashboard.",
              },
              {
                step: 2,
                icon: Building2,
                iconBg: "bg-warning/10",
                iconColor: "text-warning",
                title: "You Receive",
                desc: "The record appears here automatically. You can see basic info without verification.",
              },
              {
                step: 3,
                icon: ShieldCheck,
                iconBg: "bg-success/10",
                iconColor: "text-success",
                title: "Verify & View",
                desc: "Connect your wallet and sign a challenge to prove identity and unlock the full record.",
              },
            ].map(({ step, icon: Icon, iconBg, iconColor, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {step}
                  </div>
                  {step < 3 && (
                    <div className="flex-1 w-px bg-border hidden md:block" />
                  )}
                </div>
                <div className="pb-2">
                  <div
                    className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mb-2`}
                  >
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Records Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Shared Records
          </h2>
          {sharedRecordsForHospital.length > 0 && (
            <Badge variant="secondary">
              {sharedRecordsForHospital.length} record
              {sharedRecordsForHospital.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {sharedRecordsForHospital.length === 0 ? (
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardContent className="p-16 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  No Records Shared Yet
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  When patients share their medical records with your hospital,
                  they will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedRecordsForHospital.map((rec, index) => (
              <Card
                key={rec.recordId}
                className="bg-card border border-border shadow-sm rounded-xl hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer overflow-hidden"
                style={{
                  animationDelay: `${index * 0.08}s`,
                  borderLeft: `3px solid ${rec.signed ? "hsl(var(--success))" : "hsl(var(--warning))"}`,
                }}
                onClick={() => navigate(`/hospital/record/${rec.recordId}`)}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground leading-tight">
                      {rec.title}
                    </h3>
                    <Badge
                      variant={rec.signed ? "default" : "secondary"}
                      className={`shrink-0 text-xs gap-1 ${
                        rec.signed
                          ? "bg-success text-success-foreground"
                          : "bg-warning/10 text-warning border border-warning/20"
                      }`}
                    >
                      {rec.signed ? (
                        <>
                          <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                        </>
                      ) : (
                        <>
                          <Clock className="h-2.5 w-2.5" /> Pending
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span className="font-mono">{truncateAddress(rec.patientWallet)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Stethoscope className="h-3 w-3 text-primary" />
                      </div>
                      <span>{rec.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-3 w-3 text-primary" />
                      </div>
                      <span>{new Date(rec.sharedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full gap-1.5"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/hospital/record/${rec.recordId}`);
                    }}
                  >
                    {rec.signed ? "View Record" : "View & Verify"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
