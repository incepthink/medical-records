import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollections } from "@/context/CollectionsContext";
import { truncateAddress, simulateDelay } from "@/mock/data";

const HospitalDashboard = () => {
  const { sharedRecordsForHospital } = useCollections();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    simulateDelay(600).then(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Shared Records
        </h1>
        <p className="text-muted-foreground mt-1">
          Records that patients have shared with your organization
        </p>
      </div>

      {sharedRecordsForHospital.length === 0 ? (
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              No records shared with you yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sharedRecordsForHospital.map((rec) => (
            <Card
              key={rec.recordId}
              className="bg-card border border-border shadow-sm rounded-xl hover:shadow-md transition-all"
            >
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-foreground">{rec.title}</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {truncateAddress(rec.patientWallet)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {rec.doctorName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(rec.sharedAt).toLocaleDateString()}
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate(`/hospital/record/${rec.recordId}`)}
                >
                  <Eye className="h-4 w-4 mr-1" /> View Record
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
