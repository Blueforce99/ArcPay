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
    
    constructor(address _feeCollector, address _usdcToken) Ownable(msg.sender) {
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_usdcToken != address(0), "Invalid USDC token");
        
        feeCollector = _feeCollector;
        feePercentage = 50; // 0.5%
        minPaymentAmount = 1e5; // 0.1 USDC (6 decimals)
        maxPaymentAmount = 100000e6; // 100k USDC
        paymentCounter = 1;
        
        // Auto-register USDC on deployment
        exchangeRates[_usdcToken].token = _usdcToken;
        exchangeRates[_usdcToken].rate = 1000000; // 1 USDC = 1 USD
        exchangeRates[_usdcToken].lastUpdated = block.timestamp;
        exchangeRates[_usdcToken].isActive = true;
        supportedTokens.push(_usdcToken);
        
        emit ExchangeRateUpdated(_usdcToken, 1000000, block.timestamp);
    }

    // ==================== Core Functions ====================
    
    /**
     * @dev Initiate a cross-border payment
     */
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

    /**
     * @dev Complete a payment and transfer funds to recipient
     */
    function completePayment(uint256 _paymentId) public nonReentrant returns (bool) {
        Payment storage payment = payments[_paymentId];
        require(payment.id != 0, "Payment not found");
        require(
            payment.status == PaymentStatus.Pending || payment.status == PaymentStatus.Processing,
            "Invalid status"
        );

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

    /**
     * @dev Process multiple payments in batch
     */
    function batchCompletePayments(uint256[] calldata _paymentIds) external onlyOwner {
        for (uint256 i = 0; i < _paymentIds.length; i++) {
            completePayment(_paymentIds[i]);
        }
    }

    /**
     * @dev Cancel a payment
     */
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
    
    /**
     * @dev Add or update exchange rate for a token
     */
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

    /**
     * @dev Disable a token
     */
    function disableToken(address _token) external onlyOwner {
        require(exchangeRates[_token].isActive, "Token already disabled");
        exchangeRates[_token].isActive = false;
    }

    // ==================== Recipient Functions ====================
    
    /**
     * @dev Verify a recipient wallet
     */
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
    
    /**
     * @dev Update fee percentage
     */
    function setFeePercentage(uint256 _newPercentage) external onlyOwner {
        require(_newPercentage <= 1000, "Fee too high"); // Max 10%
        feePercentage = _newPercentage;
        emit FeePercentageUpdated(_newPercentage);
    }

    /**
     * @dev Update payment limits
     */
    function setPaymentLimits(
        uint256 _minAmount,
        uint256 _maxAmount
    ) external onlyOwner {
        require(_minAmount < _maxAmount, "Invalid limits");
        minPaymentAmount = _minAmount;
        maxPaymentAmount = _maxAmount;
    }

    /**
     * @dev Update fee collector address
     */
    function setFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(_newCollector);
    }

    /**
     * @dev Withdraw accumulated fees
     */
    function withdrawFees(address _token) external nonReentrant {
        require(msg.sender == feeCollector, "Not authorized");
        uint256 amount = userFeeBalance[msg.sender];
        require(amount > 0, "No fees to withdraw");

        userFeeBalance[msg.sender] = 0;
        require(IERC20(_token).transfer(msg.sender, amount), "Withdrawal failed");
    }

    // ==================== View Functions ====================
    
    /**
     * @dev Get payment details
     */
    function getPayment(uint256 _paymentId) external view returns (Payment memory) {
        return payments[_paymentId];
    }

    /**
     * @dev Get user's payment history
     */
    function getUserPayments(address _user) external view returns (uint256[] memory) {
        return userPayments[_user];
    }

    /**
     * @dev Get supported tokens
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    /**
     * @dev Get exchange rate for token
     */
    function getExchangeRate(address _token) external view returns (uint256) {
        require(exchangeRates[_token].isActive, "Token not supported");
        return exchangeRates[_token].rate;
    }

    /**
     * @dev Get recipient info
     */
    function getRecipient(address _recipient) external view returns (Recipient memory) {
        return recipients[_recipient];
    }

    // ==================== Internal Functions ====================
    
    /**
     * @dev Check if token is supported
     */
    function _isTokenSupported(address _token) internal view returns (bool) {
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            if (supportedTokens[i] == _token) {
                return true;
            }
        }
        return false;
    }

    // ==================== Emergency Functions ====================
    
    /**
     * @dev Pause contract in case of emergency
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency token withdrawal
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        require(IERC20(_token).transfer(msg.sender, _amount), "Transfer failed");
    }
}
