import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  FolderOpen,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollections } from "@/context/CollectionsContext";
import { useAuth } from "@/context/AuthContext";
import { truncateAddress, simulateDelay } from "@/mock/data";
import { toast } from "sonner";

const HospitalRecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    records,
    collections,
    sharedRecordsForHospital,
    markHospitalRecordSigned,
    logView,
  } = useCollections();
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [justSigned, setJustSigned] = useState(false);

  useEffect(() => {
    simulateDelay(600).then(() => setLoading(false));
  }, []);

  const sharedRec = sharedRecordsForHospital.find((r) => r.recordId === id);
  const record = records.find((r) => r.id === id);
  const collection = record
    ? collections.find((c) => c.id === record.collectionId)
    : null;
  const isSigned = sharedRec?.signed || false;

  const signatureHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  const signatureMessage = record
    ? `I, ${user?.name}, am accessing the medical record '${record.title}' belonging to patient ${record.patientWallet}. Timestamp: ${new Date().toISOString()}`
    : "";

  const handleSign = async () => {
    setSigning(true);
    await new Promise((r) => setTimeout(r, 1500));
    markHospitalRecordSigned(id || "");
    logView(
      id || "",
      user?.id || "",
      user?.name || "",
      user?.wallet || "",
      signatureHash,
    );
    setSigning(false);
    setJustSigned(true);
    toast.success("Identity verified! Record access granted.");
    setTimeout(() => setJustSigned(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!record)
    return <p className="text-muted-foreground">Record not found.</p>;

  // Signing state
  if (signing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <Card className="w-full max-w-md bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <h2 className="text-xl font-semibold text-foreground">
              Waiting for signature...
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success animation
  if (justSigned) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-scale-in">
        <Card className="w-full max-w-md bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Identity Verified!
            </h2>
            <p className="text-sm text-muted-foreground">Loading record...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Gate card — not signed
  if (!isSigned) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/hospital/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Shared Records
        </Button>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-lg bg-card border border-border shadow-sm rounded-xl">
            <CardContent className="p-10 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Verify Your Identity to View This Record
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                You must sign a message with your connected wallet to access
                this medical record. This action will be logged and visible to
                the patient.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Patient:{" "}
                  <span className="font-mono">
                    {truncateAddress(record.patientWallet)}
                  </span>
                </p>
                <p>Record: {record.title}</p>
              </div>
              <Button
                size="lg"
                className="w-full max-w-xs"
                onClick={handleSign}
              >
                <ShieldCheck className="h-5 w-5 mr-2" /> Sign & View Record
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Record view — signed
  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate("/hospital/dashboard")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Shared Records
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2">
          <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
            <img
              src={record.imageUrl}
              alt={record.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                {record.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {record.description}
              </p>
              {collection && (
                <Badge variant="secondary" className="gap-1.5">
                  <FolderOpen className="h-3 w-3" /> {collection.name}
                </Badge>
              )}
              <p className="text-sm text-muted-foreground">
                Issued by {record.doctorName} ·{" "}
                {new Date(record.createdAt).toLocaleDateString()} · Base Sepolia
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right — Verification proof */}
        <div>
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Verification Proof</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">
                    Signature Hash
                  </p>
                  <p className="font-mono text-foreground text-xs break-all">
                    {signatureHash}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    Hospital Wallet
                  </p>
                  <p className="font-mono text-foreground text-xs">
                    {truncateAddress(user?.wallet || "")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Timestamp</p>
                  <p className="text-foreground text-xs">
                    {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge className="bg-success text-success-foreground gap-1.5">
                <ShieldCheck className="h-3 w-3" /> Identity Verified ✓
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HospitalRecordDetail;
