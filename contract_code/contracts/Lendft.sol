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

    event LoanCreated(uint loanId, address debtor);
    event LoanCancelled(uint loanId, address debtor);
    event LoanInitiated(uint loanId, address lender);
    event LoanRepaid(uint loanId);

    Loan[] public loans;
    mapping (address => mapping (address => mapping (uint => bool))) debtorHasActiveLoan;
    mapping (address => Loan[]) public loansByDebtor;

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
        require(loans[loanId].status == LoanState.Active, "This loan is not active");
        require(block.timestamp - loans[loanId].startTime > loans[loanId].maturityInSeconds, "This loan is not overdue yet");
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

        loansByDebtor[msg.sender].push(loan);

        emit LoanCreated(loanId, msg.sender);

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
        debtorHasActiveLoan[msg.sender][loans[loanId].nftContractAddress][loans[loanId].nftId] = false;

        // Return the NFT to the debtor
        IERC721 tokenContract = IERC721(loans[loanId].nftContractAddress);
        tokenContract.transferFrom(address(this), loans[loanId].debtorAddress, loans[loanId].nftId);

        emit LoanCancelled(loanId, msg.sender);

        return true;
    }

    function repayLoan(uint loanId) external payable isActiveLoan(loanId) returns(bool){
        // I think we can allow anyone to repay a loan
        
        // Validate debtor has enough capital
        uint yearsElapsed = (block.timestamp - loans[loanId].startTime) / 365 days;
        uint loanBalance = loans[loanId].principal + loans[loanId].interestRate * yearsElapsed;
        require(loanBalance <= msg.value, "insufficient funds to repay loan");
        
        // Credit gets paid principal and interest
        (bool sent, ) = loans[loanId].lenderAddress.call{value: loanBalance}("");
        
        // Debtor gets back NFT
        if (sent) {
            IERC721 tokenContract = IERC721(loans[loanId].nftContractAddress);
            tokenContract.transferFrom(address(this), loans[loanId].debtorAddress, loans[loanId].nftId);
        }
        
        debtorHasActiveLoan[loans[loanId].debtorAddress][loans[loanId].nftContractAddress][loans[loanId].nftId] = false;

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
        
        (bool sent, ) = loans[loanId].debtorAddress.call{value: loans[loanId].principal}("");

        // change status to active
        loans[loanId].status = LoanState.Active;

        //start the clock
        loans[loanId].startTime = block.timestamp;

        emit LoanInitiated(loanId, msg.sender);

        return sent;

    }

    function getDebtorLoans() external view returns(Loan[] memory) {
        return loansByDebtor[msg.sender];
    }

    function selfDestruct() external {
        selfdestruct(payable(msg.sender));
    }
}
