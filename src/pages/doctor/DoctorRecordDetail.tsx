import { useParams, useNavigate } from "react-router-dom";
import {
  FolderOpen,
  Building2,
  Eye,
  Shield,
  CalendarDays,
  Hash,
  ExternalLink,
  Stethoscope,
  Globe,
  ChevronRight,
  ShieldCheck,
  Clock,
  Wallet,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocument } from "@/hooks/useDocuments";
import { useDocumentViewers, useAccessLogs } from "@/hooks/useSharing";
import { truncateAddress } from "@/mock/data";

const DoctorRecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: record, isLoading } = useDocument(id ?? "");
  const { data: shared } = useDocumentViewers(id ?? "");
  const { data: logs } = useAccessLogs(id ?? "");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!record)
    return <p className="text-muted-foreground">Record not found.</p>;

  const sharedList = shared ?? [];
  const logsList = logs ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/doctor/dashboard")}
          className="hover:text-foreground transition-colors"
        >
          My Records
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate">
          {record.title}
        </span>
      </nav>

      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-border p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gradient leading-tight mb-3">
            {record.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {record.collection && (
              <Badge variant="secondary" className="gap-1.5">
                <FolderOpen className="h-3 w-3" /> {record.collection.name}
              </Badge>
            )}
            {record.tokenId !== null && (
              <Badge
                variant="outline"
                className="gap-1.5 text-primary border-primary/40"
              >
                <Hash className="h-3 w-3" /> NFT #{record.tokenId}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1.5">
              <Globe className="h-3 w-3" /> Midnight Preprod
            </Badge>
            <Badge className="gap-1.5 bg-primary text-primary-foreground">
              <ShieldCheck className="h-3 w-3" />
              {record.status === "minted" ? "On-chain ✓" : "Pending"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
            <div className="w-full h-64 md:h-80 flex items-center justify-center bg-primary/5">
              {record.fileUrl && record.fileType === "image" ? (
                <img
                  src={record.fileUrl}
                  alt={record.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-center px-8 leading-snug text-primary">
                  {record.title}
                </span>
              )}
            </div>
          </Card>

          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-2">
                About this Record
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {record.description ?? "No description provided."}
              </p>
            </CardContent>
          </Card>

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
                  value: record.creator?.name ?? "—",
                  mono: false,
                },
                {
                  icon: Hash,
                  label: "Token ID",
                  value:
                    record.tokenId !== null ? `#${record.tokenId}` : "—",
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
                  value: "Midnight Preprod",
                  mono: false,
                },
                {
                  icon: Wallet,
                  label: "Patient Wallet",
                  value: truncateAddress(record.ownerWallet),
                  mono: true,
                },
                {
                  icon: FileText,
                  label: "Tx Hash",
                  value: record.txHash ? truncateAddress(record.txHash) : "—",
                  mono: true,
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
              {record.contractAddress && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Contract Address
                    </p>
                    <a
                      href={`https://midnight-explorer.preprod.midnight.network/contracts/${record.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      {truncateAddress(record.contractAddress)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                Hospital Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sharedList.length === 0 ? (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No hospitals have access
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The patient has not shared this record with any hospitals yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sharedList.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {s.viewer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Granted {new Date(s.grantedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
              {logsList.length === 0 ? (
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
                  {logsList.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Eye className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {log.viewer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.accessedAt).toLocaleString()}
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

export default DoctorRecordDetail;
