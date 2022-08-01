const { artifacts } = require("hardhat");
const hre = require("hardhat");

async function main() {

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

  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/1.json')
  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/2.json')
  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/3.json')
  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/4.json')
  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/5.json')
  await aiCards.mint('https://ipfs.infura.io/ipfs/QmSthRoasyxCFuzmtVj5kn2J6fipvUfqk3k2mEw4SN5hzL/6.json')

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


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
