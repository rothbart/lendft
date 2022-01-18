import React, { useEffect, useState } from "react";
import "./App.css";
import qs from "qs";
import { useWallet } from "./WalletProvider";
import { getNFTs, NFTList } from "./helpers";

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
            <tr key={nft.name}>
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

enum NFTState {
  Loading,
  Loaded,
  NotFound,
}

function App() {
  const wallet = useWallet();
  const [nfts, setNFTs] = useState<NFTList>([]);
  const [walletState, setWalletState] = useState(NFTState.Loading);

  const params = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  const addressOverride = params.address as string;

  useEffect(() => {
    const getNFTList = async () => {
      if (wallet) {
        const nfts = await getNFTs(
          addressOverride || wallet.address,
          wallet.isRinkeby
        );
        setNFTs(nfts);
        setWalletState(NFTState.Loaded);
      } else {
        setWalletState(NFTState.NotFound);
      }
    };

    getNFTList();
  }, [wallet, addressOverride]);

  return (
    <div className="app">
      {
        {
          [NFTState.NotFound]: <p>No wallet detected</p>,
          [NFTState.Loaded]: renderNFTs(nfts),
          [NFTState.Loading]: <p>Loading wallet..</p>,
        }[walletState]
      }
    </div>
  );
}

export default App;
