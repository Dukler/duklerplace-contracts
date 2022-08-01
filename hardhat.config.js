require("@nomiclabs/hardhat-waffle");

const ALCHEMY_API_KEY = "hQgRBEblOt2CEl_7kNaQUjnc3UTkwVyG";
const GOERLI_PRIVATE_KEY = "f8677fb571faaea223dfbe8cd2f6d5c348bf01189c4dc8ddaa5e654bdfbaa8ac";
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY]
    }
  }
};
