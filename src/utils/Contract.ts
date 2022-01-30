import { ethers } from 'ethers';

import { LENDFT_ADDRESS, LENDFT_ABI, ERC721_ABI } from '../constants/Contract';

const getContract = (wallet: any, address: string, abi: any) => {
    if (!wallet) {
        return null;
    }

    const contract = new ethers.Contract(address, abi, wallet.provider.getSigner())

    return contract;
}

export const createPendingLoan = async (wallet: any, principal: number, interestRate: number, nftContractAddress: string, nftId: string, maturityInSeconds: number) => {
    const erc721Contract = getContract(wallet, nftContractAddress, ERC721_ABI);
    const lendftContract = getContract(wallet, LENDFT_ADDRESS, LENDFT_ABI);

    if (!wallet || !lendftContract || !erc721Contract) {
        return null;
    }

    try { 
        const approveTransaction = await erc721Contract.approve(LENDFT_ADDRESS, nftId);
        await approveTransaction.wait();
    } catch (err) {
        console.log("Approval failed", err);
        throw err;
    }

    try {
        const transaction = await lendftContract.createPendingLoan(
            principal,
            interestRate,
            nftContractAddress,
            nftId,
            maturityInSeconds
        )
        const returnValue = await transaction.wait();

        return returnValue;
    } catch (err) {
        console.log("lendft createPendingLoan transaction failed", err);
    }
}

export const getDebtorLoanIds = async (wallet: any) => {
    const lendftContract = getContract(wallet, LENDFT_ADDRESS, LENDFT_ABI);

    if (!wallet || !lendftContract) {
        return null;
    }

    try {
        const loanIds = await lendftContract.getDebtorLoanIds();

        return loanIds;
    } catch (err) {
        console.log("lendft getDebtorLoanIds transaction failed", err)
    }
}

export const cancelLoan = async (wallet: any, loanId: number) => {
    const lendftContract = getContract(wallet, LENDFT_ADDRESS, LENDFT_ABI);

    if (!wallet || !lendftContract) {
        return null;
    }

    try {
        const transaction = await lendftContract.cancelLoan(loanId);
        await transaction.wait();
    } catch (err) {
        console.log("lendft cancelLoan transaction failed", err)
    }
}

export const getLoan = async (wallet: any, loanId: number) => {
    const lendftContract = getContract(wallet, LENDFT_ADDRESS, LENDFT_ABI);

    if (!wallet || !lendftContract) {
        return null;
    }

    try {
        const loan = await lendftContract.loans(loanId);
        return loan
    } catch (err) {
        console.log("lendft cancelLoan transaction failed", err)
    }
}

export const getLoans = async (wallet: any) => {
    const lendftContract = getContract(wallet, LENDFT_ADDRESS, LENDFT_ABI);

    if (!wallet || !lendftContract) {
        return null;
    }

    try {
        const loans = await lendftContract.getLoans();
        return loans
    } catch (err) {
        console.log("lendft getLoans transaction failed", err)
    }
}

export const initiateLoan = async (wallet: any, loanId: number, amount: number) => {
    const lendftContract = getContract(wallet, LENDFT_ADDRESS, LENDFT_ABI);

    if (!wallet || !lendftContract) {
        return null;
    }

    try {
        const options = {value: ethers.utils.parseEther((amount / 10**9).toString())}
        const transaction = await lendftContract.initiateLoan(loanId, options);
        await transaction.wait();
    } catch (err) {
        console.log("lendft initiateLoan transaction failed", err)
    }
}