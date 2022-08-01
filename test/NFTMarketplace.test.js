const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe("NFTMarketplace", () => {
    let NFT;
    let nft;
    let Marketplace;
    let marketplace
    let deployer;
    let addr1;
    let addr2;
    let addrs;
    let feePercent = 1;
    let URI = "sample URI"
    beforeEach(async () => {
        NFT = await ethers.getContractFactory("NFT");
        Marketplace = await ethers.getContractFactory("Marketplace");
        [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();

        // To deploy our contracts
        nft = await NFT.deploy();
        marketplace = await Marketplace.deploy(feePercent);
    })
    describe("Deployment", () => {
        it("Should track name and symbol of the nft collection", async () => {
            expect(await nft.name()).to.equal("Duklerplace NFT")
            expect(await nft.symbol()).to.equal("DKLR")
        })
        it("Should track fee account and fee percent of the nft collection", async () => {
            expect(await marketplace.feeAccount()).to.equal(deployer.address)
            expect(await marketplace.feePercent()).to.equal(feePercent)
        })
    })
    describe("Minting NFTs", () => {
        it("Should track each minted NFT", async () => {
            //addr1 mint
            await nft.connect(addr1).mint(URI)
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);
            // addr2 mints an nft
            await nft.connect(addr2).mint(URI)
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(addr2.address)).to.equal(1);
            expect(await nft.tokenURI(2)).to.equal(URI);
        })
    })
    describe("Making marketplace items", () => {
        beforeEach(async () => {
            await nft.connect(addr1).mint(URI)
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
        })
        it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async () => {
            //addr1 mint
            await expect(marketplace.connect(addr1).newListing(nft.address, 1, toWei(1)))
                .to.emit(marketplace, "Offered")
                .withArgs(1, nft.address, 1, toWei(1), addr1.address)
            //Owner of nft should now be the marketplace
            expect(await nft.ownerOf(1)).to.equal(marketplace.address);
            //item count should now equal 1
            
            expect(await marketplace.itemCount()).to.equal(1)
            // Get item from items pamming then check fields to ensure they are correct
            const item = await marketplace.items(1);
            expect(item.itemId).to.equal(1)
            expect(item.nft).to.equal(nft.address)
            expect(item.tokenId).to.equal(1)
            expect(item.price).to.equal(toWei(1))
            expect(item.state).to.equal(2)
        })
        it("Should fail if price is set to zero", async () => {
            await expect(
                marketplace.connect(addr1).newListing(nft.address, 1, 0)
            ).to.be.revertedWith("Price must be greater than zero");
        })
    })
    describe("Purchasing marketplace items", () => {
        let price = 2;
        let totalPriceInWei;
        beforeEach(async () => {
            await nft.connect(addr1).mint(URI)
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
            await marketplace.connect(addr1).newListing(nft.address,1,toWei(price))
        })
        it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async () => {
            const sellerInitialEthBal = await addr1.getBalance();
            const feeAccountInitialEthBal = await deployer.getBalance();
            totalPriceInWei = await marketplace.getTotalPrice(1);

            await expect(marketplace.connect(addr2).purchaseItem(1,{value: totalPriceInWei}))
                .to.emit(marketplace, "Bought")
                .withArgs(
                    1,
                    nft.address,
                    1,
                    toWei(price),
                    addr1.address,
                    addr2.address
                )
            const sellerFinalEthBal = await addr1.getBalance();
            const feeAccountFinalEthBal = await deployer.getBalance();

            expect(+fromWei(sellerFinalEthBal)).to.equal(+price + +fromWei(sellerInitialEthBal))

            const fee = (feePercent / 100) * price;

            expect(+fromWei(feeAccountFinalEthBal)).to.equal(+fee + +fromWei(feeAccountInitialEthBal));

            expect(await nft.ownerOf(1)).to.equal(addr2.address);

            expect((await marketplace.items(1)).state).to.equal(3);
        })
        it("Should fail for invalid items ids, sold items and when not enough ether is paid", async () => {
            await expect(
                marketplace.connect(addr2).purchaseItem(2, { value: totalPriceInWei })
            ).to.be.revertedWith("item doesn't exists");
            await expect(
                marketplace.connect(addr2).purchaseItem(0, { value: totalPriceInWei })
            ).to.be.revertedWith("item doesn't exists")
            await expect(
                marketplace.connect(addr2).purchaseItem(1, { value: toWei(price) })
            ).to.be.revertedWith("not enough ether to cover item price and market fee")

            await marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei})
            
            await expect(
                marketplace.connect(deployer).purchaseItem(1, { value: totalPriceInWei})
            ).to.be.revertedWith("item already sold");
        })
    })
})