// Script to verify and fix the contract if needed
// This checks if USDC is registered, and if not, registers it

const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const CONTRACT_ADDRESS = "0x072326C6a2194FE42Ed29Bc789F044934277E173";
  const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
  
  console.log("🔍 Verifying contract state...\n");
  
  // Get contract ABI
  const ABI = [
    {
      inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
      name: 'getExchangeRate',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getSupportedTokens',
      outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: '_token', type: 'address' },
        { internalType: 'uint256', name: '_rate', type: 'uint256' },
      ],
      name: 'setExchangeRate',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  try {
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("📋 Owner address:", signer.address);
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    
    // Check supported tokens
    console.log("\n📊 Checking supported tokens...");
    const supportedTokens = await contract.getSupportedTokens();
    console.log("   Supported tokens:", supportedTokens);
    
    // Check if USDC is in the list
    const isUSDAAddressInList = supportedTokens.some(
      (addr) => addr.toLowerCase() === USDC_ADDRESS.toLowerCase()
    );
    
    if (isUSDAAddressInList) {
      console.log("✅ USDC is registered!");
      
      // Try to get the exchange rate
      try {
        const rate = await contract.getExchangeRate(USDC_ADDRESS);
        console.log("📈 USDC Exchange Rate:", ethers.formatUnits(rate, 0));
      } catch (err) {
        console.log("⚠️  Could not fetch exchange rate:", err.message);
      }
    } else {
      console.log("❌ USDC is NOT registered!");
      console.log("\n🔧 Registering USDC now...");
      
      // Register USDC
      const tx = await contract.setExchangeRate(USDC_ADDRESS, "1000000");
      console.log("📝 Transaction:", tx.hash);
      console.log("⏳ Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("✅ USDC registered!");
      console.log("📝 Receipt:", receipt.hash);
    }
    
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
