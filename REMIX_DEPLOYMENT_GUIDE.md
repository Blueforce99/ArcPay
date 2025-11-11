# 🚀 Smart Contract Deployment Guide - Remix IDE

## Option 1: Deploy via Remix (Easiest & Recommended)

Remix IDE is a browser-based Solidity IDE. You don't need any local setup to deploy!

### Step-by-Step Remix Deployment

#### 1. Open Remix IDE
Go to: **https://remix.ethereum.org**

#### 2. Create a New File
- Click the **"+"** icon in the File Explorer (left sidebar)
- Name it: `CrossBorderPayments.sol`
- Paste the entire contract code (see below)

#### 3. Compile the Contract
- Click on the **Solidity Compiler** icon (left sidebar, looks like a square with multiple layers)
- Select Compiler Version: **0.8.20**
- Click **Compile CrossBorderPayments.sol**
- You should see a green checkmark

#### 4. Deploy to Arc Testnet
- Click on the **Deploy & Run Transactions** icon (left sidebar, looks like a rocket)
- Under "Environment", select **Injected Web3**
  - This will prompt you to connect MetaMask
  - **Make sure you're on Arc Testnet (Chain ID: 5042002)**
  
#### 5. Get Testnet Funds
Before deploying, you need ETH for gas fees:
- Go to: **https://faucet.circle.com**
- Connect your wallet
- Request testnet ETH
- Wait for confirmation (~1-2 minutes)

#### 6. Deploy Contract
- Under "Contract", keep **CrossBorderPayments** selected
- In the "Deploy" section, you'll see a field for the constructor parameter
- Enter the **Fee Collector Address** (use your wallet address or leave as deployer)
- Click the orange **"Deploy"** button
- Approve the transaction in MetaMask
- **Copy the contract address** from the transaction receipt

---

## Contract Code (Copy This to Remix)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CrossBorderPayments
 * @dev Enables cross-border remittances and payouts on Arc network
 * Supports USDC and other stablecoins with real-time settlement
 */
