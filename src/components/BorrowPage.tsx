import React, { useState } from "react";
import Modal from '@mui/material/Modal';
import { Box, TextField, Button } from '@mui/material';

import { useWallet } from "../WalletProvider";
import { createPendingLoan } from "../utils/Contract";

import NftListView from "./shared/NftListView";
import { modalStyle } from "./shared/styles";

const textFieldStyle = {
    marginBottom: "16px",
}

const BorrowPage = (props: any) => {
    const [modalOpen, setModalOpen] = useState<any>(false);
    const [activeNft, setActiveNft] = useState<any>(null);
    const [loanAmount, setLoanAmount] = useState<any>(0);
    const [interestRate, setInterestRate] = useState<any>(0);
    const [loanDuration, setLoanDuration] = useState<any>(0);

    const wallet = useWallet();
    const { nfts } = props;

    if (!wallet) {
        return <div>Connect wallet</div>
    }

    const action = {
        name: "Create Loan",
        onClick: (nft: any) => { 
            setActiveNft(nft);
            setModalOpen(true);
        }
    }

    const closeModal = () => {
        setModalOpen(false);
        setActiveNft(null);
    }

    const callCreatePendingLoan = async () => {
        if (!activeNft) {
            return;
        }

        await createPendingLoan(
            wallet, 
            loanAmount * 10 ** 18, // convert to wei
            interestRate * 100, // convert to bps
            activeNft.contract_address, 
            activeNft.id, 
            loanDuration == 0 ? 1 : loanDuration * 24 * 60 * 60 // convert days to seconds. If zero is entered create a one second loan for demo purposes
        );

        closeModal();
    }

    const additionalTableFields = [
        {
            name: 'Contract',
            attribute: 'contract_address',
        }
    ]

    return (
        <React.Fragment>
            <NftListView nfts={nfts} action={action} additionalTableFields={additionalTableFields} />
            <Modal
                open={modalOpen}
                onClose={closeModal}
            >
                <Box sx={modalStyle}>
                    {activeNft && <img src={activeNft.image_url} />}
                    <TextField
                        fullWidth
                        sx={textFieldStyle}
                        type="number"
                        label="Loan Amount (ETH)"
                        value={loanAmount}
                        onChange={e => setLoanAmount(parseInt(e.target.value))}
                    />
                    <TextField
                        fullWidth
                        sx={textFieldStyle}
                        type="number"
                        label="Interest Rate"
                        value={interestRate}
                        onChange={e => setInterestRate(parseFloat(e.target.value))}
                    />
                    <TextField
                        fullWidth
                        sx={textFieldStyle}
                        type="number"
                        label="Loan Duration (Days)"
                        value={loanDuration}
                        onChange={e => setLoanDuration(parseInt(e.target.value))}
                    />
                    <Button onClick={() => { callCreatePendingLoan() }}>
                        Create Loan
                    </Button>
                </Box>
            </Modal>
        </React.Fragment>
    )
}

export default BorrowPage;

