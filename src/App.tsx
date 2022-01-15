import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { ExternalProvider } from "@ethersproject/providers";

enum WalletState {
  Loading,
  Loaded,
  NotFound,
}

function App() {
  const [address, setAddress] = useState("");
  const [walletState, setWalletState] = useState(WalletState.Loading);

  useEffect(() => {
    const getWallet = async () => {
      try {
        const ethereum = (await detectEthereumProvider()) as ExternalProvider;
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const address = await provider.getSigner().getAddress();
        setAddress(address);
        setWalletState(WalletState.Loaded);
      } catch (err) {
        setWalletState(WalletState.NotFound);
      }
    };

    getWallet();
  });

  return (
    <div className="App">
      {
        {
          [WalletState.NotFound]: <p>No wallet detected</p>,
          [WalletState.Loaded]: (
            <p>
              <strong>Wallet address:</strong> {address}
            </p>
          ),
          [WalletState.Loading]: <p>Loading wallet..</p>,
        }[walletState]
      }
    </div>
  );
}

export default App;
