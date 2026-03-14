import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FolderOpen,
  Building2,
  Eye,
  ShieldCheck,
  X,
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
  const {
    records,
    collections,
    sharedWith,
    viewLogs,
    grantAccess,
    revokeAccess,
  } = useCollections();
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
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!record)
    return <p className="text-muted-foreground">Record not found.</p>;

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
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> My Records
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
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
              <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t border-border">
                <p>Token ID: {record.tokenId}</p>
                <p>
                  Contract:{" "}
                  <a
                    href={`https://sepolia.basescan.org/token/${record.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-mono"
                  >
                    {truncateAddress(record.contractAddress)}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Share card */}
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Share with a Hospital</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select
                  value={selectedHospital}
                  onValueChange={setSelectedHospital}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableHospitals.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name} — {h.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleGrant} disabled={!selectedHospital}>
                  Grant Access
                </Button>
              </div>
              {shared.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  {shared.map((s) => (
                    <div
                      key={s.hospitalId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-foreground">
                        {s.hospitalName} —{" "}
                        <span className="text-muted-foreground">
                          Granted {new Date(s.grantedAt).toLocaleDateString()}
                        </span>
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="text-destructive text-xs hover:underline">
                            Revoke
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to revoke {s.hospitalName}'s
                              access to this record?
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
              )}
            </CardContent>
          </Card>

          {/* View logs card */}
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">
                Who Viewed This Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No views yet</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <span className="text-foreground font-medium">
                          {log.hospitalName}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          viewed this record
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.viewedAt).toLocaleString()}
                        </p>
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
