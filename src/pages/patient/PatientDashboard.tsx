import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, FolderOpen, Search } from "lucide-react";
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
import { useCollections } from "@/context/CollectionsContext";
import { useAuth } from "@/context/AuthContext";
import { simulateDelay } from "@/mock/data";

const PatientDashboard = () => {
  const { user } = useAuth();
  const { records, collections } = useCollections();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    simulateDelay(600).then(() => setLoading(false));
  }, []);

  let patientRecords = records.filter((r) => r.patientWallet === user?.wallet);

  if (filter) {
    patientRecords = patientRecords.filter((r) =>
      r.doctorName.toLowerCase().includes(filter.toLowerCase()),
    );
  }

  patientRecords.sort((a, b) =>
    sort === "newest"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          My Medical Records
        </h1>
        <p className="text-muted-foreground mt-1">
          Records issued to your wallet by verified doctors
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by doctor name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
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

      {patientRecords.length === 0 ? (
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              No records yet. Records issued by your doctor will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patientRecords.map((rec) => {
            const col = collections.find((c) => c.id === rec.collectionId);
            return (
              <Card
                key={rec.id}
                className="bg-card border border-border shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate(`/patient/record/${rec.id}`)}
              >
                <CardContent className="p-0">
                  <img
                    src={rec.imageUrl}
                    alt={rec.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-foreground">
                      {rec.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Issued by: {rec.doctorName}
                    </p>
                    {col && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FolderOpen className="h-3.5 w-3.5" /> {col.name}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-primary border-primary text-xs"
                      >
                        On-chain ✓
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
