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

import BorrowPage from "./components/BorrowPage";

import "./App.css";

function App() {
  const wallet = useWallet();
  const [nfts, setNFTs] = useState<NFTList>([]);

  const params = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  const addressOverride = params.address as string;

  useEffect(() => {
    const getNFTList = async () => {
      if (wallet) {
        const nfts = await getNFTs(
          addressOverride || wallet.address,
          wallet.isRinkeby
        );
        setNFTs(nfts)
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
                    <Link to={SITE_PAGES_INFO[pageKey].route} style={{textDecoration: "none"}}>
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
            <Route path={PAGE_ROUTE_BORROW} element={<BorrowPage nfts={nfts} />} />
            <Route path={PAGE_ROUTE_LEND} element={<div>Lend</div>} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
