// Midnight Wallet — Connect Button component
// Supports both Lace (walletType="lace") and 1AM (walletType="oneam", default).

import { useMidnightWalletContext } from "@/context/MidnightWalletContext";
import { Wallet, LogOut, Loader2 } from "lucide-react";

function truncateAddress(addr: string): string {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

interface MidnightConnectButtonProps {
  walletType?: "oneam" | "lace";
}

export function MidnightConnectButton({
  walletType = "oneam",
}: MidnightConnectButtonProps) {
  const {
    isOneamInstalled,
    isLaceInstalled,
    isConnected,
    isConnecting,
    connectedWallet,
    address,
    connect,
    connectLace,
    disconnect,
    error,
  } = useMidnightWalletContext();

  const isLace = walletType === "lace";
  const isInstalled = isLace ? isLaceInstalled : isOneamInstalled;
  const isThisWalletConnected = isConnected && connectedWallet === walletType;
  const walletLabel = isLace ? "Lace Wallet" : "1AM Wallet";
  const installHref = isLace ? "https://www.lace.io" : "https://1am.xyz";

  if (isConnecting && !isConnected && !isLace) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
      >
        <Loader2 size={14} className="animate-spin" />
        Detecting wallet…
      </button>
    );
  }

  if (!isInstalled) {
    return (
      <a
        href={installHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:text-foreground transition-colors border border-border"
      >
        <Wallet size={14} />
        Install {walletLabel}
      </a>
    );
  }

  if (isThisWalletConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="font-mono text-foreground">
            {truncateAddress(address)}
          </span>
          <span className="text-xs text-muted-foreground">preprod</span>
        </div>
        <button
          onClick={disconnect}
          title="Disconnect wallet"
          className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  const handleConnect = isLace ? connectLace : connect;
  const isThisConnecting = isConnecting && !isConnected;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleConnect}
        disabled={isThisConnecting}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isThisConnecting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Wallet size={14} />
        )}
        {isThisConnecting ? "Connecting…" : `Connect ${walletLabel}`}
      </button>
      {error && connectedWallet === null && (
        <span className="text-xs text-destructive text-center max-w-xs">
          {/not available|dapp connector|functionality may be disabled/i.test(error)
            ? "DApp connector is disabled in Lace. Open Lace → Settings → DApp Connector and enable it, then retry."
            : error}
        </span>
      )}
    </div>
  );
}
