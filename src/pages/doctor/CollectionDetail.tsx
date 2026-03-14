import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileText, FolderOpen } from "lucide-react";
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
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection)
    return <p className="text-muted-foreground">Collection not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate("/doctor/collections")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Collections
      </Button>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {collection.name}
        </h1>
        <p className="text-muted-foreground mt-1">{collection.description}</p>
      </div>

      {colRecords.length === 0 ? (
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              No records in this collection yet.
            </p>
            <Button onClick={() => navigate("/doctor/create-record")}>
              Create Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colRecords.map((rec) => (
            <Card
              key={rec.id}
              className="bg-card border border-border shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/patient/record/${rec.id}`)}
            >
              <CardContent className="p-0">
                <img
                  src={rec.imageUrl}
                  alt={rec.title}
                  className="w-full h-40 object-cover rounded-t-xl"
                />
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-foreground">{rec.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {truncateAddress(rec.patientWallet)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                    <Badge className="bg-success text-success-foreground">
                      Minted
                    </Badge>
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
