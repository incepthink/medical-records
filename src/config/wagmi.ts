import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "VaultMed",
  projectId: "b1e6285fa75a8c3e8b13a0594863a8df",
  chains: [baseSepolia],
  ssr: false,
});
