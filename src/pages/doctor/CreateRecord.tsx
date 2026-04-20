import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
  X,
  Eye,
  Wallet,
  Hash,
  FolderOpen,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { useCollections } from "@/context/CollectionsContext";
import { truncateAddress } from "@/mock/data";
import { toast } from "sonner";

const CreateRecord = () => {
  const { user } = useAuth();
  const { collections, addCollection, addRecord } = useCollections();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [patientWallet, setPatientWallet] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [minting, setMinting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mintedTxHash, setMintedTxHash] = useState("");

  const doctorCollections = collections.filter((c) => c.doctorId === user?.id);
  const isNewCollection = selectedCollection === "__new__";

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Record title is required";
    if (!description.trim()) errs.description = "Description is required";
    if (!patientWallet.trim())
      errs.patientWallet = "Patient wallet address is required";
    else if (!patientWallet.startsWith("0x") || patientWallet.length < 10)
      errs.patientWallet = "Enter a valid wallet address";
    if (!selectedCollection) errs.collection = "Select or create a collection";
    if (isNewCollection && !newColName.trim())
      errs.newColName = "Collection name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setMinting(true);
    let collectionId = selectedCollection;

    if (isNewCollection) {
      const newCol = addCollection(newColName, newColDesc, user?.id || "");
      collectionId = newCol.id;
    }

    await new Promise((r) => setTimeout(r, 2000));

    const rec = addRecord({
      title,
      description,
      doctorName: user?.name || "",
      doctorId: user?.id || "",
      patientWallet,
      imageUrl:
        filePreview ||
        `https://placehold.co/600x400/dbeafe/1d4ed8?text=${encodeURIComponent(title)}`,
      collectionId,
    });

    setMintedTxHash(rec.txHash);
    setMinting(false);
    setSuccess(true);
    toast.success("Record minted successfully!");
  };

  const previewCollectionName =
    isNewCollection && newColName
      ? `${newColName} (new)`
      : doctorCollections.find((c) => c.id === selectedCollection)?.name ?? null;

  if (success) {
    return (
      <div className="max-w-3xl mx-auto animate-scale-in space-y-6">
        {/* Success message */}
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">
                Record Minted Successfully!
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                The record has been anchored on Base Sepolia and sent to the
                patient's wallet.
              </p>
              <a
                href={`https://sepolia.basescan.org/tx/${mintedTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline font-mono break-all mt-2 inline-block"
              >
                Tx: {mintedTxHash.slice(0, 20)}...{mintedTxHash.slice(-8)}
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Record preview */}
          <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
            {filePreview && (
              <img
                src={filePreview}
                alt={title}
                className="w-full h-40 object-cover"
              />
            )}
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground font-mono">
                {truncateAddress(patientWallet)}
              </p>
              <Badge className="bg-success text-success-foreground">
                Minted ✓
              </Badge>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 justify-center">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSuccess(false);
                setTitle("");
                setDescription("");
                setPatientWallet("");
                setFile(null);
                setFilePreview(null);
                setSelectedCollection("");
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Create Another Record
            </Button>
            <Button
              className="w-full"
              onClick={() => navigate("/doctor/dashboard")}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/doctor/collections")}
            >
              View Collections
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (minting) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-primary/10" />
              <Loader2 className="h-12 w-12 text-primary animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Minting your record on Base Sepolia...
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while the transaction is being processed.
              </p>
            </div>
            <div className="flex gap-6">
              {["Validating", "Signing", "Broadcasting"].map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      i === 0
                        ? "bg-primary animate-pulse"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Create Medical Record
        </h1>
        <p className="text-muted-foreground mt-1">
          This record will be minted as an NFT to the patient's wallet on Base
          Sepolia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form — 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardContent className="p-6 space-y-6">
              {/* Section 1: Record Details */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Record Details
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Record Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Blood Test Results"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea
                      id="desc"
                      placeholder="Describe the medical record..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Patient Wallet */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="wallet">Patient Wallet Address</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The patient's Ethereum wallet address on Base Sepolia
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="wallet"
                      placeholder="0x..."
                      value={patientWallet}
                      onChange={(e) => setPatientWallet(e.target.value)}
                      className="font-mono"
                    />
                    {errors.patientWallet && (
                      <p className="text-sm text-destructive">
                        {errors.patientWallet}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Attachment */}
              <div>
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className="w-7 h-7 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-warning">2</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Attachment
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="preview"
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <FileText className="h-10 w-10 text-muted-foreground" />
                      )}
                      <p className="text-sm text-foreground font-medium">
                        {file.name}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setFilePreview(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Images & PDFs up to 10MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                />
              </div>

              {/* Section 3: Collection */}
              <div>
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-success">3</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Collection
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-2">
                  <Label>Collection</Label>
                  <Select
                    value={selectedCollection}
                    onValueChange={setSelectedCollection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorCollections.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__">
                        ＋ Create new collection…
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.collection && (
                    <p className="text-sm text-destructive">
                      {errors.collection}
                    </p>
                  )}

                  {isNewCollection && (
                    <div className="mt-3 p-4 bg-muted rounded-xl space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="newcol">Collection Name</Label>
                        <Input
                          id="newcol"
                          value={newColName}
                          onChange={(e) => setNewColName(e.target.value)}
                          placeholder="e.g. Lab Results"
                        />
                        {errors.newColName && (
                          <p className="text-sm text-destructive">
                            {errors.newColName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newcoldesc">
                          Description (optional)
                        </Label>
                        <Textarea
                          id="newcoldesc"
                          value={newColDesc}
                          onChange={(e) => setNewColDesc(e.target.value)}
                          placeholder="Describe this collection..."
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleSubmit}>
                Mint Record as NFT
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Transaction fees are covered by the platform.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview — 1/3 width */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Live Preview
              </span>
            </div>

            <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
              <div className="relative bg-muted h-40">
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <FileText className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">
                      No image uploaded
                    </p>
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-success text-success-foreground text-xs">
                  NFT
                </Badge>
              </div>

              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground leading-snug min-h-[1.5rem]">
                  {title || (
                    <span className="text-muted-foreground italic text-sm font-normal">
                      Record title...
                    </span>
                  )}
                </h3>

                <div className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground font-mono truncate">
                    {patientWallet
                      ? truncateAddress(patientWallet)
                      : "No wallet entered"}
                  </span>
                </div>

                {previewCollectionName && (
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {previewCollectionName}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-border">
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/40 text-xs gap-1"
                  >
                    <Hash className="h-3 w-3" /> Base Sepolia
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground text-center">
              This is how the record card will appear after minting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRecord;
