import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FolderOpen,
  Building2,
  Eye,
  Share2,
  Shield,
  CalendarDays,
  Hash,
  ExternalLink,
  Stethoscope,
  Globe,
  ChevronRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCollections } from "@/context/CollectionsContext";
import { MOCK_HOSPITALS, truncateAddress, simulateDelay } from "@/mock/data";
import { toast } from "sonner";

const PatientRecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { records, collections, sharedWith, viewLogs, grantAccess, revokeAccess } =
    useCollections();
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState("");

  useEffect(() => {
    simulateDelay(600).then(() => setLoading(false));
  }, []);

  const record = records.find((r) => r.id === id);
  const collection = record
    ? collections.find((c) => c.id === record.collectionId)
    : null;
  const shared = sharedWith[id || ""] || [];
  const logs = viewLogs[id || ""] || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!record) return <p className="text-muted-foreground">Record not found.</p>;

  const availableHospitals = MOCK_HOSPITALS.filter(
    (h) => !shared.some((s) => s.hospitalId === h.id),
  );

  const handleGrant = () => {
    const h = MOCK_HOSPITALS.find((h) => h.id === selectedHospital);
    if (!h) return;
    grantAccess(record.id, h.id, h.name);
    toast.success(`Access granted to ${h.name}`);
    setSelectedHospital("");
  };

  const handleRevoke = (hospitalId: string) => {
    revokeAccess(record.id, hospitalId);
    toast.success("Access revoked");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/patient/dashboard")}
          className="hover:text-foreground transition-colors"
        >
          My Records
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium truncate">{record.title}</span>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-success/5 border border-border p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-success/5 blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gradient leading-tight mb-3">
            {record.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {collection && (
              <Badge variant="secondary" className="gap-1.5">
                <FolderOpen className="h-3 w-3" /> {collection.name}
              </Badge>
            )}
            <Badge
              variant="outline"
              className="gap-1.5 text-primary border-primary/40"
            >
              <Hash className="h-3 w-3" /> NFT #{record.tokenId}
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Globe className="h-3 w-3" /> Base Sepolia
            </Badge>
            <Badge className="bg-success text-success-foreground gap-1.5">
              <ShieldCheck className="h-3 w-3" /> On-chain ✓
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden group">
            <img
              src={record.imageUrl}
              alt={record.title}
              className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Card>

          {/* Description */}
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-2">
                About this Record
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {record.description}
              </p>
            </CardContent>
          </Card>

          {/* Blockchain Details */}
          <Card className="bg-card border border-border border-l-4 border-l-primary shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                Blockchain Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  icon: Stethoscope,
                  label: "Issued by",
                  value: record.doctorName,
                  mono: false,
                },
                {
                  icon: Hash,
                  label: "Token ID",
                  value: `#${record.tokenId}`,
                  mono: true,
                },
                {
                  icon: CalendarDays,
                  label: "Issued on",
                  value: new Date(record.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  mono: false,
                },
                {
                  icon: Globe,
                  label: "Network",
                  value: "Base Sepolia",
                  mono: false,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p
                      className={`text-sm font-medium text-foreground ${item.mono ? "font-mono" : ""}`}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-1">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Contract Address
                  </p>
                  <a
                    href={`https://sepolia.basescan.org/token/${record.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-primary hover:underline flex items-center gap-1"
                  >
                    {truncateAddress(record.contractAddress)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Share Access Card */}
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Share2 className="h-4 w-4 text-success" />
                </div>
                Manage Hospital Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Currently shared */}
              {shared.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Currently Shared
                  </p>
                  <div className="space-y-2">
                    {shared.map((s) => (
                      <div
                        key={s.hospitalId}
                        className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                      >
                        <div className="w-7 h-7 rounded-md bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="h-3.5 w-3.5 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {s.hospitalName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Granted{" "}
                            {new Date(s.grantedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="text-destructive text-xs hover:underline shrink-0 mt-1">
                              Revoke
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke{" "}
                                {s.hospitalName}'s access to this record?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevoke(s.hospitalId)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Revoke
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grant new access */}
              <div
                className={
                  shared.length > 0
                    ? "pt-3 border-t border-border space-y-3"
                    : "space-y-3"
                }
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Grant Access
                </p>
                {availableHospitals.length === 0 ? (
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <ShieldCheck className="h-5 w-5 text-success mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">
                      All hospitals already have access
                    </p>
                  </div>
                ) : (
                  <>
                    <Select
                      value={selectedHospital}
                      onValueChange={setSelectedHospital}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a hospital..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableHospitals.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name} — {h.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleGrant}
                      disabled={!selectedHospital}
                      className="w-full"
                    >
                      <Shield className="h-4 w-4 mr-2" /> Grant Access
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* View Audit Log Card */}
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                Access History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No views yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll see when a hospital views this record
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Eye className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {log.hospitalName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.viewedAt).toLocaleString()}
                        </p>
                        {log.signatureHash && (
                          <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                            {log.signatureHash.slice(0, 18)}...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientRecordDetail;
