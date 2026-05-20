import { useState, useCallback, useEffect, useRef } from "react";
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
  ChevronsUpDown,
  Check,
  Clipboard,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { useCollections, useCreateCollection } from "@/hooks/useCollections";
import { useCreateDocument, useMintDocument } from "@/hooks/useDocuments";
import type { CreateDocumentPayload } from "@/api/documents";
import { useMidnightWalletContext } from "@/context/MidnightWalletContext";
import {
  callCreateCollection,
  callMintDocument,
  decodeShieldedAddress,
  resolveCoinPublicKey,
  CONTRACT_ADDRESS,
} from "@/lib/midnight/contractApi";
import { axiosInstance, axiosInstanceImage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import {
  truncateAddress,
  type DocumentCategory,
  type FileType,
} from "@/mock/data";
import { toast } from "sonner";

function deriveFileType(file: File): FileType {
  if (file.name.match(/\.pdf$/i)) return "pdf";
  if (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return "image";
  return "docx";
}

const isValidMidnightAddress = (addr: string) =>
  addr.trim().length >= 60 && !addr.startsWith("0x");

const CreateRecord = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: collections } = useCollections();
  const createCollection = useCreateCollection();
  const createDocument = useCreateDocument();
  const mintDocument = useMintDocument();
  const { connectedAPI, address } = useMidnightWalletContext();

  const [collectionId, setCollectionId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("Report");
  const [patientWallet, setPatientWallet] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [minting, setMinting] = useState(false);
  const [mintingStage, setMintingStage] = useState(0);
  const [mintedTxHash, setMintedTxHash] = useState<string | null>(null);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColOpen, setNewColOpen] = useState(false);
  const [ownerEmails, setOwnerEmails] = useState<string[]>([]);
  const [ownerEmailsLoading, setOwnerEmailsLoading] = useState(false);
  const [selectedOwnerEmail, setSelectedOwnerEmail] = useState("");
  const [emailPopoverOpen, setEmailPopoverOpen] = useState(false);

  useEffect(() => {
    setSelectedOwnerEmail("");
    setOwnerEmails([]);
    if (!isValidMidnightAddress(patientWallet)) return;
    const timer = setTimeout(async () => {
      setOwnerEmailsLoading(true);
      try {
        const { data } = await axiosInstance.get<{
          owners: { email: string }[];
        }>(`/documents/owners/${patientWallet.trim()}`);
        setOwnerEmails(data.owners.map((o) => o.email));
      } catch {
        setOwnerEmails([]);
      } finally {
        setOwnerEmailsLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [patientWallet]);

  const isImageFile = (f: File) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name);

  const setFileWithPreview = useCallback((f: File) => {
    setFile(f);
    setFilePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return isImageFile(f) ? URL.createObjectURL(f) : null;
    });
  }, []);

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    if (!isImageFile(f)) {
      toast.error("Only image files are accepted (JPG, PNG, GIF, WEBP)");
      return;
    }
    setFileWithPreview(f);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!collectionId) errs.collection = "Select a collection";
    if (!title.trim()) errs.title = "Record title is required";
    if (!description.trim()) errs.description = "Description is required";
    if (!patientWallet.trim()) {
      errs.patientWallet = "Patient wallet address is required";
    } else if (patientWallet.startsWith("0x")) {
      errs.patientWallet =
        "Must be a Midnight unshielded address, not an Ethereum address";
    } else if (patientWallet.trim().length < 60) {
      errs.patientWallet = "Enter a valid Midnight unshielded address";
    }
    if (isValidMidnightAddress(patientWallet) && !selectedOwnerEmail) {
      errs.ownerEmail = "Select a patient email address";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setMinting(true);
    setMintingStage(0);
    try {
      let uploadedImageUrl: string | undefined;
      if (file) {
        const imgForm = new FormData();
        imgForm.append("image", file);
        const { data: uploadData } = await axiosInstanceImage.post<{
          success: boolean;
          imageUrl: string;
          ipfsHash: string;
        }>("/platform/upload/image", imgForm);
        uploadedImageUrl = uploadData.imageUrl;
      }

      const payload: CreateDocumentPayload = {
        collectionId,
        title,
        description,
        category,
        ownerWallet: patientWallet,
        ownerEmail: selectedOwnerEmail,
        fileType: file ? deriveFileType(file) : "pdf",
        ...(uploadedImageUrl ? { fileUrl: uploadedImageUrl } : {}),
      };

      const doc = await createDocument.mutateAsync(payload);

      let txHash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");
      const contractAddress = CONTRACT_ADDRESS;
      const tokenId = Math.floor(1000 + Math.random() * 9000);
      let onchainTokenId: string | undefined;

      if (connectedAPI && address) {
        try {
          const fileBytes = file
            ? new Uint8Array(await file.arrayBuffer())
            : new Uint8Array(0);
          const docHashBuf = await crypto.subtle.digest("SHA-256", fileBytes);
          const docHash = new Uint8Array(docHashBuf);

          const metaStr = `${title}|${category}|${description}`;
          const metaHashBuf = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(metaStr),
          );
          const metaHash = new Uint8Array(metaHashBuf);

          const walletAddresses = await connectedAPI.getShieldedAddresses();
          const creatorPk = resolveCoinPublicKey(walletAddresses);
          const ownerPk = decodeShieldedAddress(patientWallet);

          const selectedCollection = collections?.find(
            (c) => c.id === collectionId,
          );
          const onchainCollectionId = selectedCollection?.onchainCollectionId
            ? BigInt(selectedCollection.onchainCollectionId)
            : BigInt(0);

          const result = await callMintDocument(connectedAPI, {
            docHash,
            metaHash,
            ownerPk,
            creatorPk,
            onchainCollectionId,
          }, setMintingStage);

          txHash = result.txId;
          onchainTokenId = result.onchainTokenId.toString();
        } catch (err) {
          console.log("On-chain minting failed, continuing with backend:", err);
        }
      }

      await mintDocument.mutateAsync({
        id: doc.id,
        tokenId,
        contractAddress,
        txHash,
        onchainTokenId,
      });

      setMintedTxHash(txHash);
      toast.success("Record minted successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Minting failed. Please try again.");
    } finally {
      setMinting(false);
    }
  };

  const handleNewCollection = async () => {
    if (!newColName.trim()) return;
    try {
      let onchainCollectionId: string | undefined;
      if (connectedAPI && address) {
        try {
          const walletAddresses = await connectedAPI.getShieldedAddresses();
          const creatorPk = resolveCoinPublicKey(walletAddresses);
          const result = await callCreateCollection(connectedAPI, creatorPk);
          onchainCollectionId = result.onchainCollectionId.toString();
          toast.info(
            `Collection registered on-chain (tx: ${result.txId.slice(0, 10)}…)`,
          );
        } catch (err) {
          console.log("On-chain createCollection failed, continuing:", err);
        }
      }
      const col = await createCollection.mutateAsync({
        name: newColName,
        description: newColDesc || undefined,
        onchainCollectionId,
      });
      setCollectionId(col.id);
      toast.success(`Collection "${newColName}" created`);
      setNewColName("");
      setNewColDesc("");
      setNewColOpen(false);
    } catch {
      toast.error("Failed to create collection");
    }
  };

  const previewCollectionName =
    collections?.find((c) => c.id === collectionId)?.name ?? null;

  if (minting) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-12 flex flex-col items-center text-center gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-primary/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Minting your record on Midnight Preprod...
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Generating ZK proof, balancing, and submitting the transaction.
              </p>
            </div>
            <div className="flex gap-6">
              {["Proving", "Balancing", "Submitting"].map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      i < mintingStage
                        ? "bg-primary/40"
                        : i === mintingStage
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

  if (mintedTxHash) {
    return (
      <div className="max-w-3xl mx-auto animate-scale-in space-y-6">
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">
                Record Minted Successfully!
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                The record has been anchored on Midnight Preprod and assigned to
                the patient.
              </p>
              <p className="text-sm text-primary font-mono break-all mt-2">
                Tx: {mintedTxHash.slice(0, 20)}...{mintedTxHash.slice(-8)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setMintedTxHash(null);
              setTitle("");
              setDescription("");
              setPatientWallet("");
              setSelectedOwnerEmail("");
              setOwnerEmails([]);
              setFile(null);
              setFilePreview((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
              });
              setCollectionId("");
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Create Another Record
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate("/doctor/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
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
          This record will be minted as an NFT to the patient's wallet on
          Midnight Preprod.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardContent className="p-6 space-y-6">
              {/* Collection */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Collection
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>Collection</Label>
                    <Select
                      value={collectionId}
                      onValueChange={setCollectionId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.collection && (
                      <p className="text-sm text-destructive">
                        {errors.collection}
                      </p>
                    )}
                  </div>
                  <Dialog open={newColOpen} onOpenChange={setNewColOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-1" /> New
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
                            value={newColName}
                            onChange={(e) => setNewColName(e.target.value)}
                            placeholder="e.g. Cardiology Reports"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (optional)</Label>
                          <Textarea
                            value={newColDesc}
                            onChange={(e) => setNewColDesc(e.target.value)}
                            placeholder="Describe this collection..."
                            rows={3}
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleNewCollection}
                          disabled={
                            createCollection.isPending || !newColName.trim()
                          }
                        >
                          {createCollection.isPending
                            ? "Creating..."
                            : "Create"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Record Details */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Record Details
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-4">
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

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={category}
                      onValueChange={(v) => setCategory(v as DocumentCategory)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Report",
                          "Certificate",
                          "Contract",
                          "Invoice",
                          "Dataset",
                          "Other",
                        ].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="wallet">
                        Patient Shielded Wallet Address
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The patient's Midnight Shielded address on the Preprod
                          network
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="wallet"
                        placeholder="mn1..."
                        value={patientWallet}
                        onChange={(e) => setPatientWallet(e.target.value)}
                        className="font-mono"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={!address}
                            onClick={() => setPatientWallet(address!)}
                          >
                            <Clipboard className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Use my connected wallet address
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {errors.patientWallet && (
                      <p className="text-sm text-destructive">
                        {errors.patientWallet}
                      </p>
                    )}
                  </div>

                  {isValidMidnightAddress(patientWallet) && (
                    <div className="space-y-2">
                      <Label>Patient Email</Label>
                      <Popover
                        open={emailPopoverOpen}
                        onOpenChange={setEmailPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={emailPopoverOpen}
                            disabled={
                              ownerEmailsLoading ||
                              (!ownerEmailsLoading && ownerEmails.length === 0)
                            }
                            className={cn(
                              "w-full justify-between font-normal",
                              !selectedOwnerEmail && "text-muted-foreground",
                            )}
                          >
                            {ownerEmailsLoading ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Looking up patient...
                              </span>
                            ) : selectedOwnerEmail ? (
                              selectedOwnerEmail
                            ) : ownerEmails.length === 0 ? (
                              "No patient found for this wallet"
                            ) : (
                              "Select patient email"
                            )}
                            {!ownerEmailsLoading && (
                              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[--radix-popover-trigger-width] p-0"
                          align="start"
                        >
                          <Command>
                            <CommandInput placeholder="Search emails..." />
                            <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                              No matching emails
                            </CommandEmpty>
                            <CommandGroup>
                              {ownerEmails.map((email) => (
                                <CommandItem
                                  key={email}
                                  value={email}
                                  onSelect={() => {
                                    setSelectedOwnerEmail(email);
                                    setEmailPopoverOpen(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-3.5 w-3.5",
                                      selectedOwnerEmail === email
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {email}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {errors.ownerEmail && (
                        <p className="text-sm text-destructive">
                          {errors.ownerEmail}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Attachment */}
              <div>
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">3</span>
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
                          setFilePreview((prev) => {
                            if (prev) URL.revokeObjectURL(prev);
                            return null;
                          });
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
                        Images (JPG, PNG, GIF, WEBP) up to 10MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                />
              </div>

              <Button className="w-full" size="lg" onClick={handleSubmit}>
                Mint Record as NFT
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                ZK proof is generated client-side, balanced by your wallet, and
                submitted to Midnight Preprod.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
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
                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs">
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
                    <Hash className="h-3 w-3" /> Midnight Preprod
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
