import React, { useState } from "react";
import Modal from '@mui/material/Modal';
import { Box, TextField, Button } from '@mui/material';

import { useWallet } from "../WalletProvider";
import { createPendingLoan } from "../utils/Contract";

import NftListView from "./shared/NftListView";

const boxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const textFieldStyle = {
    marginBottom: "16px",
}

const LendPage = (props: any) => {
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
        name: "Fund Loan",
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

        await createPendingLoan(wallet, loanAmount, interestRate, activeNft.contract_address, activeNft.id, loanDuration);

        closeModal();
    }

    return (
        <React.Fragment>
            <NftListView nfts={nfts} action={action} />
            <Modal
                open={modalOpen}
                onClose={closeModal}
            >
                <Box sx={boxStyle}>
                    {activeNft && <img src={activeNft.image_url} />}
                    <TextField
                        fullWidth
                        sx={textFieldStyle}
                        type="number"
                        label="Loan Amount (USDC)"
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
                        label="Loan Duration (Seconds)"
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

export default LendPage;

