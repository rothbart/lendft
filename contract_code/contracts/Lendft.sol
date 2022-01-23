//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Lendft {
    //Loan struct
    struct Loan {
        uint loanId;
        address debtorAddress;
        address lenderAddress;
        uint principal;
        uint interestRate;
        address collateralNftContractAddress;
        uint collateralNftId;
        uint maturityInSeconds;
        uint startTime;
        bool active;
        bool settled;
    }

    mapping (uint => Loan) loanById;
    Loan[] public loans;

    function createPendingLoan(        
        uint principal,
        uint interestRate,
        address collateralNftContractAddress,
        uint collateralNftId,
        uint maturityInSeconds
    ) external returns(uint) {
        // Create loan, use index in array as loanId
        // Add loan to loans array
        uint loanId = loans.length;

        Loan memory loan = Loan(
            loanId, 
            msg.sender,
            address(0), 
            principal, 
            interestRate, 
            collateralNftContractAddress, 
            collateralNftId,
            maturityInSeconds,
            0,
            true,
            false
        );

        loans.push(loan);

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