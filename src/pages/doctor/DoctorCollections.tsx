import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Plus, CalendarDays, ArrowRight, FileText } from "lucide-react";
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

  const newCollectionDialog = (
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
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Collections</h1>
          <Badge variant="secondary" className="rounded-full px-3 text-sm">
            {doctorCollections.length}{" "}
            {doctorCollections.length === 1 ? "collection" : "collections"}
          </Badge>
        </div>
        {newCollectionDialog}
      </div>

      {doctorCollections.length === 0 ? (
        /* Empty state — 2-step illustrated guide */
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0">
              {[
                {
                  icon: FolderOpen,
                  label: "Create Collection",
                  sub: "Name and group your records",
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  icon: FileText,
                  label: "Add Records",
                  sub: "Mint records into the collection",
                  color: "text-success",
                  bg: "bg-success/10",
                },
              ].map((step, i) => (
                <div key={step.label} className="flex sm:flex-row items-center gap-0">
                  <div className="flex flex-col items-center text-center px-6">
                    <div
                      className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mb-3`}
                    >
                      <step.icon className={`h-7 w-7 ${step.color}`} />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{step.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.sub}</p>
                  </div>
                  {i < 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Collections help you organize patient records by type — like "Lab Results" or
              "Cardiology Reports".
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Create First Collection
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctorCollections.map((col, index) => {
            const count = records.filter((r) => r.collectionId === col.id).length;
            return (
              <Card
                key={col.id}
                className="bg-card border border-border shadow-sm rounded-xl hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Gradient header area */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border px-6 py-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <FolderOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-lg leading-tight truncate">
                      {col.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs rounded-full">
                        {count} {count === 1 ? "record" : "records"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <CardContent className="p-5 space-y-4">
                  {col.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {col.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    Created {new Date(col.createdAt).toLocaleDateString()}
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate(`/doctor/collection/${col.id}`)}
                  >
                    View Records <ArrowRight className="h-4 w-4 ml-1" />
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
