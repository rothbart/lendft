import React, { useEffect, useState } from "react";
import qs from "qs";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { SITE_PAGES_INFO, PAGE_ROUTE_BORROW, PAGE_ROUTE_LEND } from "./constants/Routing";
import { getNFTs, NFTList } from "./helpers";
import { useWallet } from "./WalletProvider";

import "./App.css";

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
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Box sx={{flexGrow: 1}}>
              {Object.keys(SITE_PAGES_INFO).map((pageKey) => {
                return (
                  <Typography variant="h6" component="span" key={pageKey}>
                    <Link to={SITE_PAGES_INFO[pageKey].route}>
                      <Button sx={{ mx: 2, color: "white"}}>
                        { SITE_PAGES_INFO[pageKey].name }
                      </Button>
                    </Link>
                  </Typography>
                )
              })}
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <Typography variant="body1" component="span">
                { wallet ? wallet.address : "No wallet connected" }
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/">
            <Route index element={<div>Welcome to LendFT</div>} />
            <Route path={PAGE_ROUTE_BORROW} element={<div>Borrow</div>} />
            <Route path={PAGE_ROUTE_LEND} element={<div>Lend</div>} />
          </Route>
        </Routes>
      </Router>
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
