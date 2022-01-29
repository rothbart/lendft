export function parseLoanInfo(contractNFTs: any[], loans: any[]): any[] {
  const parsedLoans = loans.map((loan: any) => {
    const loanNFT = contractNFTs.find((nft: any) => {
      return parseInt(loan.nftId._hex, 16) === nft.id;
    });

    if (!loanNFT) {
      return null;
    }

    return {
      name: loanNFT.name,
      id: parseInt(loan.nftId._hex, 16),
      contract_address: loan.nftContractAddress,
      status: loan.status,
      image_url: loanNFT.image_url,
      permalink: loanNFT.permalink,
      principal: parseInt(loan.principal._hex, 16),
      loanId: parseInt(loan.loanId._hex, 16),
      interestRate: parseInt(loan.interestRate._hex, 16),
    };
  });

  return parsedLoans.filter((loan) => !!loan);
}
