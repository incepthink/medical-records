import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  CalendarDays,
  Plus,
  Eye,
  FolderOpen,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useCollections } from "@/context/CollectionsContext";
import { truncateAddress, simulateDelay } from "@/mock/data";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { records, collections } = useCollections();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    simulateDelay(600).then(() => setLoading(false));
  }, []);

  const doctorRecords = records.filter((r) => r.doctorId === user?.id);
  const uniquePatients = new Set(doctorRecords.map((r) => r.patientWallet)).size;
  const thisMonth = doctorRecords.filter((r) => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const statsConfig = [
    {
      label: "Total Records Created",
      value: doctorRecords.length,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-l-primary",
      trend: "+2 this week",
      trendIcon: TrendingUp,
    },
    {
      label: "Patients Treated",
      value: uniquePatients,
      icon: Users,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-l-success",
      trend: "Unique wallets",
      trendIcon: Activity,
    },
    {
      label: "Records This Month",
      value: thisMonth,
      icon: CalendarDays,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-l-warning",
      trend: new Date().toLocaleString("default", { month: "long" }),
      trendIcon: Sparkles,
    },
  ];

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-36 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-success/5 border border-border p-8">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-success/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary">{initials}</span>
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Welcome back,</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gradient leading-tight">
              {user?.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Managing your patients' records on Base Sepolia
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <Button onClick={() => navigate("/doctor/create-record")}>
              <Plus className="h-4 w-4 mr-2" /> Create Record
            </Button>
            <Button variant="outline" onClick={() => navigate("/doctor/collections")}>
              <FolderOpen className="h-4 w-4 mr-2" /> Collections
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsConfig.map((s) => (
          <Card
            key={s.label}
            className={`bg-card border border-border border-l-4 ${s.border} shadow-sm rounded-xl hover:shadow-md transition-all`}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}
              >
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-3xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground truncate">{s.label}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <s.trendIcon className={`h-4 w-4 ${s.color}`} />
                <span className={`text-xs font-medium ${s.color}`}>{s.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            className="bg-card border border-border shadow-sm rounded-xl hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
            onClick={() => navigate("/doctor/create-record")}
          >
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Create New Record</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Mint a medical record as an NFT and send it directly to a patient's wallet.
                </p>
                <span className="text-xs text-primary font-medium mt-2 inline-flex items-center gap-1">
                  Get started <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-card border border-border shadow-sm rounded-xl hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
            onClick={() => navigate("/doctor/collections")}
          >
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0 group-hover:bg-success/20 transition-colors">
                <FolderOpen className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">New Collection</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Group related records into a named collection like "Lab Results" or "Cardiology".
                </p>
                <span className="text-xs text-success font-medium mt-2 inline-flex items-center gap-1">
                  Organize records <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Records */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Records</h2>
          {doctorRecords.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/doctor/collections")}
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {doctorRecords.length === 0 ? (
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardContent className="p-12 flex flex-col items-center text-center gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0">
                {[
                  {
                    icon: Stethoscope,
                    label: "Doctor",
                    sub: "Creates record",
                    color: "text-primary",
                    bg: "bg-primary/10",
                  },
                  {
                    icon: FileText,
                    label: "Record",
                    sub: "Minted as NFT",
                    color: "text-warning",
                    bg: "bg-warning/10",
                  },
                  {
                    icon: Users,
                    label: "Patient",
                    sub: "Receives in wallet",
                    color: "text-success",
                    bg: "bg-success/10",
                  },
                ].map((step, i) => (
                  <div key={step.label} className="flex sm:flex-row items-center gap-0">
                    <div className="flex flex-col items-center text-center px-4">
                      <div
                        className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mb-2`}
                      >
                        <step.icon className={`h-7 w-7 ${step.color}`} />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.sub}</p>
                    </div>
                    {i < 2 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
              <Button onClick={() => navigate("/doctor/create-record")}>
                <Plus className="h-4 w-4 mr-2" /> Create Your First Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorRecords.map((rec) => {
              const col = collections.find((c) => c.id === rec.collectionId);
              return (
                <Card
                  key={rec.id}
                  className="bg-card border border-border shadow-sm rounded-xl hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer overflow-hidden group"
                  onClick={() => navigate(`/patient/record/${rec.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={rec.imageUrl}
                        alt={rec.title}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge
                        className={`absolute top-3 right-3 text-xs ${
                          rec.status === "minted"
                            ? "bg-success text-success-foreground"
                            : "bg-warning text-warning-foreground"
                        }`}
                      >
                        {rec.status === "minted" ? "Minted ✓" : "Pending"}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-foreground leading-snug">
                        {rec.title}
                      </h3>
                      {col && (
                        <div className="flex items-center gap-1.5">
                          <FolderOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">
                            {col.name}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground font-mono">
                        {truncateAddress(rec.patientWallet)}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-primary font-medium flex items-center gap-1">
                          View <Eye className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
