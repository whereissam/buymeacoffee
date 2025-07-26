# **Give Me Coffee Plugin: Product Requirements Document, Technical Specification, and High-Level Plan**

## **1\. Product Requirements Document (PRD)**

### **1.1. Title**

Decentralized "Give Me Coffee" Plugin on Base Chain

### **1.2. Version**

1.1

### **1.3. Date**

July 25, 2025

### **1.4. Author**

Gemini

### **1.5. Introduction**

The "Give Me Coffee" plugin aims to provide content creators, developers, and individuals with a simple, transparent, and decentralized way to receive micro-donations or "tips" from their audience directly on their websites or repositories. Leveraging the Base blockchain, it offers a low-cost, fast, and secure alternative to traditional payment methods, embodying the spirit of direct support in the Web3 ecosystem.

### **1.6. Goals**

* **Enable Direct Support:** Allow supporters to easily send cryptocurrency (ETH on Base) to creators.  
* **Decentralization:** Operate without intermediaries, ensuring transparency and censorship resistance.  
* **Ease of Integration:** Provide a simple, embeddable widget that can be added to any website or GitHub repository README.  
* **Low Fees & Fast Transactions:** Utilize the Base chain to ensure minimal transaction costs and quick confirmations.  
* **Transparency:** All transactions are recorded on the public Base blockchain.

### **1.7. Audience**

* **Creators/Receivers:** Bloggers, open-source developers, artists, streamers, writers, and anyone who creates content and wishes to receive direct financial support from their audience.  
* **Supporters/Donors:** Individuals who want to financially support creators using cryptocurrency.

### **1.8. Features**

#### **1.8.1. Core Functionality**

* **Receive ETH:** Users can send ETH (the native currency of Base) to the creator's associated smart contract.  
* **Configurable Donation Amounts:** Allow creators to set suggested donation amounts (e.g., 0.001 ETH for a small coffee, 0.005 ETH for a large coffee).  
* **Custom Message (Optional):** Supporters can include a short text message with their donation.

#### **1.8.2. Integration**

* **Embeddable Widget:** A small, responsive HTML/JavaScript snippet that can be easily embedded into any webpage.  
* **Repository README Integration:** Instructions and potentially a simplified badge/link for GitHub READMEs.

#### **1.8.3. User Experience (Supporter)**

* **Simple Interface:** A clear button or form to initiate a donation.  
* **Wallet Connection:** Seamless connection to popular Web3 wallets (e.g., MetaMask, WalletConnect).  
* **Network Detection:** Automatically detect if the user's wallet is on the Base network and prompt to switch if not.  
* **Transaction Feedback:** Clear status updates during and after the transaction (e.g., "Waiting for confirmation," "Transaction successful\!").

#### **1.8.4. Creator Experience**

* **Smart Contract Deployment:** Guidance on deploying their own instance of the "Give Me Coffee" smart contract.  
* **Withdrawal Functionality:** A secure method for the creator (owner of the contract) to withdraw accumulated ETH.

### **1.9. Non-Functional Requirements**

* **Security:**  
  * Smart contract code must be audited (post-MVP).  
  * Frontend must prevent common Web vulnerabilities (XSS, CSRF).  
* **Performance:**  
  * Fast transaction processing, leveraging Base's capabilities.  
  * Responsive UI with minimal loading times.  
* **Scalability:**  
  * The smart contract should be efficient enough to handle a high volume of donations.  
  * The frontend widget should be lightweight.  
* **Usability:**  
  * Intuitive and user-friendly interface for both creators and supporters.  
  * Clear instructions and error messages.  
* **Compatibility:**  
  * Browser Compatibility: Chrome, Firefox, Edge, Safari.  
  * Wallet Compatibility: MetaMask, WalletConnect (for broader mobile support).  
  * Responsive Design: Works well on desktop and mobile devices.

### **1.10. Future Considerations (Post-MVP)**

