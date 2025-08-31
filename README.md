# Full Stack Web3 Developer Tech Exam

## Project Overview

This is a complete full-stack Web3 application demonstrating blockchain integration across frontend, backend, and smart contract development. The application allows users to connect their Ethereum wallet, view their transaction history, and mint NFTs through a modern, responsive interface.

### Features Implemented

- **Frontend (React + TypeScript)**: Wallet connection, balance display, real transaction history, and NFT minting interface
- **Backend (Node.js + Express + TypeScript)**: RESTful API for Ethereum data (gas price, block number, account balance)
- **Smart Contracts (Solidity)**: ERC-721 NFT contract with minting and transfer capabilities
- **Full Integration**: Seamless interaction between all components with comprehensive error handling

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Ethers.js v6
- **Backend**: Node.js, Express.js, TypeScript, Ethers.js v6
- **Smart Contracts**: Solidity 0.8.24, Hardhat, OpenZeppelin
- **APIs**: Etherscan API for transaction history
- **Styling**: TailwindCSS with custom animations and gradients

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MetaMask** browser extension - [Install here](https://metamask.io/)
- **Git** - [Download here](https://git-scm.com/)
- **Etherscan API Key** (optional, for real transaction data) - [Get here](https://etherscan.io/register)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tech-exam
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd backend
npm install

# Install smart contract dependencies
cd contracts
npm install
```

### 3. Configure Environment Variables

#### Frontend Configuration (Optional - for real transaction data)
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` and add your Etherscan API key:
```
REACT_APP_ETHERSCAN_API_KEY=your_actual_api_key_here
REACT_APP_ETHERSCAN_API_URL=https://api.etherscan.io/api
```

> **Note**: If you don't configure the API key, the app will use sample transaction data with a clear indicator.

### 4. Compile Smart Contracts

```bash
cd contracts
npx hardhat compile
```

### 5. Run Tests (Optional)

```bash
# Test smart contracts
cd contracts
npx hardhat test

# The frontend and backend include error handling and don't require separate test runs for basic functionality
```

## Running the Application

### Option 1: Run All Services

1. **Start the Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Backend will run on http://localhost:5000
```

2. **Start the Frontend** (Terminal 2):
```bash
cd frontend
npm start
# Frontend will run on http://localhost:3000
```

3. **Start Local Blockchain** (Terminal 3 - Optional for local testing):
```bash
cd contracts
npx hardhat node
# Local blockchain runs on http://localhost:8545
```

### Option 2: Quick Demo (Frontend Only)

For a quick demonstration of the wallet features:

```bash
cd frontend
npm start
```

The frontend will work with Ethereum mainnet through your MetaMask connection.

## Usage Instructions

1. **Open the Application**: Navigate to `http://localhost:3000`

2. **Connect Your Wallet**: 
   - Click "Connect Wallet"
   - Approve the MetaMask connection
   - Your balance and transaction history will load

3. **View Transaction History**:
   - Real transaction data (if API key configured)
   - Sample data with clear labeling (if no API key)

4. **Mint NFTs** (requires local blockchain):
   - Switch to NFT Collection tab
   - Add a metadata URI
   - Click "Mint NFT" and approve the transaction

5. **Test Backend API** (optional):
   ```bash
   # Get Ethereum data for an address
   curl http://localhost:5000/api/ethereum/0xYourAddressHere
   
   # Health check
   curl http://localhost:5000/health
   ```

## API Endpoints

### Backend API

- `GET /health` - Health check
- `GET /api/ethereum/:address` - Get complete Ethereum data (gas, block, balance)
- `GET /api/ethereum/network/gas-price` - Current gas price
- `GET /api/ethereum/network/block-number` - Current block number
- `GET /api/ethereum/balance/:address` - Balance for specific address

## Architecture & Decisions

### Technical Decisions

1. **TypeScript Throughout**: Used TypeScript for both frontend and backend to ensure type safety and better development experience

2. **Ethers.js v6**: Latest version for optimal performance and modern async/await patterns

3. **Modular Architecture**: 
   - Frontend: Components, hooks, services separation
   - Backend: Routes, services, middleware separation
   - Contracts: Single responsibility principle

4. **Error Handling**: Comprehensive error handling at all levels with user-friendly messages

5. **Responsive Design**: Mobile-first approach with TailwindCSS for modern UI/UX

### Assumptions Made

1. **Network**: Primarily designed for Ethereum mainnet with MetaMask
2. **Browser**: Modern browsers with ES6+ support
3. **Wallet**: MetaMask as the primary wallet provider
4. **API Limits**: Etherscan free tier limits (5 calls/second) are sufficient for demo purposes

## Known Issues & Limitations

### Current Limitations

1. **Transaction History**: 
   - Uses sample data if Etherscan API key is not configured
   - Limited to last 10 transactions due to API response size

2. **NFT Minting**: 
   - Requires local Hardhat network for testing
   - Metadata URIs should point to valid JSON for full functionality

3. **Network Switching**: 
   - App assumes Ethereum mainnet
   - Manual network switching required in MetaMask for testing

4. **Mobile Responsiveness**: 
   - Optimized for desktop and tablet
   - Some advanced features may need scrolling on small mobile screens

### Potential Improvements

1. **Caching Layer**: Redis implementation for API response caching (Tier 2 bonus)
2. **Database Integration**: PostgreSQL for storing account balances (Tier 2 bonus)
3. **Testnet Deployment**: Deploy contracts to Sepolia/Goerli (Tier 3 bonus)
4. **Docker Containerization**: Full Docker setup with compose (Tier 4 bonus)

## Security Considerations

- All sensitive information (API keys, private keys) is excluded from Git
- Environment variables are used for configuration
- Input validation on both frontend and backend
- Rate limiting implemented on backend API
- Proper error handling without exposing system internals

## Support

For questions or issues:
1. Check the browser console for detailed error messages
2. Verify MetaMask is connected and on the correct network
3. Ensure all dependencies are installed correctly
4. Check that backend and frontend are running on correct ports

## Project Structure

```
tech-exam/
├── frontend/           # React TypeScript application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API and blockchain services
│   │   └── contracts/  # Contract ABIs and configurations
├── backend/            # Node.js Express API
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   ├── services/   # Business logic
│   │   ├── middleware/ # Express middleware
│   │   └── types/      # TypeScript type definitions
│   └── dist/           # Compiled JavaScript
├── contracts/          # Smart contracts
│   ├── contracts/      # Solidity source files
│   ├── test/           # Contract tests
│   └── artifacts/      # Compiled contracts 
└── README.md           # This file
```

---

**Built for the Full Stack Developer Technical Exam**