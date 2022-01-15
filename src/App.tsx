import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";

function App() {
  const [address, setAddress] = useState("");

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      return;
    }

    const getWallet = async () => {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      const address = await provider.getSigner().getAddress();
      setAddress(address);
    };

    getWallet();
  });

  return (
    <div className="App">
      {address ? (
        <p>
          <strong>Wallet address:</strong> {address}
        </p>
      ) : (
        <p>Fetching wallet..</p>
      )}{" "}
    </div>
  );
}

export default App;
