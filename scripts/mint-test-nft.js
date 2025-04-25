const hre = require("hardhat");

async function main() {
  // Get the contract factory and signer
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const [deployer] = await hre.ethers.getSigners();
  
  // Get the deployed contract
  const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const nftMarketplace = NFTMarketplace.attach(marketplaceAddress);
  
  console.log("Connected to contract at:", marketplaceAddress);
  
  // Get the listing price
  const listingPrice = await nftMarketplace.getListingPrice();
  console.log("Listing price:", hre.ethers.utils.formatEther(listingPrice), "ETH");
  
  // Create a test NFT
  const price = hre.ethers.utils.parseEther("0.01");
  const testTokenURI = "https://gateway.pinata.cloud/ipfs/QmcXG9QgbBocqYuqfK9rEtKkD8QBYsMLGpvUTrQmMQ9j9e";
  
  console.log("Creating test NFT...");
  const tx = await nftMarketplace.createToken(testTokenURI, price, {
    value: listingPrice
  });
  
  await tx.wait();
  console.log("Test NFT created successfully!");
  
  // Verify the NFT was created
  const items = await nftMarketplace.fetchMarketItems();
  console.log("Market items:", items);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 