contract CrossBorderPayments is Ownable, ReentrancyGuard, Pausable {
    // ==================== Structs ====================
    
    struct Payment {
        uint256 id;
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint256 feeAmount;
        string recipientCountry;
        string senderCountry;
        uint256 timestamp;
        PaymentStatus status;
        string paymentMethod;
    }

    struct ExchangeRate {
        address token;
        uint256 rate;
        uint256 lastUpdated;
        bool isActive;
    }

    struct Recipient {
        address wallet;
        string country;
        string bankAccount;
        string bankCode;
        bool isVerified;
        uint256 totalReceived;
    }

    // ==================== Enums ====================
    
    enum PaymentStatus {
        Pending,
        Processing,
        Settled,
        Completed,
        Failed,
        Cancelled
    }

    // ==================== State Variables ====================
    
    mapping(uint256 => Payment) public payments;
    mapping(address => ExchangeRate) public exchangeRates;
    mapping(address => Recipient) public recipients;
    mapping(address => uint256[]) public userPayments;
    mapping(address => uint256) public userFeeBalance;

    uint256 public paymentCounter;
    uint256 public feePercentage;
    uint256 public minPaymentAmount;
    uint256 public maxPaymentAmount;

    address[] public supportedTokens;
    address public feeCollector;

    // ==================== Events ====================
    
    event PaymentInitiated(
        uint256 indexed paymentId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        address token,
        string recipientCountry
    );

    event PaymentStatusChanged(
        uint256 indexed paymentId,
        PaymentStatus newStatus,
        uint256 timestamp
    );

    event PaymentCompleted(
        uint256 indexed paymentId,
        address indexed recipient,
        uint256 amount,
        uint256 feeAmount
    );

    event ExchangeRateUpdated(
        address indexed token,
        uint256 newRate,
        uint256 timestamp
    );

    event RecipientVerified(
        address indexed recipient,
        string country
    );

    event FeeCollectorUpdated(address indexed newCollector);
    event FeePercentageUpdated(uint256 newPercentage);

    // ==================== Constructor ====================
    
    constructor(address _feeCollector) {
        feeCollector = _feeCollector;
        feePercentage = 50; // 0.5%
        minPaymentAmount = 100e6; // 100 USDC (6 decimals)
        maxPaymentAmount = 100000e6; // 100k USDC
        paymentCounter = 1;
    }

    // ==================== Core Functions ====================
    
    function initiatePayment(
        address _recipient,
        address _token,
        uint256 _amount,
        string memory _recipientCountry,
        string memory _senderCountry,
        string memory _paymentMethod
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount >= minPaymentAmount, "Amount below minimum");
        require(_amount <= maxPaymentAmount, "Amount exceeds maximum");
        require(exchangeRates[_token].isActive, "Token not supported");

        require(
            IERC20(_token).transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        uint256 feeAmount = (_amount * feePercentage) / 10000;
        uint256 recipientAmount = _amount - feeAmount;

        uint256 paymentId = paymentCounter++;
        Payment storage payment = payments[paymentId];
        payment.id = paymentId;
        payment.sender = msg.sender;
        payment.recipient = _recipient;
        payment.token = _token;
        payment.amount = recipientAmount;
        payment.feeAmount = feeAmount;
        payment.recipientCountry = _recipientCountry;
        payment.senderCountry = _senderCountry;
        payment.timestamp = block.timestamp;
        payment.status = PaymentStatus.Pending;
        payment.paymentMethod = _paymentMethod;

        userPayments[msg.sender].push(paymentId);
        userFeeBalance[feeCollector] += feeAmount;

        emit PaymentInitiated(
            paymentId,
            msg.sender,
            _recipient,
            recipientAmount,
            _token,
            _recipientCountry
        );

        return paymentId;
    }

    function completePayment(uint256 _paymentId) external nonReentrant returns (bool) {
        Payment storage payment = payments[_paymentId];
        require(payment.id != 0, "Payment not found");
        require(payment.status == PaymentStatus.Pending || payment.status == PaymentStatus.Processing, "Invalid status");

        payment.status = PaymentStatus.Completed;

        require(
            IERC20(payment.token).transfer(payment.recipient, payment.amount),
            "Transfer to recipient failed"
        );

        recipients[payment.recipient].totalReceived += payment.amount;

        emit PaymentStatusChanged(_paymentId, PaymentStatus.Completed, block.timestamp);
        emit PaymentCompleted(_paymentId, payment.recipient, payment.amount, payment.feeAmount);

        return true;
    }

    function batchCompletePayments(uint256[] calldata _paymentIds) external onlyOwner {
        for (uint256 i = 0; i < _paymentIds.length; i++) {
            completePayment(_paymentIds[i]);
        }
    }

    function cancelPayment(uint256 _paymentId) external nonReentrant returns (bool) {
        Payment storage payment = payments[_paymentId];
        require(payment.id != 0, "Payment not found");
        require(msg.sender == payment.sender || msg.sender == owner(), "Unauthorized");
        require(payment.status == PaymentStatus.Pending, "Cannot cancel completed payment");

        payment.status = PaymentStatus.Cancelled;

        uint256 refundAmount = payment.amount + payment.feeAmount;
        userFeeBalance[feeCollector] -= payment.feeAmount;

        require(
            IERC20(payment.token).transfer(payment.sender, refundAmount),
            "Refund failed"
        );

        emit PaymentStatusChanged(_paymentId, PaymentStatus.Cancelled, block.timestamp);

        return true;
    }

    // ==================== Exchange Rate Functions ====================
    
    function setExchangeRate(
        address _token,
        uint256 _rate
    ) external onlyOwner {
        require(_token != address(0), "Invalid token");
        exchangeRates[_token].token = _token;
        exchangeRates[_token].rate = _rate;
        exchangeRates[_token].lastUpdated = block.timestamp;
        exchangeRates[_token].isActive = true;

        if (!_isTokenSupported(_token)) {
            supportedTokens.push(_token);
        }

        emit ExchangeRateUpdated(_token, _rate, block.timestamp);
    }

    function disableToken(address _token) external onlyOwner {
        require(exchangeRates[_token].isActive, "Token already disabled");
        exchangeRates[_token].isActive = false;
    }

    // ==================== Recipient Functions ====================
    
    function verifyRecipient(
        address _recipient,
        string memory _country,
        string memory _bankAccount,
        string memory _bankCode
    ) external onlyOwner {
        recipients[_recipient].wallet = _recipient;
        recipients[_recipient].country = _country;
        recipients[_recipient].bankAccount = _bankAccount;
        recipients[_recipient].bankCode = _bankCode;
        recipients[_recipient].isVerified = true;

        emit RecipientVerified(_recipient, _country);
    }

    // ==================== Admin Functions ====================
    
    function setFeePercentage(uint256 _newPercentage) external onlyOwner {
        require(_newPercentage <= 1000, "Fee too high");
        feePercentage = _newPercentage;
        emit FeePercentageUpdated(_newPercentage);
    }

    function setPaymentLimits(
        uint256 _minAmount,
        uint256 _maxAmount
    ) external onlyOwner {
        require(_minAmount < _maxAmount, "Invalid limits");
        minPaymentAmount = _minAmount;
        maxPaymentAmount = _maxAmount;
    }

    function setFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(_newCollector);
    }

    function withdrawFees(address _token) external nonReentrant {
        require(msg.sender == feeCollector, "Not authorized");
        uint256 amount = userFeeBalance[msg.sender];
        require(amount > 0, "No fees to withdraw");

        userFeeBalance[msg.sender] = 0;
        require(IERC20(_token).transfer(msg.sender, amount), "Withdrawal failed");
    }

    // ==================== View Functions ====================
    
    function getPayment(uint256 _paymentId) external view returns (Payment memory) {
        return payments[_paymentId];
    }

    function getUserPayments(address _user) external view returns (uint256[] memory) {
        return userPayments[_user];
    }

    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    function getExchangeRate(address _token) external view returns (uint256) {
        require(exchangeRates[_token].isActive, "Token not supported");
        return exchangeRates[_token].rate;
    }

    function getRecipient(address _recipient) external view returns (Recipient memory) {
        return recipients[_recipient];
    }

    // ==================== Internal Functions ====================
    
    function _isTokenSupported(address _token) internal view returns (bool) {
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            if (supportedTokens[i] == _token) {
                return true;
            }
        }
        return false;
    }

    // ==================== Emergency Functions ====================
    
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        require(IERC20(_token).transfer(msg.sender, _amount), "Transfer failed");
    }
}
```

---

## After Deployment

### 1. Copy the Contract Address
- In Remix, after successful deployment, you'll see the contract address
- Copy it and save somewhere safe
- Format: `0x...` (42 characters including 0x)

### 2. Update Frontend Configuration
Create/update `frontend/.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<your_deployed_contract_address>
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=5042002
NEXT_PUBLIC_USDC_ADDRESS=0xA0D71B9877f44C744546D649147FfD63A7eE2D6D
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.arc.network
```

### 3. Verify Contract (Optional)
- Go to: **https://testnet.arcscan.app**
- Search for your contract address
- You can verify the source code there for transparency

---

## Option 2: Deploy via Hardhat (if you prefer CLI)

If you want to deploy locally:

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Add your private key to .env
# PRIVATE_KEY=your_private_key_without_0x

# 4. Deploy to Arc Testnet
npm run deploy:testnet
```

