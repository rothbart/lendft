export const LENDFT_ADDRESS = "0xae939Ed3cE4D375e3Ea5Ae75E523F0576DdA7FcF";
export const USDC_ADDRESS = "0xeb8f08a975ab53e34d8a0330e0d34de942c95926";

export const LENDFT_CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "loanId",
				"type": "uint256"
			}
		],
		"name": "cancelLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claimCollateral",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "principal",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "interestRate",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "collateralNftContractAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "collateralNftId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maturityInSeconds",
				"type": "uint256"
			}
		],
		"name": "createPendingLoan",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "loanId",
				"type": "uint256"
			}
		],
		"name": "initiateLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "loans",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "loanId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "debtorAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "lenderAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "principal",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "interestRate",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "collateralNftContractAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "collateralNftId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maturityInSeconds",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "settled",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "loanId",
				"type": "uint256"
			}
		],
		"name": "repayLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "selfDestruct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];