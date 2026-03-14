export interface User {
  id: string;
  name: string;
  email: string;
  wallet?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  doctorId: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  title: string;
  description: string;
  doctorName: string;
  doctorId: string;
  patientWallet: string;
  imageUrl: string;
  tokenId: string;
  contractAddress: string;
  txHash: string;
  createdAt: string;
  status: "minted" | "pending";
  collectionId: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
}

export interface SharedAccess {
  hospitalId: string;
  hospitalName: string;
  grantedAt: string;
}

export interface ViewLog {
  id: string;
  hospitalName: string;
  hospitalWallet: string;
  viewedAt: string;
  signatureHash: string;
}

export interface SharedRecordForHospital {
  recordId: string;
  title: string;
  patientWallet: string;
  doctorName: string;
  sharedAt: string;
  signed: boolean;
}

export const MOCK_USER = {
  doctor: {
    id: "doc_001",
    name: "Dr. Sarah Johnson",
    email: "sarah@vaultmed.io",
  },
  patient: {
    id: "pat_001",
    name: "Alex Rivera",
    email: "alex@vaultmed.io",
    wallet: "0x742d35Cc6634C0532925a3b8D4C9fD2C68f8E123",
  },
  hospital: {
    id: "hosp_001",
    name: "City General Hospital",
    email: "admin@citygeneral.io",
    wallet: "0x9876dcba5432dcba9876dcba5432dcba9876dcba",
  },
};

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col_001",
    name: "Routine Checkups",
    description: "Annual and routine diagnostic records",
    doctorId: "doc_001",
    createdAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "col_002",
    name: "Cardiac Monitoring",
    description: "All cardiology-related reports and ECGs",
    doctorId: "doc_001",
    createdAt: "2026-03-05T09:00:00Z",
  },
];

export const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: "rec_001",
    title: "Blood Test Results",
    description:
      "Complete blood count and metabolic panel. All values within normal range. Hemoglobin: 14.2 g/dL, WBC: 7,500/μL, Platelets: 230,000/μL.",
    doctorName: "Dr. Sarah Johnson",
    doctorId: "doc_001",
    patientWallet: "0x742d35Cc6634C0532925a3b8D4C9fD2C68f8E123",
    imageUrl: "https://placehold.co/600x400/dbeafe/1d4ed8?text=Blood+Test",
    tokenId: "1042",
    contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    txHash:
      "0xabc123def456789abc123def456789abc123def456789abc123def456789abc1",
    createdAt: "2026-03-10T09:30:00Z",
    status: "minted",
    collectionId: "col_001",
  },
  {
    id: "rec_002",
    title: "Chest X-Ray",
    description:
      "PA and lateral chest X-ray. Lungs clear bilaterally. No pneumothorax or pleural effusion. Heart size normal.",
    doctorName: "Dr. Sarah Johnson",
    doctorId: "doc_001",
    patientWallet: "0x742d35Cc6634C0532925a3b8D4C9fD2C68f8E123",
    imageUrl: "https://placehold.co/600x400/dcfce7/166534?text=X-Ray",
    tokenId: "1043",
    contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    txHash:
      "0xdef456abc789def456abc789def456abc789def456abc789def456abc789def4",
    createdAt: "2026-03-08T14:15:00Z",
    status: "minted",
    collectionId: "col_001",
  },
  {
    id: "rec_003",
    title: "Cardiology Report",
    description:
      "ECG and echocardiogram results. Normal sinus rhythm. Ejection fraction 62%. No structural abnormalities detected.",
    doctorName: "Dr. Sarah Johnson",
    doctorId: "doc_001",
    patientWallet: "0x742d35Cc6634C0532925a3b8D4C9fD2C68f8E123",
    imageUrl: "https://placehold.co/600x400/fef3c7/92400e?text=Cardiology",
    tokenId: "1044",
    contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    txHash:
      "0xghi789jkl012ghi789jkl012ghi789jkl012ghi789jkl012ghi789jkl012ghi7",
    createdAt: "2026-03-05T11:00:00Z",
    status: "minted",
    collectionId: "col_002",
  },
];

export const MOCK_HOSPITALS: Hospital[] = [
  { id: "hosp_001", name: "City General Hospital", city: "New York" },
  { id: "hosp_002", name: "St. Mary's Medical Center", city: "Chicago" },
  { id: "hosp_003", name: "Riverside Health System", city: "Los Angeles" },
  { id: "hosp_004", name: "Northside Medical Institute", city: "Houston" },
  { id: "hosp_005", name: "Lakewood Community Hospital", city: "Seattle" },
];

export const MOCK_SHARED_WITH: Record<string, SharedAccess[]> = {
  rec_001: [
    {
      hospitalId: "hosp_001",
      hospitalName: "City General Hospital",
      grantedAt: "2026-03-11T10:00:00Z",
    },
  ],
  rec_002: [],
  rec_003: [],
};

export const MOCK_VIEW_LOGS: Record<string, ViewLog[]> = {
  rec_001: [
    {
      id: "view_001",
      hospitalName: "City General Hospital",
      hospitalWallet: "0x9876dcba5432dcba9876dcba5432dcba9876dcba",
      viewedAt: "2026-03-12T14:22:00Z",
      signatureHash: "0xsig123abc456def789sig123abc456def789",
    },
  ],
  rec_002: [],
  rec_003: [],
};

export const MOCK_SHARED_RECORDS_FOR_HOSPITAL: SharedRecordForHospital[] = [
  {
    recordId: "rec_001",
    title: "Blood Test Results",
    patientWallet: "0x742d35Cc6634C0532925a3b8D4C9fD2C68f8E123",
    doctorName: "Dr. Sarah Johnson",
    sharedAt: "2026-03-11T10:00:00Z",
    signed: false,
  },
];

export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function simulateDelay(ms: number = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
