//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Lendft {
    //Loan struct
    struct Loan {
        uint loanId;
        address debtorAddress;
        address lenderAddress;
        uint principal;
        uint interestRate;
        address nftContractAddress;
        uint nftId;
        uint maturityInSeconds;
        uint startTime;
        bool active;
        bool settled;
    }

    Loan[] public loans;
    mapping (address => mapping (address => mapping (uint => bool))) debtorHasActiveLoan;

    modifier validateLoanTermInputs(uint principal, uint interestRate, uint maturityInSeconds) {
        require(principal > 0, "Principal needs to be greater than zero");
        require(interestRate > 0, "Interest rate needs to be greater than zero");
        require(maturityInSeconds > 0, "Maturity needs to be greater than zero");
        _;
    }

    modifier ensureDebtorDoesNotHaveActiveLoanForNft(address nftContractAddress, uint nftId) {
        require(debtorHasActiveLoan[msg.sender][nftContractAddress][nftId] == false, "Already have active loan for this collateral");
        _;
    }

    function createPendingLoan(        
        uint principal,
        uint interestRate,
        address nftContractAddress,
        uint nftId,
        uint maturityInSeconds
    ) 
        external 
        validateLoanTermInputs(principal, interestRate, maturityInSeconds)
        ensureDebtorDoesNotHaveActiveLoanForNft(nftContractAddress, nftId)
        returns(uint)
    {
        // Create loan, use index in array as loanId
        // Add loan to loans array
        uint loanId = loans.length;

        IERC721 tokenContract = IERC721(nftContractAddress);
        require(tokenContract.ownerOf(nftId) == msg.sender, "You cannot transfer an NFT you don't own");

        tokenContract.safeTransferFrom(msg.sender, address(this), nftId);

        Loan memory loan = Loan(
            loanId, 
            msg.sender,
            address(0), 
            principal, 
            interestRate, 
            nftContractAddress, 
            nftId,
            maturityInSeconds,
            0,
            true,
            false
        );

        loans.push(loan);
        debtorHasActiveLoan[msg.sender][nftContractAddress][nftId] = true;

        return loanId;
    }

    function cancelLoan(uint loanId) external {
        // Debtor cancels a pending loan
    }

    function repayLoan(uint loanId) external {
        // Validate debtor is the one calling this function
        // Validate debtor has enough capital
        // Validate loan is not already resolved
        // Debtor gets back NFT
        // Credit gets paid principal and interest
    }

    function claimCollateral() external {
        // Lender claims collateral on overdue loan
    }

    function initiateLoan(uint loanId) external {
        // Lender accepts loan terms 
    }

    function selfDestruct() external {
        selfdestruct(payable(msg.sender));
    }
}