import { ethers } from 'ethers';

import { LENDFT_ADDRESS, LENDFT_CONTRACT_ABI } from '../constants/Contract';

const getContract = (wallet: any) => {
    if (!wallet) {
        return null;
    }

    const contract = new ethers.Contract(LENDFT_ADDRESS, LENDFT_CONTRACT_ABI, wallet.provider.getSigner())

    return contract;
}

const createPendingLoan = async (wallet: any, principal: number, interestRate: number, nftContractAddress: string, nftId: string, maturityInSeconds: number) => {
    const contract = getContract(wallet);

    if (!wallet || !contract) {
        return null;
    }

    try {
        const transaction = await contract.createPendingLoan(
            principal,
            interestRate,
            nftContractAddress,
            nftId,
            maturityInSeconds
        )
        const returnValue = transaction.wait();

        return returnValue;
    } catch (err) {
        console.log(err);
    }
}

export { createPendingLoan }