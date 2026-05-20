import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  FolderOpen,
  Search,
  Share2,
  Building2,
  Activity,
  ArrowRight,
  Stethoscope,
  User,
  Eye,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";

const PatientDashboard = () => {
  const { user } = useAuth();
  const { data: records, isLoading } = useDocuments();
  const navigate = useNavigate();
  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState("");

  const allPatientRecords = records ?? [];

  const totalRecords = allPatientRecords.length;

  let patientRecords = [...allPatientRecords];
  if (filter) {
    patientRecords = patientRecords.filter((r) =>
      (r.creator?.name ?? "").toLowerCase().includes(filter.toLowerCase()),
    );
  }
  patientRecords.sort((a, b) =>
    sort === "newest"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const statsConfig = [
    {
      label: "Total Records",
      value: totalRecords,
      icon: FileText,
      bg: "bg-primary/10",
      color: "text-primary",
      border: "border-l-primary",
      trend: "Your NFTs",
      trendIcon: TrendingUp,
    },
    {
      label: "Categories",
      value: new Set(allPatientRecords.map((r) => r.category)).size,
      icon: Activity,
      bg: "bg-primary/10",
      color: "text-primary",
      border: "border-l-primary",
      trend: "Across records",
      trendIcon: Share2,
    },
    {
      label: "Hospital Access",
      value: "Manage",
      icon: Building2,
      bg: "bg-primary/10",
      color: "text-primary",
      border: "border-l-primary",
      trend: "per record",
      trendIcon: ShieldCheck,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-36 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-16 rounded-xl" />
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
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-border p-8">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

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
              Your medical records are secured on Midnight Preprod as NFTs —
              only you control who sees them.
            </p>
          </div>
        </div>
      </div>

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
                <p className="text-3xl font-extrabold text-foreground">
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {s.label}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <s.trendIcon className={`h-4 w-4 ${s.color}`} />
                <span className={`text-xs font-medium ${s.color}`}>
                  {s.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border border-border shadow-sm rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by doctor name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground shrink-0">
              {patientRecords.length} of {totalRecords} records
            </span>
          </div>
        </CardContent>
      </Card>

      {patientRecords.length === 0 ? (
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No records yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {filter
                  ? "No records match your filter."
                  : "Records issued by your doctor will appear here once they're minted on Midnight."}
              </p>
            </div>
            {!filter && (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {[
                  {
                    icon: Stethoscope,
                    label: "Doctor",
                    sub: "Creates record",
                  },
                  {
                    icon: FileText,
                    label: "NFT Minted",
                    sub: "On Midnight Preprod",
                  },
                  {
                    icon: User,
                    label: "You",
                    sub: "Receive & manage",
                  },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                        <step.icon className="h-7 w-7 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.sub}
                      </p>
                    </div>
                    {i < 2 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patientRecords.map((rec, index) => (
            <Card
              key={rec.id}
              className="bg-card border border-border shadow-sm rounded-xl hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer overflow-hidden group"
              style={{ animationDelay: `${index * 0.08}s` }}
              onClick={() => navigate(`/patient/record/${rec.id}`)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <div className="w-full h-44 flex items-center justify-center bg-primary/5">
                    {rec.fileUrl && rec.fileType === "image" ? (
                      <img
                        src={rec.fileUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xl font-bold text-center px-6 leading-snug text-primary">
                        {rec.title}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      On-chain ✓
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-foreground leading-snug">
                    {rec.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {rec.creator?.name ?? "Unknown"}
                    </span>
                  </div>
                  {rec.collection && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{rec.collection.name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
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
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
