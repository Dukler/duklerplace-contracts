pragma solidity ^0.8.4;

import "hardhat/console.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract AICardsNFT is ERC721URIStorage {
    uint public totalSupply;
    constructor() ERC721("AI Cards NFT", "AICRD"){}

    function mint(string memory _tokenURI) external returns(uint){
        totalSupply ++;
        _safeMint(msg.sender, totalSupply);
        _setTokenURI(totalSupply, _tokenURI);
        return(totalSupply);
    }

}