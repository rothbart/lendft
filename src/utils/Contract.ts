import { ethers } from 'ethers';

import { LENDFT_ADDRESS, LENDFT_ABI, ERC721_ABI } from '../constants/Contract';

const getContract = (wallet: any, address: string, abi: any) => {
    if (!wallet) {
        return null;
    }

    const contract = new ethers.Contract(address, abi, wallet.provider.getSigner())

    return contract;
}

const createPendingLoan = async (wallet: any, principal: number, interestRate: number, nftContractAddress: string, nftId: string, maturityInSeconds: number) => {
    const erc721Contract = getContract(wallet, nftContractAddress, ERC721_ABI);
    const lendftContract = getContract(wallet, LENDFT_ADDRESS, LENDFT_ABI);

    if (!wallet || !lendftContract || !erc721Contract) {
        return null;
    }

    try { 
        const approveTransaction = await erc721Contract.approve(LENDFT_ADDRESS, nftId);
        approveTransaction.wait();
    } catch (err) {
        console.log(err);
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
        const returnValue = transaction.wait();

        console.log("RETURN VALUE", returnValue);

        return returnValue;
    } catch (err) {
        console.log("lendft transaction failed", err);
    }
}

export { createPendingLoan }