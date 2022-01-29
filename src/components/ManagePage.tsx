import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

import { useWallet } from "../WalletProvider";
import { cancelLoan, getLoans } from "../utils/Contract";
import { LoanStatus, LENDFT_ADDRESS } from "../constants/Contract";
import { getNFTs } from "../helpers";

import NftListView from "./shared/NftListView";
import { modalStyle } from "./shared/styles";
import { parseLoanInfo } from "./shared/util";

const ManagePage = () => {
  const [pageState, setPageState] = useState<{
    pendingLoans: any[];
    borrowingActivity: any[];
    lendingActivity: any[];
  } | null>(null);
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
    // Fetch loans and NFTs on the contract so we don't
    // hit opensea api for every loan. we will hydrate the loan
    // information below with the data on the NFT
    const allLoans = await getLoans(wallet);
    const walletContractNFTs = await getNFTs(LENDFT_ADDRESS, wallet.isRinkeby);

    const pendingLoans = parseLoanInfo(
      walletContractNFTs,
      allLoans.filter(
        (loan: any) =>
          loan.debtorAddress == wallet.address &&
          loan.status === LoanStatus.PENDING
      )
    );

    const borrowingActivity = parseLoanInfo(
      walletContractNFTs,
      allLoans.filter(
        (loan: any) =>
          loan.debtorAddress == wallet.address &&
          loan.status === LoanStatus.ACTIVE
      )
    );

    const lendingActivity = parseLoanInfo(
      walletContractNFTs,
      allLoans.filter(
        (loan: any) =>
          loan.lenderAddress == wallet.address &&
          loan.status === LoanStatus.ACTIVE
      )
    );

    setPageState({ pendingLoans, borrowingActivity, lendingActivity });
  };

  useEffect(() => {
    getData();
  }, []);

  if (!pageState) {
    return <CircularProgress />;
  }

  const {
    pendingLoans: pending,
    borrowingActivity: borrowing,
    lendingActivity: lending,
  } = pageState;

  if (pending.length === 0 && borrowing.length === 0 && lending.length === 0) {
    return (
      <Typography align="center" variant="h5" sx={{ py: 3 }}>
        No borrowing or lending activity detected.
      </Typography>
    );
  }

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
      {pending.length > 0 ? (
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
            nfts={pending}
            action={pendingLoanAction}
            additionalTableFields={additionalTableFields}
          />
        </React.Fragment>
      ) : (
        <React.Fragment />
      )}
      {borrowing.length > 0 ? (
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
            nfts={borrowing}
            action={borrowingActivityAction}
            additionalTableFields={additionalTableFields}
          />
        </React.Fragment>
      ) : (
        <React.Fragment />
      )}
      {lending.length > 0 ? (
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
            nfts={lending}
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
