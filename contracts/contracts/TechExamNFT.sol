// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TechExamNFT
 * @dev ERC-721 token for the Tech Exam project with minting and transfer capabilities
 */
contract TechExamNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 private _tokenIdCounter;
    
    // Maximum supply of tokens
    uint256 public constant MAX_SUPPLY = 10000;
    
    // Minting price in wei (0.01 ETH)
    uint256 public mintPrice = 0.01 ether;
    
    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    constructor() ERC721("Tech Exam NFT", "TENFT") Ownable(msg.sender) {
        // Start token IDs from 1
        _tokenIdCounter = 1;
    }
    
    /**
     * @dev Mint a new token to the specified address
     * @param to The address to mint the token to
     * @param uri The metadata URI for the token
     */
    function mint(address to, string memory uri) public payable {
        require(_tokenIdCounter <= MAX_SUPPLY, "Max supply exceeded");
        require(msg.value >= mintPrice, "Insufficient payment");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit TokenMinted(to, tokenId, uri);
        
        // Refund excess payment
        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value - mintPrice);
        }
    }
    
    /**
     * @dev Owner can mint tokens for free (for promotional purposes)
     * @param to The address to mint the token to
     * @param uri The metadata URI for the token
     */
    function ownerMint(address to, string memory uri) public onlyOwner {
        require(_tokenIdCounter <= MAX_SUPPLY, "Max supply exceeded");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit TokenMinted(to, tokenId, uri);
    }
    
    /**
     * @dev Batch mint multiple tokens
     * @param to The address to mint the tokens to
     * @param tokenURIs Array of metadata URIs for the tokens
     */
    function batchMint(address to, string[] memory tokenURIs) public payable {
        uint256 quantity = tokenURIs.length;
        require(quantity > 0, "Quantity must be greater than 0");
        require(_tokenIdCounter + quantity - 1 <= MAX_SUPPLY, "Max supply exceeded");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            emit TokenMinted(to, tokenId, tokenURIs[i]);
        }
        
        // Refund excess payment
        uint256 totalCost = mintPrice * quantity;
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
    }
    
    /**
     * @dev Transfer token from one address to another
     * @param from The address to transfer from
     * @param to The address to transfer to
     * @param tokenId The token ID to transfer
     */
    function transferToken(address from, address to, uint256 tokenId) public {
        require(_isAuthorized(ownerOf(tokenId), msg.sender, tokenId), "Not owner nor approved");
        _transfer(from, to, tokenId);
    }
    
    /**
     * @dev Get all token IDs owned by an address
     * @param owner The address to query
     * @return Array of token IDs
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get current token supply
     * @return Current number of tokens minted
     */
    function getCurrentSupply() public view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    /**
     * @dev Update mint price (only owner)
     * @param newPrice New mint price in wei
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Check if token exists
     * @param tokenId The token ID to check
     * @return True if token exists
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    // Required overrides for multiple inheritance
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}