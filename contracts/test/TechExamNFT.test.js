const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TechExamNFT", function () {
  let techExamNFT;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const TechExamNFT = await ethers.getContractFactory("TechExamNFT");
    techExamNFT = await TechExamNFT.deploy();
    await techExamNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await techExamNFT.name()).to.equal("Tech Exam NFT");
      expect(await techExamNFT.symbol()).to.equal("TENFT");
    });

    it("Should set the right owner", async function () {
      expect(await techExamNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct initial values", async function () {
      expect(await techExamNFT.MAX_SUPPLY()).to.equal(10000);
      expect(await techExamNFT.mintPrice()).to.equal(ethers.parseEther("0.01"));
      expect(await techExamNFT.getCurrentSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint a token successfully", async function () {
      const uri = "https://example.com/token/1";
      const mintPrice = await techExamNFT.mintPrice();

      await expect(
        techExamNFT.connect(addr1).mint(addr1.address, uri, { value: mintPrice })
      )
        .to.emit(techExamNFT, "TokenMinted")
        .withArgs(addr1.address, 1, uri);

      expect(await techExamNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await techExamNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await techExamNFT.tokenURI(1)).to.equal(uri);
      expect(await techExamNFT.getCurrentSupply()).to.equal(1);
    });

    it("Should fail when insufficient payment", async function () {
      const uri = "https://example.com/token/1";
      const insufficientPayment = ethers.parseEther("0.005");

      await expect(
        techExamNFT.connect(addr1).mint(addr1.address, uri, { value: insufficientPayment })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should refund excess payment", async function () {
      const uri = "https://example.com/token/1";
      const excessPayment = ethers.parseEther("0.02");
      const mintPrice = await techExamNFT.mintPrice();

      const initialBalance = await ethers.provider.getBalance(addr1.address);
      
      const tx = await techExamNFT.connect(addr1).mint(addr1.address, uri, { value: excessPayment });
      const receipt = await tx.wait();
      
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const finalBalance = await ethers.provider.getBalance(addr1.address);
      
      const expectedBalance = initialBalance - mintPrice - gasUsed;
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });

    it("Should allow owner to mint for free", async function () {
      const uri = "https://example.com/token/1";

      await expect(
        techExamNFT.ownerMint(addr1.address, uri)
      )
        .to.emit(techExamNFT, "TokenMinted")
        .withArgs(addr1.address, 1, uri);

      expect(await techExamNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await techExamNFT.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should not allow non-owner to use ownerMint", async function () {
      const uri = "https://example.com/token/1";

      await expect(
        techExamNFT.connect(addr1).ownerMint(addr1.address, uri)
      ).to.be.revertedWithCustomError(techExamNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Batch Minting", function () {
    it("Should batch mint multiple tokens", async function () {
      const tokenURIs = [
        "https://example.com/token/1",
        "https://example.com/token/2",
        "https://example.com/token/3"
      ];
      const mintPrice = await techExamNFT.mintPrice();
      const totalPrice = mintPrice * BigInt(tokenURIs.length);

      await techExamNFT.connect(addr1).batchMint(addr1.address, tokenURIs, { value: totalPrice });

      expect(await techExamNFT.balanceOf(addr1.address)).to.equal(3);
      expect(await techExamNFT.getCurrentSupply()).to.equal(3);
      
      for (let i = 0; i < tokenURIs.length; i++) {
        expect(await techExamNFT.ownerOf(i + 1)).to.equal(addr1.address);
        expect(await techExamNFT.tokenURI(i + 1)).to.equal(tokenURIs[i]);
      }
    });

    it("Should fail batch mint with insufficient payment", async function () {
      const tokenURIs = ["https://example.com/token/1", "https://example.com/token/2"];
      const mintPrice = await techExamNFT.mintPrice();
      const insufficientPayment = mintPrice;

      await expect(
        techExamNFT.connect(addr1).batchMint(addr1.address, tokenURIs, { value: insufficientPayment })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Token Transfer", function () {
    beforeEach(async function () {
      const uri = "https://example.com/token/1";
      const mintPrice = await techExamNFT.mintPrice();
      await techExamNFT.connect(addr1).mint(addr1.address, uri, { value: mintPrice });
    });

    it("Should transfer token successfully", async function () {
      await techExamNFT.connect(addr1).transferToken(addr1.address, addr2.address, 1);

      expect(await techExamNFT.ownerOf(1)).to.equal(addr2.address);
      expect(await techExamNFT.balanceOf(addr1.address)).to.equal(0);
      expect(await techExamNFT.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should not allow unauthorized transfer", async function () {
      await expect(
        techExamNFT.connect(addr2).transferToken(addr1.address, addr2.address, 1)
      ).to.be.revertedWith("Not owner nor approved");
    });

    it("Should allow approved address to transfer", async function () {
      await techExamNFT.connect(addr1).approve(addr2.address, 1);
      await techExamNFT.connect(addr2).transferToken(addr1.address, addr2.address, 1);

      expect(await techExamNFT.ownerOf(1)).to.equal(addr2.address);
    });
  });

  describe("Token Queries", function () {
    beforeEach(async function () {
      const tokenURIs = [
        "https://example.com/token/1",
        "https://example.com/token/2", 
        "https://example.com/token/3"
      ];
      const mintPrice = await techExamNFT.mintPrice();
      const totalPrice = mintPrice * BigInt(tokenURIs.length);
      
      await techExamNFT.connect(addr1).batchMint(addr1.address, tokenURIs, { value: totalPrice });
    });

    it("Should return tokens owned by address", async function () {
      const tokens = await techExamNFT.tokensOfOwner(addr1.address);
      expect(tokens.length).to.equal(3);
      expect(tokens[0]).to.equal(1);
      expect(tokens[1]).to.equal(2);
      expect(tokens[2]).to.equal(3);
    });

    it("Should return empty array for address with no tokens", async function () {
      const tokens = await techExamNFT.tokensOfOwner(addr2.address);
      expect(tokens.length).to.equal(0);
    });

    it("Should check if token exists", async function () {
      expect(await techExamNFT.exists(1)).to.be.true;
      expect(await techExamNFT.exists(999)).to.be.false;
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update mint price", async function () {
      const newPrice = ethers.parseEther("0.02");
      
      await expect(techExamNFT.setMintPrice(newPrice))
        .to.emit(techExamNFT, "MintPriceUpdated")
        .withArgs(ethers.parseEther("0.01"), newPrice);

      expect(await techExamNFT.mintPrice()).to.equal(newPrice);
    });

    it("Should not allow non-owner to update mint price", async function () {
      const newPrice = ethers.parseEther("0.02");
      
      await expect(
        techExamNFT.connect(addr1).setMintPrice(newPrice)
      ).to.be.revertedWithCustomError(techExamNFT, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw funds", async function () {
    
      const uri = "https://example.com/token/1";
      const mintPrice = await techExamNFT.mintPrice();
      await techExamNFT.connect(addr1).mint(addr1.address, uri, { value: mintPrice });

      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ethers.provider.getBalance(await techExamNFT.getAddress());

      const tx = await techExamNFT.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalOwnerBalance).to.equal(initialOwnerBalance + contractBalance - gasUsed);
      expect(await ethers.provider.getBalance(await techExamNFT.getAddress())).to.equal(0);
    });

    it("Should fail withdraw with no funds", async function () {
      await expect(techExamNFT.withdraw()).to.be.revertedWith("No funds to withdraw");
    });
  });

  describe("Supply Limits", function () {
    it("Should enforce max supply limit", async function () {
      const maxSupply = await techExamNFT.MAX_SUPPLY();
      expect(maxSupply).to.equal(10000);
    });
  });
});