* **ERC-20 Token Support:** Allow donations in other tokens (e.g., USDC on Base).  
* **NFT Tipping:** Ability to send a small, unique NFT as a "thank you" for a donation.  
* **Creator Dashboard:** A simple web interface for creators to view donation history, total received, and manage withdrawals.  
* **Customization Options:** More styling options for the widget (colors, fonts).  
* **Analytics:** Basic on-chain analytics for donations.  
* **Multi-chain Support:** Expand to other EVM-compatible chains (e.g., Optimism, Arbitrum).  
* **Gasless Transactions:** Explore meta-transactions for a gasless user experience.

## **2\. Technical Specification**

### **2.1. Architecture Overview**

The "Give Me Coffee" plugin will consist of two primary components:

1. **Smart Contract (on Base Chain):** Written in Solidity, this contract will handle the secure reception and storage of ETH donations, and allow the owner to withdraw funds.  
2. **Frontend Widget:** A lightweight React application, built with Vite, that interacts with the smart contract via a Web3 library (e.g., Ethers.js or Web3.js) and the user's browser-injected wallet.

graph TD  
    A\[Supporter's Browser\] \--\> B(Frontend Widget: React/Vite/TailwindCSS);  
    B \--\> C(Web3 Library: Ethers.js/Web3.js);  
    C \--\> D(Browser Wallet: MetaMask/WalletConnect);  
    D \-- Transaction Request \--\> E(Base Blockchain);  
    E \-- Interaction \--\> F(Give Me Coffee Smart Contract);  
    F \-- ETH Flow \--\> G\[Creator's Wallet\];  
    G \-- Withdrawal Initiated By Creator \--\> F;

### **2.2. Smart Contract Details (Solidity)**

* **Language:** Solidity (latest stable version, e.g., 0.8.x)  
* **Chain:** Base (EVM compatible)  
* **Key Variables:**  
  * address public owner;: The address of the creator who deployed the contract.  
  * uint256 public totalDonations;: Tracks the total ETH received by this contract.  
* **Constructor:**  
  * constructor(): Sets the owner to the address that deploys the contract.  
* **Functions:**  
  * receive() external payable: Fallback function to receive ETH. This is the primary entry point for donations. It should increment totalDonations and emit an event.  
  * function donate(string memory \_message) external payable: Allows supporters to send ETH and include an optional message.  
    * \_message: A string for the supporter's message (e.g., "Great work\!").  
    * Requires msg.value \> 0\.  
    * Emits DonationReceived event.  
  * function withdraw() external onlyOwner: Allows the owner to withdraw all accumulated ETH from the contract.  
    * onlyOwner: Modifier to ensure only the contract owner can call this function.  
    * Transfers address(this).balance to the owner.  
    * Resets totalDonations to 0 (or simply transfers balance, leaving totalDonations as a historical record).  
    * Emits WithdrawalMade event.  
* **Modifiers:**  
  * modifier onlyOwner(): Restricts function access to the contract owner.  
* **Events:**  
  * event DonationReceived(address indexed donor, uint256 amount, string message, uint256 timestamp);  
  * event WithdrawalMade(address indexed recipient, uint256 amount, uint256 timestamp);

### **2.3. Frontend Widget Details (React, Vite, Tailwind CSS)**

* **Technology Stack:** React, Vite (for build tooling), Tailwind CSS (for styling), Ethers.js (or Web3.js)  
* **Conceptual React Component Structure:**  
  // App.jsx (Main Component)  
  import React, { useState, useEffect } from 'react';  
  import { ethers } from 'ethers'; // Or web3.js  
  // ... other imports for components like WalletConnectButton, DonationForm

  function App() {  
      const \[provider, setProvider\] \= useState(null);  
      const \[signer, setSigner\] \= useState(null);  
      const \[userAddress, setUserAddress\] \= useState(null);  
      const \[network, setNetwork\] \= useState(null);  
      const \[statusMessage, setStatusMessage\] \= useState('');

      // Contract ABI and Address (replace with actual deployed values)  
      const contractABI \= \[...\]; // Your smart contract ABI  
      const contractAddress \= '0x...'; // Your deployed contract address

      // useEffect for wallet connection and network checks  
      useEffect(() \=\> {  
          // Logic for connecting wallet, checking network, setting provider/signer/userAddress  
          // Add event listeners for chainChanged, accountsChanged  
      }, \[\]);

      const connectWallet \= async () \=\> { /\* ... \*/ };  
      const checkNetwork \= async () \=\> { /\* ... \*/ };  
      const sendDonation \= async (amount, message) \=\> { /\* ... \*/ };

      return (  
          \<div id="coffee-plugin" className="coffee-plugin-container p-6 bg-white rounded-xl shadow-lg max-w-sm mx-auto my-8"\>  
              \<h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center"\>Buy Me a Coffee\! ☕\</h2\>  
              {\!userAddress ? (  
                  \<button  
                      onClick={connectWallet}  
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"  
                  \>  
                      Connect Wallet  
                  \</button\>  
              ) : (  
                  \<\>  
                      \<p className="text-center text-gray-600 mb-4"\>Connected: {userAddress.substring(0, 6)}...{userAddress.substring(userAddress.length \- 4)}\</p\>  
                      {network && network.chainId \!== 8453 && network.chainId \!== 84532 ? ( // Base Mainnet: 8453, Base Sepolia: 84532  
                          \<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"\>  
                              \<strong className="font-bold"\>Wrong Network\!\</strong\>  
                              \<span className="block sm:inline"\> Please switch to Base.\</span\>  
                              \<button onClick={() \=\> checkNetwork()} className="ml-2 underline"\>Switch\</button\>  
                          \</div\>  
                      ) : (  
                          \<\>  
                              \<div className="mb-4"\>  
                                  \<label htmlFor="coffee-amount" className="block text-sm font-medium text-gray-700"\>Amount (ETH):\</label\>  
                                  \<select id="coffee-amount" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"\>  
                                      \<option value="0.001"\>0.001 ETH (Small Coffee)\</option\>  
                                      \<option value="0.003"\>0.003 ETH (Medium Coffee)\</option\>  
                                      \<option value="0.005"\>0.005 ETH (Large Coffee)\</option\>  
                                      \<option value="0.01"\>0.01 ETH (Meal)\</option\>  
                                  \</select\>  
                              \</div\>  
                              \<div className="mb-4"\>  
                                  \<label htmlFor="coffee-message" className="block text-sm font-medium text-gray-700"\>Your Message (optional):\</label\>  
                                  \<input type="text" id="coffee-message" placeholder="Thanks for the great content\!" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" maxLength="100"/\>  
                              \</div\>  
                              \<button  
                                  onClick={() \=\> sendDonation(document.getElementById('coffee-amount').value, document.getElementById('coffee-message').value)}  
                                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"  
                              \>  
                                  Send Coffee  
                              \</button\>  
                          \</\>  
                      )}  
                  \</\>  
              )}  
              \<div id="status-message" className="mt-4 text-center text-sm text-gray-600"\>{statusMessage}\</div\>  
          \</div\>  
      );  
  }

  export default App;

* **CSS Styling:**  
  * Utilize Tailwind CSS for responsive and modern design.  
  * Ensure the widget is visually appealing and fits well into various website designs.  
  * Rounded corners, subtle shadows, "coffee" themed colors (browns, creams, dark blues).  
* **JavaScript Logic (within React Components):**  
  * **Initialization:**  
    * Use React useState and useEffect hooks for managing state (provider, signer, user address, network, status).  
    * Define the Base Sepolia (for testing) and Base Mainnet chain IDs.  
    * Define the ABI (Application Binary Interface) of the deployed smart contract.  
    * Define the deployed smart contract address (this will be unique for each creator).  
  * **Wallet Connection (connectWallet()):**  
    * Checks for window.ethereum (MetaMask). If not found, prompts user to install.  
    * If found, requests eth\_requestAccounts to connect.  
    * Initializes ethers.BrowserProvider and ethers.Signer.  
    * Updates userAddress, provider, signer states.  
  * **Network Check (checkNetwork()):**  
    * Verifies if the connected wallet is on the Base network (mainnet or testnet).  
    * If not, prompts the user to switch networks using wallet\_switchEthereumChain.  
    * Updates network state.  
  * **Sending Donation (sendDonation() function):**  
    * Called when "Send Coffee" button is clicked.  
    * Gets selected amount and message from React state or refs.  
    * Connects to the smart contract using the Signer.  
    * Calls the donate() function on the smart contract, passing the ETH amount and message.  
    * Displays transaction status (pending, confirmed, failed) using statusMessage state.  
    * Handles potential errors (e.g., user rejects transaction, insufficient funds).  
  * **Event Listeners:**  
    * Use React onClick for button events.  
    * Use useEffect to attach chainChanged and accountsChanged listeners from window.ethereum to update React state.  
  * **Error Handling:**  
    * Use try-catch blocks for all asynchronous blockchain interactions.  
    * Update statusMessage state with user-friendly error messages.

### **2.4. Deployment**

* **Smart Contract:**  
  * **Development:** Hardhat or Foundry (recommended for local testing and deployment scripts).  
  * **Deployment:** Deploy to Base Sepolia (testnet) for testing, then to Base Mainnet for production. Tools like Remix, Hardhat, or Foundry can be used.  
* **Frontend Widget:**  
  * The React application, built with Vite, will generate static HTML, CSS, and JavaScript files.  
  * For decentralized hosting: IPFS (e.g., via Pinata, Web3.Storage).  
  * For traditional hosting: Vercel, Netlify, GitHub Pages, **Walrus**.

## **3\. High-Level Plan**

### **Phase 1: Research & Setup (1 week)**

* **Objective:** Understand Base chain specifics and set up the development environment.  
* **Tasks:**  
  * Deep dive into Base chain documentation (gas fees, block times, network IDs).  
  * Set up a Solidity development environment (Node.js, Hardhat/Foundry, VS Code with Solidity extensions).  
  * Set up a React/Vite development environment (Node.js, npm/yarn, Vite, React, Tailwind CSS).  
  * Familiarize with Ethers.js/Web3.js for frontend interaction.  
  * Obtain test ETH for Base Sepolia.

### **Phase 2: Smart Contract Development (2 weeks)**

* **Objective:** Develop and thoroughly test the core "Give Me Coffee" smart contract.  
* **Tasks:**  
  * Write Solidity code for GiveMeCoffee.sol with donate, withdraw, ownerOnly modifier, and events.  
  * Develop comprehensive unit tests for the smart contract (using Hardhat/Foundry testing frameworks).  
  * Refine contract logic based on test results.  
  * Deploy the contract to Base Sepolia testnet.

### **Phase 3: Frontend Widget Development (2-3 weeks)**

* **Objective:** Build a functional and user-friendly embeddable widget using React and Vite.  
* **Tasks:**  
  * Initialize a new React project using Vite.  
  * Configure Tailwind CSS for the React project.  
  * Develop React components for wallet connection, donation form, and status display.  
  * Implement React state management for UI updates.  
  * Write JavaScript logic using Ethers.js to interact with the deployed smart contract (send ETH, messages).  
  * Add real-time status updates and robust error handling within React components.  
  * Connect the widget to the Base Sepolia deployed contract for testing.  
  * Develop clear documentation for embedding the widget.

### **Phase 4: Testing & Auditing (2 weeks)**

* **Objective:** Ensure the plugin is robust, secure, and bug-free.  
* **Tasks:**  
  * **Internal Testing:**  
    * Test all functionalities across different browsers and wallets.  
    * Test edge cases (e.g., no wallet, wrong network, insufficient funds, large amounts).  
    * Perform user acceptance testing (UAT) with a small group of testers.  
  * **Security Audit (Highly Recommended for Mainnet Deployment):**  
    * Engage a professional blockchain security firm to audit the smart contract code for vulnerabilities. (This is crucial before deploying to mainnet with real funds).

### **Phase 5: Deployment & Documentation (1 week)**

* **Objective:** Deploy the plugin to Base Mainnet and provide comprehensive resources.  
* **Tasks:**  
  * Deploy the final, audited smart contract to Base Mainnet.  
  * Build the React application using Vite for production.  
  * Host the frontend widget files (e.g., on IPFS, a CDN, or **Walrus**).  
  * Create detailed documentation for creators:  
    * How to deploy their own contract instance.  
    * How to embed the widget on their website/repo.  
    * How to withdraw funds.  
    * Troubleshooting guide.  
  * Announce and promote the plugin.

This updated plan provides a solid foundation for building your "Give Me Coffee" plugin on the Base blockchain with a modern React/Vite frontend.