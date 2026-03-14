import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useCollections } from "@/context/CollectionsContext";
import { simulateDelay } from "@/mock/data";
import { toast } from "sonner";

const DoctorCollections = () => {
  const { user } = useAuth();
  const { collections, records, addCollection } = useCollections();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    simulateDelay(600).then(() => setLoading(false));
  }, []);

  const doctorCollections = collections.filter((c) => c.doctorId === user?.id);

  const handleCreate = () => {
    if (!name.trim()) return;
    addCollection(name, desc, user?.id || "");
    toast.success("Collection created!");
    setName("");
    setDesc("");
    setDialogOpen(false);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          My Collections
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Collection name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Describe this collection..."
                  rows={3}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={!name.trim()}
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {doctorCollections.length === 0 ? (
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              No collections yet. Create your first one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctorCollections.map((col) => {
            const count = records.filter(
              (r) => r.collectionId === col.id,
            ).length;
            return (
              <Card
                key={col.id}
                className="bg-card border border-border shadow-sm rounded-xl hover:shadow-md transition-all"
              >
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">
                    {col.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {col.description}
                  </p>
                  <Badge variant="secondary">{count} records</Badge>
                  <Button
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={() => navigate(`/doctor/collection/${col.id}`)}
                  >
                    View Records →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorCollections;
