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

    event LoanCancelled(uint loanId, address debtor);
    event LoanInitiated(uint loanId, address lender);
    event LoanRepaid(uint loanId);

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

    modifier isActiveLoan(uint loanId) {
        require(loans[loanId].status == LoanState.Active, "This loan is not active");
        _;
    }

    modifier isOverdueLoan(uint loanId) {
        require(loans[loanId].status == LoanState.Active, "This loan has already been paid");
        //  Need to confirm how start time is being collected, and do the correct time check
        require(now - loans[loanId].startTime > loans[loanId].maturityInSeconds, "This loan is not overdue yet");
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
    
    // Debtor cancels a pending loan, returns true if successful
    function cancelLoan(uint loanId) 
        external 
        isValidDebtor(msg.sender, loanId) 
        isPendingLoan(loanId)
        returns(bool)
    {
        LoanState state = loans[loanId].status;
        require(state == LoanState.Pending, "Must cancel a pending loan");
        
        //Change loan state
        loans[loanId].status = LoanState.Cancelled;

        // Return the NFT to the debtor
        IERC721 tokenContract = IERC721(loans[loanId].nftContractAddress);
        tokenContract.transferFrom(address(this), loans[loanId].debtor, loans[loanId].nftId);

        emit LoanCancelled(loanId, msg.sender);

        return true;
    }

    function repayLoan(uint loanId) external payable isActiveLoan(loanId) returns(bool){
        // I think we can allow anyone to repay a loan
        
        // Validate debtor has enough capital
        uint yearsElapsed = (now - loans[loanId].startTime) / 1 years;
        uint loanBalance = loans[loanId].principal + loans[loanId].interestRate * yearsElapsed;
        require(loanBalance <= msg.value, "insufficient funds to repay loan");
        
        // Debtor gets back NFT
        IERC721 tokenContract = IERC721(loans[loanId].nftContractAddress);
        tokenContract.transferFrom(address(this), loans[loanId].debtor, loans[loanId].nftId);
        
        // Credit gets paid principal and interest
        (bool sent, bytes memory data) = loans[loanId].lenderAddress.call{value: loanBalance}("");

        emit LoanRepaid(loanId);

        return sent;
        
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

    // Lender accepts loan terms
    function initiateLoan(uint loanId) external payable isPendingLoan(loanId) returns(bool) {
    
        // Check that lender has appropriate balance
        require( msg.value >= loans[loanId].principal, "insufficient funds recieved" );

        // Transfer ETH tokens to borrower
        
        (bool sent, bytes memory data) = loans[loanId].debtorAddress.call{value: principal}("");

        // change status to active
        loans[loanId].status = LoanState.Active;

        //start the clock
        loans[loanId].startTime = now;

        emit LoanInitiated(loanId, msg.sender);

        return sent;

    }

    function selfDestruct() external {
        selfdestruct(payable(msg.sender));
    }
}
