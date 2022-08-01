pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;

    mapping (uint => Item) public items;

    constructor(uint _feePercent){
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }
    enum State {Inactive, Paused, Listed, Sold}

    struct Item{
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        State state;
    }

    event Listed(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    event Cancelled(
        uint itemId,
        IERC721 nft,
        uint tokenId
    );
    function listAndEmit(IERC721 _nft, uint _tokenId, uint _price, uint itemId) private {
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        items[itemId] = Item(
            itemId,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            State.Listed
        );
        emit Listed(
            itemId,
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );
    }

    function makeItem(IERC721 _nft, uint _tokenId, uint _price) private{
        require (_price > 0, "Price must be greater than zero");
        itemCount++;
        listAndEmit(_nft, _tokenId, _price, itemCount);
    }

    function purchaseItem(uint _itemId) external payable nonReentrant{
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require (_itemId > 0 && _itemId <= itemCount, "item doesn't exists");
        require (msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
        require (State.Listed == item.state, "Item must be listed.");

        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);

        item.nft.transferFrom(address(this),msg.sender,item.tokenId);

        item.state = State.Sold;

        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function cancelListing(uint256 _itemId) public nonReentrant {
        require (_itemId > 0 && _itemId <= itemCount, "item doesn't exists");
        Item storage item = items[_itemId];
        require (State.Listed == item.state, "Item must be listed.");
        require(item.seller == msg.sender,'Must be the token owner');
        // require(IERC721(item.nft).getApproved(item.tokenId) == address(this),'NFT must be approved to market');
        item.state = State.Inactive;
        item.price = 0;
        item.seller = payable(address(0));
        item.nft.transferFrom(address(this),msg.sender,item.tokenId);

        emit Cancelled(
            _itemId,
            item.nft,
            item.tokenId
        );
    }
    
    function newListing(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant{
        require (_price > 0, "Price must be greater than zero");
        bool found;
        uint index;
        (found, index) = getMarketItemIndex(_tokenId, address(_nft));
        if (found){
            require(items[index].state != State.Listed, "Item is already listed");
            listAndEmit(_nft, _tokenId, _price, items[index].itemId);
        }else{
            makeItem(_nft, _tokenId, _price);
        }
    }

    function getMarketItemIndex(uint _tokenId, address contractAddress) view private returns(bool, uint){
        for (uint i = 1; i <= itemCount; i++){
            if (items[i].tokenId == _tokenId && address(items[i].nft) == contractAddress){
                return (true, items[i].itemId);
            }
        }
        return (false, 0);
    }
    
    function getTotalPrice(uint _itemId) view public returns(uint){
        return((items[_itemId].price*(100 + feePercent))/100);
    }

    function isListed(Item memory item) private view returns (bool){
        return item.seller == msg.sender && item.state == State.Listed;
    }

    function fetchListedItems() public view returns (Item[] memory){
        uint myItems = 0;
        uint currentIndex = 0;
        for (uint i = 1; i <= itemCount; i++){
            if (isListed(items[i])){
                myItems++;
            }
        }
        Item[] memory myItemsArr = new Item[](myItems);
        for (uint i = 1; i <= itemCount; i++){
            if (isListed(items[i])){
                myItemsArr[currentIndex] = items[i];
                currentIndex++;
            }
        }
        return myItemsArr;
    }

}