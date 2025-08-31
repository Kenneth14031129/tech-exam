const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying TechExamNFT contract...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  const TechExamNFT = await ethers.getContractFactory("TechExamNFT");
  const techExamNFT = await TechExamNFT.deploy();
  
  await techExamNFT.waitForDeployment();
  const contractAddress = await techExamNFT.getAddress();
  
  console.log("✅ TechExamNFT deployed to:", contractAddress);
  console.log("📋 Contract details:");
  console.log("   - Name:", await techExamNFT.name());
  console.log("   - Symbol:", await techExamNFT.symbol());
  console.log("   - Max Supply:", await techExamNFT.MAX_SUPPLY());
  console.log("   - Mint Price:", ethers.formatEther(await techExamNFT.mintPrice()), "ETH");
  
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: await ethers.provider.getNetwork(),
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };
  
  console.log("📄 Deployment complete! Contract ready for interaction.");
  console.log("🔗 Add to your frontend:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });