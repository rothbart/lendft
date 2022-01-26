//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Lendft {
    enum LoanState {
        Pending,
        Active,
        Settled,
        Cancelled
    }

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
        LoanState status;
    }

    Loan[] public loans;
    mapping (address => mapping (address => mapping (uint => bool))) debtorHasActiveLoan;

    modifier validateLoanTermInputs(uint principal, uint interestRate, uint maturityInSeconds) {
        require(principal > 0, "Principal needs to be greater than zero");
        require(interestRate > 0, "Interest rate needs to be greater than zero");
        require(maturityInSeconds > 0, "Maturity needs to be greater than zero");
        _;
    }

    modifier onlyUnloaned(address nftContractAddress, uint nftId) {
        require(debtorHasActiveLoan[msg.sender][nftContractAddress][nftId] == false, "Already have active loan for this collateral");
        _;
    }

    modifier isPendingLoan(uint loanId) {
        require(loans[loanId].status == LoanState.Pending, "This loan is not available");
        _;
    }

    modifier isOverdueLoan(uint loanId) {
        require(loans[loanId].status == LoanState.Active, "This loan has already been paid");
        //  Need to confirm how start time is being collected, and do the correct time check
        //  require(loans[loanId].startTime == loans[loanId].maturityInSeconds, "This loan is not overdue yet");
        _;
    }

    modifier onlyLender(address callerAddress, uint loanId) {
        require(loans[loanId].lenderAddress== callerAddress, "Caller is not the lender for this loan");
        _;
    }

    modifier isValidDebtor(address callerAddress, uint loanId) {
        require(loans[loanId].debtorAddress== callerAddress, "Caller is not the debtor for this loan");
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
        onlyUnloaned(nftContractAddress, nftId)
        returns(uint)
    {
        // Create loan, use index in array as loanId
        // Add loan to loans array
        uint loanId = loans.length;

        IERC721 tokenContract = IERC721(nftContractAddress);
        tokenContract.transferFrom(msg.sender, address(this), nftId);

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
            LoanState.Pending
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

    function claimCollateral(
        uint loanId
    )   external
        onlyLender(msg.sender, loanId)
        isOverdueLoan(loanId)
        returns(uint)
    {
        // Lender claims collateral on overdue loan
        address nftContractAddress = loans[loanId].nftContractAddress;
        uint nftId = loans[loanId].nftId;
        IERC721 tokenContract = IERC721(nftContractAddress);
        tokenContract.transferFrom(address(this), msg.sender, nftId);
        return nftId;
    }

    function initiateLoan(uint loanId) external {
        // Lender accepts loan terms
    }

    function selfDestruct() external {
        selfdestruct(payable(msg.sender));
    }
}
