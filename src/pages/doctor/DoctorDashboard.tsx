import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  CalendarDays,
  Plus,
  Eye,
  FolderOpen,
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
  const uniquePatients = new Set(doctorRecords.map((r) => r.patientWallet))
    .size;
  const thisMonth = doctorRecords.filter((r) => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const stats = [
    {
      label: "Total Records Created",
      value: doctorRecords.length,
      icon: FileText,
    },
    { label: "Patients Treated", value: uniquePatients, icon: Users },
    { label: "Records This Month", value: thisMonth, icon: CalendarDays },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, {user?.name}
        </h1>
        <Button onClick={() => navigate("/doctor/create-record")}>
          <Plus className="h-4 w-4 mr-2" /> Create Record
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="bg-card border border-border shadow-sm rounded-xl"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Records */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Records
        </h2>
        {doctorRecords.length === 0 ? (
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardContent className="p-12 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No records yet. Create your first medical record.
              </p>
              <Button onClick={() => navigate("/doctor/create-record")}>
                <Plus className="h-4 w-4 mr-2" /> Create Record
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
                  className="bg-card border border-border shadow-sm rounded-xl hover:shadow-md transition-all"
                >
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-semibold text-foreground">
                      {rec.title}
                    </h3>
                    {col && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FolderOpen className="h-3.5 w-3.5" />
                        {col.name}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground font-mono">
                      {truncateAddress(rec.patientWallet)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </span>
                      <Badge
                        variant={
                          rec.status === "minted" ? "default" : "secondary"
                        }
                        className={
                          rec.status === "minted"
                            ? "bg-success text-success-foreground"
                            : "bg-warning text-warning-foreground"
                        }
                      >
                        {rec.status === "minted" ? "Minted" : "Pending"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/patient/record/${rec.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
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
