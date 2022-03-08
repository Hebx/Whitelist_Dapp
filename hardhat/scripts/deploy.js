const {ethers} = require("hardhat");

async function main()  {
	//   whitelistContract here is a factory for instances of our Whitelist contract.
	const whitelistContract = await ethers.getContractFactory("Whitelist");
// deploy 10 whitelist addresses allowed
	const deployedWhitelistContract = await whitelistContract.deploy(10);
	await deployedWhitelistContract.deployed();

	console.log("Whitelist Contract Address:", deployedWhitelistContract.address);
}

main()
.then(() => process.exit(0))
.catch((error) => {
	console.error(error);
	process.exit(1);
})
