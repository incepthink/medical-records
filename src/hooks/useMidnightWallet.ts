import { useState, useEffect, useCallback } from "react";
import type { MidnightConnectedAPI, MidnightNetwork } from "@/lib/midnight/types";
import { detectMidnightWallet, detectLaceWallet } from "@/lib/midnight/detectWallet";
import { httpClientProvingProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";

export interface MidnightWalletState {
  isOneamInstalled: boolean;
  isLaceInstalled: boolean;
  isInstalled: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  connectedWallet: "oneam" | "lace" | null;
  address: string | null;
  network: MidnightNetwork | null;
  connectedAPI: MidnightConnectedAPI | null;
  error: string | null;
  connect: () => Promise<void>;
  connectLace: () => Promise<void>;
  disconnect: () => void;
}

const NETWORK: MidnightNetwork = "preprod";

export function useMidnightWallet(): MidnightWalletState {
  const [isOneamInstalled, setIsOneamInstalled] = useState(false);
  const [isLaceInstalled, setIsLaceInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectedWallet, setConnectedWallet] = useState<"oneam" | "lace" | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<MidnightNetwork | null>(null);
  const [connectedAPI, setConnectedAPI] = useState<MidnightConnectedAPI | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function detect() {
      setIsConnecting(true);
      const [oneam] = await Promise.all([
        detectMidnightWallet(),
      ]);
      const lace = detectLaceWallet();
      if (cancelled) return;
      setIsOneamInstalled(oneam !== null);
      setIsLaceInstalled(lace !== null);
      setIsConnecting(false);
    }
    detect();
    return () => { cancelled = true; };
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const walletAPI = await detectMidnightWallet();
      if (!walletAPI) {
        setError("1AM wallet not found. Please install the extension.");
        return;
      }
      const api = await walletAPI.connect(NETWORK);
      const { shieldedAddress } = await api.getShieldedAddresses();
      const tagged = Object.assign(api, { walletType: "oneam" as const });
      setConnectedAPI(tagged as unknown as MidnightConnectedAPI);
      setAddress(shieldedAddress);
      setNetwork(NETWORK);
      setConnectedWallet("oneam");
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect 1AM wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectLace = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const walletObj = detectLaceWallet();
      if (!walletObj) {
        setError("Lace wallet not found. Please install the extension.");
        return;
      }
      const api = await walletObj.connect(NETWORK);
      const { shieldedAddress } = await api.getShieldedAddresses();

      // Lace does not yet implement getProvingProvider (confirmed 2026-05-11 by Midnight moderator).
      // Patch it to delegate to an HTTP proof server using proverServerUri from wallet config.
      if (typeof (api as any).getProvingProvider !== "function") {
        const { proverServerUri } = await api.getConfiguration();
        (api as any).getProvingProvider = (keyMaterialProvider: any) =>
          Promise.resolve(
            httpClientProvingProvider(
              proverServerUri || "http://localhost:6300",
              keyMaterialProvider
            )
          );
      }

      const tagged = Object.assign(api, { walletType: "lace" as const });
      setConnectedAPI(tagged as unknown as MidnightConnectedAPI);
      setAddress(shieldedAddress);
      setNetwork(NETWORK);
      setConnectedWallet("lace");
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect Lace wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setConnectedAPI(null);
    setAddress(null);
    setNetwork(null);
    setConnectedWallet(null);
    setError(null);
  }, []);

  return {
    isOneamInstalled,
    isLaceInstalled,
    isInstalled: isOneamInstalled || isLaceInstalled,
    isConnected,
    isConnecting,
    connectedWallet,
    address,
    network,
    connectedAPI,
    error,
    connect,
    connectLace,
    disconnect,
  };
}
