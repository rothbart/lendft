import React, { useState, useEffect } from "react";
import Modal from '@mui/material/Modal';
import { Box, Button, Typography } from '@mui/material';

import { useWallet } from "../WalletProvider";
import { getDebtorLoans, cancelLoan } from "../utils/Contract";
import { LoanStatus } from '../constants/Contract';
import { getNftInfo } from "../helpers";

import NftListView from "./shared/NftListView";
import { modalStyle } from "./shared/styles";

const ManagePage = () => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [activeLoan, setActiveLoan] = useState<any>(null);
    const [debtorLoans, setDebtorLoans] = useState<any>([]);

    const wallet = useWallet();

    useEffect(() => {
        const getLoans = async () => {
            // TODO: Add lender loans here
            const loans = await getDebtorLoans(wallet);

            const hydratedLoans = await Promise.all(loans.map(async (loan: any) => {
                const response = await getNftInfo(loan.nftContractAddress, loan.nftId);
                const nftInfo = response.data;

                return {
                    name: nftInfo.name,
                    id: parseInt(loan.nftId._hex, 16),
                    contract_address: loan.nftContractAddress,
                    status: LoanStatus[loan.status],
                    image_url: nftInfo.image_thumbnail_url,
                    permalink: nftInfo.permalink,
                    principal: parseInt(loan.principal._hex, 16),
                    loanId: parseInt(loan.loanId._hex, 16),
                    interestRate: parseInt(loan.interestRate._hex, 16),
                };
            }));

            setDebtorLoans(hydratedLoans);
        }

        getLoans();
    }, [])

    if (debtorLoans.length == 0) {
        return <div>No loans</div>;
    }

    const pendingLoanAction = {
        name: "Cancel Loan",
        onClick: (loan: any) => {
            setActiveLoan(loan);
            setModalOpen(true);
        }
    }

    const pendingLoans = debtorLoans.filter((debtorLoan: any) => debtorLoan.status == 'PENDING');

    const closeModal = () => {
        setModalOpen(false);
        setActiveLoan(null);
    }

    const additionalTableFields = [
        {
            name: 'Amount',
            attribute: 'principal',
        },
        {
            name: 'Interest rate',
            attribute: 'interestRate',
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