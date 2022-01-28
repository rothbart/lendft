const hre = require("hardhat");

async function main() {
  const LendFt = await hre.ethers.getContractFactory("Lendft");
  const lendft = await LendFt.deploy();

  await lendft.deployed();

  console.log("Lendft deployed to:", lendft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });