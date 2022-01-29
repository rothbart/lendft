import React, { useState, useEffect } from "react";
import Modal from '@mui/material/Modal';
import { Box, Button, Typography } from '@mui/material';

import { useWallet } from "../WalletProvider";
import { getDebtorLoans, cancelLoan } from "../utils/Contract";
import { LoanStatus, LENDFT_ADDRESS } from '../constants/Contract';
import { getNftInfo, getNFTs } from "../helpers";

import NftListView from "./shared/NftListView";
import { modalStyle } from "./shared/styles";

const ManagePage = () => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [activeLoan, setActiveLoan] = useState<any>(null);
    const [debtorLoans, setDebtorLoans] = useState<any>([]);
    const [contractNfts, setContractNfts] = useState<any>([]);

    const wallet = useWallet();

    if (!wallet) {
        return <div>Connect wallet</div>;
    }

    useEffect(() => {
        const getData = async () => {
            // TODO: Add lender loans here
            const loans = await getDebtorLoans(wallet);
            const nftsOnContract = await getNFTs(LENDFT_ADDRESS, wallet.isRinkeby);

            setDebtorLoans(loans);
            setContractNfts(nftsOnContract);
        }

        getData();
    }, [])

    if (debtorLoans.length === 0) {
        return <div>No loans</div>;
    }

    if (contractNfts.length === 0) {
        return <div>Loading</div>;
    }

    const hydratedDebtorLoans = debtorLoans.map((debtorLoan: any) => {
        const nft = contractNfts.find((contractNft: any) => {
            return parseInt(debtorLoan.nftId._hex, 16) === contractNft.id;
        })

        if (!nft) {
            return null
        }

        return {
            name: nft.name,
            id: parseInt(debtorLoan.nftId._hex, 16),
            contract_address: debtorLoan.nftContractAddress,
            status: LoanStatus[debtorLoan.status],
            image_url: nft.image_thumbnail_url,
            permalink: nft.permalink,
            principal: parseInt(debtorLoan.principal._hex, 16),
            loanId: parseInt(debtorLoan.loanId._hex, 16),
            interestRate: parseInt(debtorLoan.interestRate._hex, 16),
        };
    }).filter((hydratedDebtorLoan: any) => !!hydratedDebtorLoan)

    const pendingLoanAction = {
        name: "Cancel Loan",
        onClick: (loan: any) => {
            setActiveLoan(loan);
            setModalOpen(true);
        }
    }

    const pendingLoans = hydratedDebtorLoans.filter((debtorLoan: any) => debtorLoan.status == 'PENDING');

    const closeModal = () => {
        setModalOpen(false);
        setActiveLoan(null);
    }

    const additionalTableFields = [
        {
            name: 'Amount',
            attribute: 'principal',
            displayFn: (value: any) => `${value/(10 ** 18)}%`
        },
        {
            name: 'Interest rate',
            attribute: 'interestRate',
            displayFn: (value: any) => `${value/100}%`
        }
    ]

    const callCancelLoan = async () => {
        if (!activeLoan) {
            return;
        }

        await cancelLoan(wallet, activeLoan.loanId);

        closeModal();
    }

    return (
        <React.Fragment>
            <Typography variant="h5">Pending Loans</Typography>
            <NftListView nfts={pendingLoans} action={pendingLoanAction} additionalTableFields={additionalTableFields} />
            <Modal
                open={modalOpen}
                onClose={closeModal}
            >
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="div">
                        Are you sure you want to cancel this loan?
                    </Typography>
                    {activeLoan && <img src={activeLoan.image_url} />}
                    <Button onClick={() => { callCancelLoan(); }}>
                        Cancel Loan
                    </Button>
                </Box>
            </Modal>
        </React.Fragment>
    )
}

export default ManagePage;