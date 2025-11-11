const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Arc Cross-Border Payments deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying from account:", deployer.address);

  // Get account balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Set fee collector address (can be the deployer or a specific address)
  const feeCollector = deployer.address;
  console.log("💸 Fee collector:", feeCollector);

  // Deploy CrossBorderPayments contract
  console.log("\n📦 Deploying CrossBorderPayments contract...");
  const CrossBorderPayments = await hre.ethers.getContractFactory("CrossBorderPayments");
  const crossBorderPayments = await CrossBorderPayments.deploy(feeCollector);
  
  await crossBorderPayments.waitForDeployment();
  const contractAddress = await crossBorderPayments.getAddress();

  console.log("✅ CrossBorderPayments deployed to:", contractAddress);

  // Set up initial exchange rates for supported tokens
  console.log("\n💱 Setting up exchange rates...");

  // Mock token addresses (replace with actual Arc token addresses)
  const mockTokens = {
    USDC: "0x1234567890123456789012345678901234567890",
    USDT: "0x2345678901234567890123456789012345678901",
    DAI: "0x3456789012345678901234567890123456789012",
  };

  for (const [symbol, tokenAddress] of Object.entries(mockTokens)) {
    try {
      const tx = await crossBorderPayments.setExchangeRate(tokenAddress, 10000); // 1:1 rate
      await tx.wait();
      console.log(`✅ Set rate for ${symbol}:`, tokenAddress);
    } catch (error) {
      console.log(`⚠️ Skipping ${symbol}: ${error.message}`);
    }
  }

  // Verify contract on block explorer (if needed)
  console.log("\n📋 Contract Deployment Summary:");
  console.log("================================");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", (await hre.ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("Deployer:", deployer.address);
  console.log("Fee Collector:", feeCollector);
  console.log("Default Fee:", "0.5%");
  console.log("Min Amount:", "100 tokens");
  console.log("Max Amount:", "100,000 tokens");

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: (await hre.ethers.provider.getNetwork()).name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    feeCollector,
    timestamp: new Date().toISOString(),
    supportedTokens: mockTokens,
  };

  const fs = require("fs");
  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment successful!");
  console.log("📄 Deployment info saved to deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
