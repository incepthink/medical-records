import { MidnightConnectButton } from "@/components/MidnightConnectButton";
import { Shield, Lock, User, Eye } from "lucide-react";

const trustFeatures = [
  { icon: Lock, label: "Privacy-preserving zero-knowledge proofs" },
  { icon: User, label: "Patient-owned medical records as NFTs" },
  { icon: Eye, label: "Full audit trail of every record access" },
];

export function WalletGate() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 bg-card border border-border rounded-2xl p-8 sm:p-12 max-w-md w-full text-center shadow-lg animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/20 flex items-center justify-center">
            <Shield size={40} className="text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-gradient">
          Connect Your Wallet
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          Connect your Lace or 1AM Midnight Wallet to continue with VaultMed — a
          blockchain-powered platform for secure, patient-owned medical records
          on Midnight.
        </p>

        <div className="flex flex-col items-center gap-4 w-full mb-8">
          <MidnightConnectButton walletType="oneam" />
          <span className="text-xs text-muted-foreground">or</span>
          <MidnightConnectButton walletType="lace" />
        </div>

        <div className="border-t border-border pt-6 flex flex-col gap-3">
          {trustFeatures.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-left">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