---

## Remix IDE Features

### Useful Icons in Left Sidebar:
1. **File Explorer** - Manage files
2. **Search** - Find code
3. **Solidity Compiler** - Compile contracts
4. **Deploy & Run** - Deploy to networks
5. **Debugger** - Debug transactions
6. **Testing** - Run tests

### To Add OpenZeppelin Imports:
If Remix doesn't automatically find OpenZeppelin contracts, add this at the top:
```solidity
// Import from npm (Remix handles this automatically)
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
```

---

## Troubleshooting

### "Connection rejected" or "MetaMask not detected"
- Ensure MetaMask is installed
- Make sure you're connected to Arc Testnet (Chain ID: 5042002)
- Add Arc Testnet to MetaMask manually if needed:
  - Network Name: Arc Testnet
  - RPC URL: https://rpc.testnet.arc.network
  - Chain ID: 5042002
  - Currency: ETH

### "Insufficient funds for gas"
- Get testnet ETH from: https://faucet.circle.com
- Wait for confirmation (~1-2 minutes)
- Reload Remix page and try again

### "Contract verification failed"
- Make sure Compiler Version matches (0.8.20)
- Check the contract code matches exactly
- Verify on ArcScan: https://testnet.arcscan.app

### Remix shows "Yellow warning"
- This is fine, it's just optimization suggestions
- Your contract will still deploy and work

---

## Next Steps After Deployment

1. ✅ Contract deployed to Arc Testnet
2. ✅ Have your contract address
3. ✅ Update frontend with contract address
4. ✅ Test the frontend
5. ✅ Deploy to Vercel

---

## Quick Reference

| Item | Value |
|------|-------|
| **IDE** | https://remix.ethereum.org |
| **Testnet RPC** | https://rpc.testnet.arc.network |
| **Explorer** | https://testnet.arcscan.app |
| **Faucet** | https://faucet.circle.com |
| **Chain ID** | 5042002 |
| **Compiler** | Solidity 0.8.20 |
| **Gas for Deployment** | ~1-2 million (depends on size) |

---

🎉 **Ready to deploy!** Head to Remix IDE and start deploying!
