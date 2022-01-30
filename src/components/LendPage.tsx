import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import { Box, Button } from "@mui/material";

import { useWallet } from "../WalletProvider";
import { getLoans, initiateLoan} from "../utils/Contract";
import { LoanStatus, LENDFT_ADDRESS } from "../constants/Contract";
import { getNFTs } from "../helpers";

import NftListView from "./shared/NftListView";
import { modalStyle } from "./shared/styles";

const LendPage = () => {
  const [pendingLoans, setPendingLoans] = useState<any[]>([]);
  const [contractNfts, setContractNfts] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState<any>(false);
  const [activeLoan, setActiveLoan] = useState<any>(null);

  const wallet = useWallet();

  if (!wallet) {
    return <div>Connect wallet</div>;
  }

  const getData = async () => {
    // TODO: Add lender loans here

    // Fetch loans and NFTs on the contract so we don't
    // hit opensea api for every loan. we will hydrate the loan
    // information below with the data on the NFT
    const allLoans = await getLoans(wallet);
    const nftsOnContract = await getNFTs(LENDFT_ADDRESS, wallet.isRinkeby);


    const pendingLoans = allLoans.filter(
      (loan: any) => loan.status === 0
    );


    setPendingLoans(pendingLoans);
    setContractNfts(nftsOnContract);
  };

  useEffect(() => {
    getData();
  }, []);

  if (pendingLoans.length === 0) {
    return <div>No borrowing or lending activity detected</div>;
  }

  if (contractNfts.length === 0) {
    return <div>Loading</div>;
  }

  const hydratedPendingLoans = pendingLoans
    .map((pendingLoan: any) => {
      const nft = contractNfts.find((contractNft: any) => {
        return parseInt(pendingLoan.nftId._hex, 16) === contractNft.id;
      });

      if (!nft) {
        return null;
      }

      return {
        name: nft.name,
        id: parseInt(pendingLoan.nftId._hex, 16),
        contract_address: pendingLoan.nftContractAddress,
        status: LoanStatus[pendingLoan.status],
        image_url: nft.image_url,
        permalink: nft.permalink,
        principal: parseInt(pendingLoan.principal._hex, 16),
        loanId: parseInt(pendingLoan.loanId._hex, 16),
        interestRate: parseInt(pendingLoan.interestRate._hex, 16),
      };
    })
    .filter((hydratedPendingLoan: any) => !!hydratedPendingLoan);


  const closeModal = () => {
    setModalOpen(false);
    setActiveLoan(null);
  };

  const additionalTableFields = [
    {
      name: "Amount",
      attribute: "principal",
      displayFn: (value: any) => `${value / 10 ** 9}`,
    },
    {
      name: "Interest rate",
      attribute: "interestRate",
      displayFn: (value: any) => `${value / 100}%`,
    },
  ];

  const action = {
    name: "Fund Loan",
    onClick: (loan: any) => { 
        setActiveLoan(loan);
        setModalOpen(true);
    }
}

const callInitiateLoan = async () => {
    if (!activeLoan) {
        return;
    }

    await initiateLoan(
        wallet, 
        activeLoan.loanId, 
        activeLoan.principal, 
    );

    closeModal();
}

  return (
    <React.Fragment>
        <NftListView nfts={hydratedPendingLoans} action={action} additionalTableFields={additionalTableFields} />
        <Modal
            open={modalOpen}
            onClose={closeModal}
        >
            <Box sx={modalStyle}>
                {activeLoan && <img src={activeLoan.image_url} />}
                
                <Button onClick={() => { callInitiateLoan() }}>
                    Fund Loan
                </Button>
            </Box>
        </Modal>
    </React.Fragment>
  );
};

export default LendPage;
