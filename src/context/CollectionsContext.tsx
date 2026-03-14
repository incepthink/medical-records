import React, { createContext, useContext, useState, useCallback } from "react";
import {
  MOCK_COLLECTIONS,
  MOCK_RECORDS,
  MOCK_SHARED_WITH,
  MOCK_VIEW_LOGS,
  MOCK_SHARED_RECORDS_FOR_HOSPITAL,
  Collection,
  MedicalRecord,
  SharedAccess,
  ViewLog,
  SharedRecordForHospital,
} from "@/mock/data";

interface CollectionsState {
  collections: Collection[];
  records: MedicalRecord[];
  sharedWith: Record<string, SharedAccess[]>;
  viewLogs: Record<string, ViewLog[]>;
  sharedRecordsForHospital: SharedRecordForHospital[];
  addCollection: (
    name: string,
    description: string,
    doctorId: string,
  ) => Collection;
  addRecord: (
    record: Omit<
      MedicalRecord,
      "id" | "txHash" | "tokenId" | "contractAddress" | "status" | "createdAt"
    >,
  ) => MedicalRecord;
  grantAccess: (
    recordId: string,
    hospitalId: string,
    hospitalName: string,
  ) => void;
  revokeAccess: (recordId: string, hospitalId: string) => void;
  logView: (
    recordId: string,
    hospitalId: string,
    hospitalName: string,
    hospitalWallet: string,
    signatureHash: string,
  ) => void;
  markHospitalRecordSigned: (recordId: string) => void;
}

const CollectionsContext = createContext<CollectionsState>(null!);

export const useCollections = () => useContext(CollectionsContext);

export const CollectionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collections, setCollections] = useState<Collection[]>([
    ...MOCK_COLLECTIONS,
  ]);
  const [records, setRecords] = useState<MedicalRecord[]>([...MOCK_RECORDS]);
  const [sharedWith, setSharedWith] = useState<Record<string, SharedAccess[]>>({
    ...MOCK_SHARED_WITH,
  });
  const [viewLogs, setViewLogs] = useState<Record<string, ViewLog[]>>({
    ...MOCK_VIEW_LOGS,
  });
  const [sharedRecordsForHospital, setSharedRecordsForHospital] = useState<
    SharedRecordForHospital[]
  >([...MOCK_SHARED_RECORDS_FOR_HOSPITAL]);

  const addCollection = useCallback(
    (name: string, description: string, doctorId: string): Collection => {
      const newCol: Collection = {
        id: `col_${Date.now()}`,
        name,
        description,
        doctorId,
        createdAt: new Date().toISOString(),
      };
      setCollections((prev) => [...prev, newCol]);
      return newCol;
    },
    [],
  );

  const addRecord = useCallback(
    (
      record: Omit<
        MedicalRecord,
        "id" | "txHash" | "tokenId" | "contractAddress" | "status" | "createdAt"
      >,
    ): MedicalRecord => {
      const newRec: MedicalRecord = {
        ...record,
        id: `rec_${Date.now()}`,
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        tokenId: String(1044 + records.length),
        contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
        status: "minted",
        createdAt: new Date().toISOString(),
      };
      setRecords((prev) => [...prev, newRec]);
      setSharedWith((prev) => ({ ...prev, [newRec.id]: [] }));
      setViewLogs((prev) => ({ ...prev, [newRec.id]: [] }));
      return newRec;
    },
    [records.length],
  );

  const grantAccess = useCallback(
    (recordId: string, hospitalId: string, hospitalName: string) => {
      setSharedWith((prev) => ({
        ...prev,
        [recordId]: [
          ...(prev[recordId] || []),
          { hospitalId, hospitalName, grantedAt: new Date().toISOString() },
        ],
      }));
      // Also add to hospital shared records
      const rec = records.find((r) => r.id === recordId);
      if (rec) {
        setSharedRecordsForHospital((prev) => [
          ...prev,
          {
            recordId,
            title: rec.title,
            patientWallet: rec.patientWallet,
            doctorName: rec.doctorName,
            sharedAt: new Date().toISOString(),
            signed: false,
          },
        ]);
      }
    },
    [records],
  );

  const revokeAccess = useCallback((recordId: string, hospitalId: string) => {
    setSharedWith((prev) => ({
      ...prev,
      [recordId]: (prev[recordId] || []).filter(
        (s) => s.hospitalId !== hospitalId,
      ),
    }));
  }, []);

  const logView = useCallback(
    (
      recordId: string,
      hospitalId: string,
      hospitalName: string,
      hospitalWallet: string,
      signatureHash: string,
    ) => {
      setViewLogs((prev) => ({
        ...prev,
        [recordId]: [
          ...(prev[recordId] || []),
          {
            id: `view_${Date.now()}`,
            hospitalName,
            hospitalWallet,
            viewedAt: new Date().toISOString(),
            signatureHash,
          },
        ],
      }));
    },
    [],
  );

  const markHospitalRecordSigned = useCallback((recordId: string) => {
    setSharedRecordsForHospital((prev) =>
      prev.map((r) => (r.recordId === recordId ? { ...r, signed: true } : r)),
    );
  }, []);

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        records,
        sharedWith,
        viewLogs,
        sharedRecordsForHospital,
        addCollection,
        addRecord,
        grantAccess,
        revokeAccess,
        logView,
        markHospitalRecordSigned,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
};
