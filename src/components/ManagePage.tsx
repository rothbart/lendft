import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import { Box, Button, Typography } from "@mui/material";

import { useWallet } from "../WalletProvider";
import { cancelLoan, getLoans } from "../utils/Contract";
import { LoanStatus, LENDFT_ADDRESS } from "../constants/Contract";
import { getNFTs } from "../helpers";

import NftListView from "./shared/NftListView";
import { modalStyle } from "./shared/styles";

const ManagePage = () => {
  const [lenderLoans, setLenderLoans] = useState<any[]>([]);
  const [debtorLoans, setDebtorLoans] = useState<any[]>([]);
  const [contractNfts, setContractNfts] = useState<any[]>([]);
  const [modalState, setModalState] = useState<{
    title: string;
    buttonText: string;
    action: () => Promise<void>;
    activeLoan: any;
  } | null>(null);

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

    /*
      const loanIds = await getDebtorLoanIds(wallet);
      const debtorLoans = await Promise.all(
        loanIds.map(async (loanId: any) => {
          const loan = await getLoan(wallet, parseInt(loanId._hex, 16));
          return loan;
        })
      );*/

    const debtorLoans = allLoans.filter(
      (loan: any) => loan.debtorAddress == wallet.address
    );
    const lenderLoans = allLoans.filter(
      (loan: any) => loan.lenderAddress == wallet.address
    );

    setDebtorLoans(debtorLoans);
    setLenderLoans(lenderLoans);
    setContractNfts(nftsOnContract);
  };

  useEffect(() => {
    getData();
  }, []);

  if (debtorLoans.length === 0 && lenderLoans.length === 0) {
    return <div>No borrowing or lending activity detected</div>;
  }

  if (contractNfts.length === 0) {
    return <div>Loading</div>;
  }

  const hydratedDebtorLoans = debtorLoans
    .map((debtorLoan: any) => {
      const nft = contractNfts.find((contractNft: any) => {
        return parseInt(debtorLoan.nftId._hex, 16) === contractNft.id;
      });

      if (!nft) {
        return null;
      }

      return {
        name: nft.name,
        id: parseInt(debtorLoan.nftId._hex, 16),
        contract_address: debtorLoan.nftContractAddress,
        status: LoanStatus[debtorLoan.status],
        image_url: nft.image_url,
        permalink: nft.permalink,
        principal: parseInt(debtorLoan.principal._hex, 16),
        loanId: parseInt(debtorLoan.loanId._hex, 16),
        interestRate: parseInt(debtorLoan.interestRate._hex, 16),
      };
    })
    .filter((hydratedDebtorLoan: any) => !!hydratedDebtorLoan);

  // TODO: hydrate these the same way we're doing for debtor loans
  const hydratedLenderLoans: any[] = [];

  const pendingLoanAction = {
    name: "Cancel Loan",
    onClick: (loan: any) => {
      setModalState({
        title: "Are you sure you want to cancel this loan?",
        buttonText: "Cancel Loan",
        action: async () => {
          await cancelLoan(wallet, loan.loanId);
          closeModal();
          getData();
        },
        activeLoan: loan,
      });
    },
  };

  const borrowingActivityAction = {
    name: "Repay Loan",
    onClick: (loan: any) => {
      setModalState({
        title: "Are you sure you want to repay this loan?",
        buttonText: "Repay Loan",
        action: async () => closeModal(), // TODO: wire up action
        activeLoan: loan,
      });
    },
  };

  const lendingActivityAction = {
    name: "Claim Collateral",
    onClick: (loan: any) => {
      setModalState({
        title: "Are you sure you want to claim the collateral for this loan?",
        buttonText: "Claim collateral",
        action: async () => closeModal(), // TODO: wire up action
        activeLoan: loan,
      });
    },
  };

  const pendingLoans = hydratedDebtorLoans.filter(
    (loan: any) => loan.status == "PENDING"
  );
  const borrowingActivity = hydratedDebtorLoans.filter(
    (loan: any) => loan.status == "ACTIVE"
  );
  const lendingActivity = hydratedLenderLoans.filter(
    (loan: any) => loan.status == "ACTIVE"
  );

  const closeModal = () => {
    setModalState(null);
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

  return (
    <React.Fragment>
      {pendingLoans.length > 0 ? (
        <React.Fragment>
          <Typography
            variant="h5"
            align="center"
            sx={{ py: 3, mb: 3 }}
            className="tableheader"
          >
            Pending Loans
          </Typography>
          <NftListView
            nfts={pendingLoans}
            action={pendingLoanAction}
            additionalTableFields={additionalTableFields}
          />
        </React.Fragment>
      ) : (
        <React.Fragment />
      )}
      {borrowingActivity.length > 0 ? (
        <React.Fragment>
          <Typography
            variant="h5"
            align="center"
            sx={{ py: 3, my: 3 }}
            className="tableheader"
          >
            Borrowing Activity
          </Typography>
          <NftListView
            nfts={borrowingActivity}
            action={borrowingActivityAction}
            additionalTableFields={additionalTableFields}
          />
        </React.Fragment>
      ) : (
        <React.Fragment />
      )}
      {lendingActivity.length > 0 ? (
        <React.Fragment>
          <Typography
            variant="h5"
            align="center"
            sx={{ py: 3, my: 3 }}
            className="tableheader"
          >
            Lending Activity
          </Typography>
          <NftListView
            nfts={lendingActivity}
            action={lendingActivityAction}
            additionalTableFields={additionalTableFields}
          />
        </React.Fragment>
      ) : (
        <React.Fragment />
      )}
      <Modal open={!!modalState} onClose={closeModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="div">
            {modalState?.title}
          </Typography>
          {modalState?.activeLoan && (
            <img src={modalState.activeLoan.image_url} />
          )}
          <Button
            onClick={async () => {
              await modalState?.action();
            }}
          >
            {modalState?.buttonText}
          </Button>
        </Box>
      </Modal>
    </React.Fragment>
  );
};

export default ManagePage;
