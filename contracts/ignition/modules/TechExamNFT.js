const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TechExamNFTModule", (m) => {
  const techExamNFT = m.contract("TechExamNFT");

  return { techExamNFT };
});