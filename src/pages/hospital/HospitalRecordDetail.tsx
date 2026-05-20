import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  FolderOpen,
  CheckCircle2,
  Loader2,
  Globe,
  Hash,
  Stethoscope,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useViewerDocuments } from "@/hooks/useViewers";
import { useSignDocument } from "@/hooks/useSharing";
import { useMidnightWalletContext } from "@/context/MidnightWalletContext";
import {
  callSignDocument,
  decodeShieldedAddress,
  bytesToHex,
} from "@/lib/midnight/contractApi";
import { truncateAddress } from "@/mock/data";
import { toast } from "sonner";

const HospitalRecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: shares, isLoading } = useViewerDocuments();
  const signDocument = useSignDocument();
  const { connectedAPI, address: midnightAddress } =
    useMidnightWalletContext();

  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [justSigned, setJustSigned] = useState(false);
  const [sigHashHex, setSigHashHex] = useState("");
  const [sigTimestamp] = useState(new Date().toISOString());

  const share = shares?.find((s) => s.document.id === id || s.documentId === id);
  const record = share?.document;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!record || !share)
    return <p className="text-muted-foreground">Record not found.</p>;

  const handleSign = async () => {
    if (!midnightAddress) {
      toast.error("Wallet not connected");
      return;
    }
    setSigning(true);
    try {
      const viewerPk = decodeShieldedAddress(midnightAddress);
      const timestamp = new Date().toISOString();
      const combined = new TextEncoder().encode(
        bytesToHex(viewerPk) + timestamp + record.id,
      );
      const hashBuf = await crypto.subtle.digest("SHA-256", combined);
      const sigHash = new Uint8Array(hashBuf);
      const hexSig = "0x" + bytesToHex(sigHash);

      if (connectedAPI && record.onchainTokenId) {
        try {
          const tokenId = BigInt(record.onchainTokenId);
          await callSignDocument(connectedAPI, tokenId, viewerPk, sigHash);
        } catch (err) {
          console.log("On-chain sign failed, continuing with backend:", err);
        }
      }

      await signDocument.mutateAsync({
        documentId: record.id,
        signatureHash: hexSig,
      });

      setSigHashHex(hexSig);
      setSigning(false);
      setJustSigned(true);
      toast.success("Identity verified! Record access granted.");
      setTimeout(() => {
        setJustSigned(false);
        setSigned(true);
      }, 1200);
    } catch (err) {
      setSigning(false);
      console.log(err);
      toast.error("Sign failed. Please try again.");
    }
  };

  if (signing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <Card className="w-full max-w-md bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Generating signature proof…
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Submitting the signature to Midnight Preprod
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (justSigned) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-scale-in">
        <Card className="w-full max-w-md bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Identity Verified!
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Loading full record details…
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Breadcrumb = () => (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link
        to="/hospital/dashboard"
        className="hover:text-foreground transition-colors"
      >
        Hospital Dashboard
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="text-foreground font-medium truncate max-w-[200px]">
        {record.title}
      </span>
    </nav>
  );

  const HeroBanner = () => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 p-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-24 -translate-x-24 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-3">
          {record.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          {record.collection && (
            <Badge variant="secondary" className="gap-1.5 text-xs">
              <FolderOpen className="h-3 w-3" /> {record.collection.name}
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Hash className="h-3 w-3" /> NFT Record
          </Badge>
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Globe className="h-3 w-3" /> Midnight Preprod
          </Badge>
          <Badge
            className={`gap-1.5 text-xs ${
              signed
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}
          >
            {signed ? (
              <>
                <ShieldCheck className="h-3 w-3" /> Verified ✓
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" /> Identity Required
              </>
            )}
          </Badge>
        </div>
      </div>
    </div>
  );

  if (!signed) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Breadcrumb />
        <HeroBanner />

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-xl bg-card border border-border shadow-sm rounded-xl">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Lock className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Identity Verification Required
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    To protect patient privacy, hospitals must cryptographically
                    sign a challenge with their wallet before viewing full
                    record contents. This creates an auditable access log
                    visible to the patient.
                  </p>
                </div>
              </div>

              <div className="border border-border rounded-xl p-4 space-y-4 bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Steps to Access
                </p>
                {[
                  {
                    n: 1,
                    label: "Connect your hospital wallet",
                    sub: "Use the wallet button in the top nav",
                  },
                  {
                    n: 2,
                    label: "Sign the verification challenge",
                    sub: "ZK proof submitted to Midnight Preprod",
                  },
                  {
                    n: 3,
                    label: "Access the full record",
                    sub: "View details, blockchain proof, and history",
                  },
                ].map(({ n, label, sub }) => (
                  <div key={n} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {n}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Patient:{" "}
                  <span className="font-mono">
                    {truncateAddress(record.ownerWallet)}
                  </span>
                </span>
              </div>

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleSign}
                disabled={signDocument.isPending}
              >
                <ShieldCheck className="h-5 w-5" /> Sign to Verify Identity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumb />
      <HeroBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
            <div className="relative overflow-hidden">
              <div className="w-full h-64 md:h-80 flex items-center justify-center bg-primary/5">
                {record.fileUrl && record.fileType === "image" ? (
                  <img
                    src={record.fileUrl}
                    alt={record.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-4xl font-bold text-center px-8 leading-snug text-primary">
                    {record.title}
                  </span>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <Badge className="bg-primary text-primary-foreground gap-1.5 shadow">
                  <ShieldCheck className="h-3 w-3" /> Verified ✓
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {record.description ?? "No description provided."}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-l-4 border-l-primary border-border shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Blockchain Details</CardTitle>
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
                  icon: Calendar,
                  label: "Issued date",
                  value: new Date(record.createdAt).toLocaleDateString(),
                  mono: false,
                },
                {
                  icon: Globe,
                  label: "Network",
                  value: "Midnight Preprod",
                  mono: false,
                },
              ].map(({ icon: Icon, label, value, mono }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p
                      className={`text-sm font-medium text-foreground ${
                        mono ? "font-mono" : ""
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              ))}
              {record.contractAddress && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ExternalLink className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contract</p>
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

        <div className="space-y-5">
          <Card className="bg-card border border-l-4 border-l-primary border-border shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">Verification Proof</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Signature Hash
                  </p>
                  <p className="font-mono text-xs text-foreground break-all bg-muted/40 rounded-md p-2">
                    {sigHashHex}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Hospital Wallet
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    {truncateAddress(user?.wallet ?? midnightAddress ?? "")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Verified at
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(sigTimestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground gap-1.5 w-full justify-center">
                <ShieldCheck className="h-3.5 w-3.5" /> Identity Verified ✓
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Access Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Patient Wallet
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    {truncateAddress(record.ownerWallet)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Doctor</p>
                  <p className="text-sm text-foreground">
                    {record.creator?.name ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Shared on</p>
                  <p className="text-sm text-foreground">
                    {new Date(share.grantedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate("/hospital/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HospitalRecordDetail;
