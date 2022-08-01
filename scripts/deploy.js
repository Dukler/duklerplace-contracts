// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { artifacts } = require("hardhat");
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const NFT = await hre.ethers.getContractFactory("NFT");
  [deployer, addr1] = await hre.ethers.getSigners();
  const nft = await NFT.deploy();

  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(1);

  const AICARDS = await hre.ethers.getContractFactory("AICardsNFT");
  const aiCards = await AICARDS.deploy();

  console.log("NFT contract adress", nft.address)
  console.log("Marketplace contract adress", marketplace.address)
  console.log("AICardsNFT contract adress", aiCards.address)
  // console.log(deployer.address)
  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/1.json')
  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/2.json')
  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/3.json')
  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/4.json')
  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/5.json')
  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/6.json')
  // await aiCards.transferFrom(deployer, 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 1);
  // await aiCards.transferFrom(deployer, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 2);
  // await aiCards.transferFrom(deployer, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 3);
  // await aiCards.transferFrom(deployer, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 4);
  // await aiCards.transferFrom(deployer, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 5);
  // await aiCards.transferFrom(deployer, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 6);
  // await greeter.deployed();

  saveFrontendFiles(nft, "NFT");
  saveFrontendFiles(marketplace, "Marketplace");
  saveFrontendFiles(aiCards, "AICardsNFT");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contracDir = __dirname + "/../../../Javascript/duklerplace/src/contractABIs"
  if (!fs.existsSync(contracDir)) {
    fs.mkdirSync(contracDir);
  }
  fs.writeFileSync(
    contracDir + `/${name}-address.json`,
    JSON.stringify({ adress: contract.address }, undefined, 2)
  );
  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contracDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
