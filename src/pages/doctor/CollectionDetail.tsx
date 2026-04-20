import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, FolderOpen, Plus, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollections } from "@/context/CollectionsContext";
import { truncateAddress, simulateDelay } from "@/mock/data";

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { collections, records } = useCollections();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    simulateDelay(600).then(() => setLoading(false));
  }, []);

  const collection = collections.find((c) => c.id === id);
  const colRecords = records.filter((r) => r.collectionId === id);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-36 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection)
    return <p className="text-muted-foreground">Collection not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/doctor/collections")}
          className="hover:text-foreground transition-colors"
        >
          Collections
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate">{collection.name}</span>
      </nav>

      {/* Collection header banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-border p-8">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
            <FolderOpen className="h-8 w-8 text-primary" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gradient leading-tight">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-muted-foreground mt-1 text-sm">{collection.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="rounded-full">
                {colRecords.length} {colRecords.length === 1 ? "record" : "records"}
              </Badge>
              <Badge variant="outline" className="text-primary border-primary/40 rounded-full text-xs">
                Base Sepolia
              </Badge>
            </div>
          </div>

          <Button
            className="shrink-0"
            onClick={() => navigate("/doctor/create-record")}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Record
          </Button>
        </div>
      </div>

      {/* Records */}
      {colRecords.length === 0 ? (
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">No records yet</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                This collection is empty. Create a medical record and assign it to{" "}
                <strong>{collection.name}</strong> to get started.
              </p>
            </div>
            <Button onClick={() => navigate("/doctor/create-record")}>
              <Plus className="h-4 w-4 mr-2" /> Create Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colRecords.map((rec) => (
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
                  <Badge className="absolute top-3 right-3 bg-success text-success-foreground text-xs">
                    Minted ✓
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-foreground leading-snug">{rec.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {truncateAddress(rec.patientWallet)}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-primary font-medium">View →</span>
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

export default CollectionDetail;
