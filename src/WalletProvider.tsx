import { ExternalProvider } from "@ethersproject/providers";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import React, {
  createContext,
  useContext,
  FunctionComponent,
  useEffect,
  useState,
} from "react";

interface WalletContextType {
  provider: ethers.providers.Web3Provider;
  address: string;
  isRinkeby: boolean;
}
const WalletContext = createContext<WalletContextType | null>(null);
export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: unknown;
}
const WalletProvider: FunctionComponent<WalletProviderProps> = (props) => {
  const [loaded, setLoaded] = useState(false);
  const [walletState, setWalletState] = useState<WalletContextType | null>(
    null
  );

  useEffect(() => {
    const getWallet = async () => {
      try {
        const ethereum = (await detectEthereumProvider()) as ExternalProvider;
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const address = await provider.getSigner().getAddress();
        const network = await provider.getNetwork();

        setWalletState({
          provider,
          address,
          isRinkeby: network.name === "rinkeby",
        });
      } finally {
        setLoaded(true);
      }
    };

    getWallet();
  }, []);

  if (!loaded) {
    return <React.Fragment />;
  }

  return (
    <WalletContext.Provider value={walletState}>
      {props.children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
