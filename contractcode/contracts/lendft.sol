//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract lendft {
    

    //Loan struct
    struct loan {
        address debtorAddress;
        address lenderAddress;
        uint principal;
        uint interestRate;
        address collateral;
        uint maturityInSeconds;
        uint startTime;
        bool active;
        bool settled;
    }

    function createPendingLoan(        address debtorAddress;
        address lenderAddress;
        uint principal;
        uint interestRate;
        address collateral;
        uint maturityInSeconds;
        uint startTime;
        bool active;
        bool settled;) external (bool) {

    }






}