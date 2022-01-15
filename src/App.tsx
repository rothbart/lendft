import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { ExternalProvider } from "@ethersproject/providers";
import axios, { AxiosRequestConfig } from "axios";
import qs from "qs";

async function getNFTs(owner: string) {
  // https://docs.opensea.io/reference/getting-assets
  var config: AxiosRequestConfig = {
    method: "get",
    url: `https://api.opensea.io/api/v1/assets`,
    params: {
      owner,
      offset: 0,
      limit: 50,
    },
  };

  const res = await axios(config);

  const tokenData: any[] = res.data?.assets || [];

  return tokenData.map((tokenData) => ({
    name: tokenData?.name,
    id: tokenData?.id,
    image_url: tokenData?.image_thumbnail_url,
    permalink: tokenData?.permalink,
    contract_address: tokenData?.asset_contract?.address,
    type: tokenData?.asset_contract?.asset_contract_type,
  }));
}
type NFTList = Awaited<ReturnType<typeof getNFTs>>;

function renderNFTs(nfts: NFTList) {
  if (!nfts.length) {
    return <p>No NFTs found</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col" className="columnheader">
            Image
          </th>
          <th scope="col" className="columnheader">
            Name
          </th>
          <th scope="col" className="columnheader">
            Type
          </th>
          <th scope="col" className="columnheader">
            ID
          </th>
          <th scope="col" className="columnheader">
            Contract
          </th>
        </tr>
      </thead>
      <tbody>
        {nfts.map((nft) => {
          return (
            <tr>
              <th scope="row" className="cell">
                <img src={nft.image_url} alt="nft" />
              </th>
              <th scope="row" className="cell">
                <a href={nft.permalink} target="_newTab">
                  {nft.name}
                </a>
              </th>
              <td className="cell">{nft.type}</td>
              <td className="cell">{nft.id}</td>
              <td className="cell">{nft.contract_address}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

enum WalletState {
  Loading,
  Loaded,
  NotFound,
}

function App() {
  const [address, setAddress] = useState("");
  const [nfts, setNFTs] = useState<NFTList>([]);
  const [walletState, setWalletState] = useState(WalletState.Loading);

  const params = qs.parse(window.location.search, { ignoreQueryPrefix: true });

  useEffect(() => {
    const getWallet = async () => {
      try {
        const ethereum = (await detectEthereumProvider()) as ExternalProvider;
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const address = await provider.getSigner().getAddress();
        const nfts = await getNFTs((params.address as string) || address);

        setNFTs(nfts);
        setAddress(address);
        setWalletState(WalletState.Loaded);
      } catch (err) {
        setWalletState(WalletState.NotFound);
      }
    };

    getWallet();
  }, []);

  return (
    <div className="app">
      {
        {
          [WalletState.NotFound]: <p>No wallet detected</p>,
          [WalletState.Loaded]: renderNFTs(nfts),
          [WalletState.Loading]: <p>Loading wallet..</p>,
        }[walletState]
      }
    </div>
  );
}

export default App;
