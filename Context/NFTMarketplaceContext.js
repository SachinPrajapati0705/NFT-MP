import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";

//INTERNAL  IMPORT
import {
  NFTMarketplaceAddress,
  NFTMarketplaceABI,
  transferFundsAddress,
  transferFundsABI,
  handleNetworkSwitch,
} from "./constants";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRECT_KEY = process.env.NEXT_PUBLIC_PINATA_SECRECT_KEY;
const PINATA_POST_URL = process.env.NEXT_PUBLIC_PINATA_POST_URL;
const PINATA_HASH_URL = process.env.NEXT_PUBLIC_PINATA_HASH_URL;
const PINATA_POST_JSON_URL = process.env.NEXT_PUBLIC_PINATA_POST_JSON_URL;

//---FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplaceABI,
    signerOrProvider
  );

//---CONNECTING WITH SMART CONTRACT

const connectingWithSmartContract = async () => {
  try {
    if (!window.ethereum) {
      console.error("No Ethereum wallet found. Please install MetaMask.");
      throw new Error("No Ethereum wallet found. Please install MetaMask.");
    }
    
    // First try to switch to the correct network
    try {
      await handleNetworkSwitch();
    } catch (networkError) {
      console.error("Failed to switch network:", networkError);
      throw new Error("Failed to switch to the correct network. Please switch manually.");
    }
    
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    
    // Verify we're on the correct network
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name, "Chain ID:", network.chainId);
    
    const signer = provider.getSigner();
    const contract = fetchContract(signer);
    
    // Verify the contract exists at the specified address
    try {
      // Call a simple view function to verify the contract exists
      await contract.getListingPrice();
      console.log("Contract successfully connected at address:", NFTMarketplaceAddress);
    } catch (contractVerifyError) {
      console.error("Contract verification failed:", contractVerifyError);
      throw new Error("Contract not found at the specified address. Please check your configuration.");
    }
    
    return contract;
  } catch (error) {
    console.log("Something went wrong while connecting with contract", error);
    throw error;
  }
};

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = ({ children }) => {
  const titleData = "Discover, collect, and sell NFTs";

  //------USESTAT
  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const router = useRouter();

  //---CHECK IF WALLET IS CONNECTD

  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum)
        return setOpenError(true), setError("Install MetaMask");
      const network = await handleNetworkSwitch();

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const getBalance = await provider.getBalance(accounts[0]);
        const bal = ethers.utils.formatEther(getBalance);
        setAccountBalance(bal);
        return accounts[0];
      } else {
        // setError("No Account Found");
        // setOpenError(true);
        console.log("No account");
      }
    } catch (error) {
      // setError("Something wrong while connecting to wallet");
      // setOpenError(true);
      console.log("not connected");
    }
  };

  //---CONNET WALLET FUNCTION
  const connectWallet = async () => {
    try {
      if (!window.ethereum)
        return setOpenError(true), setError("Install MetaMask");
      const network = await handleNetworkSwitch();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(accounts);
      setCurrentAccount(accounts[0]);

      connectingWithSmartContract();
    } catch (error) {
      setError("Error while connecting to wallet");
      setOpenError(true);
    }
  };

  //---UPLOAD TO IPFS FUNCTION
  const uploadToPinata = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios({
          method: "post",
          url: `${PINATA_POST_URL}`,
          data: formData,
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRECT_KEY,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `${PINATA_HASH_URL}${response.data.IpfsHash}`;

        return ImgHash;
      } catch (error) {
        setError("Unable to upload image to Pinata");
        setOpenError(true);
        console.log(error);
      }
    }
    setError("File Is Missing, Kindly provide your file");
    setOpenError(true);
  };

  //---CREATENFT FUNCTION
  const createNFT = async (name, price, image, description, router) => {
    if (!name || !description || !price || !image)
      return setError("Data Is Missing"), setOpenError(true);

    const data = JSON.stringify({ name, description, image });

    try {
      const response = await axios({
        method: "POST",
        url: `${PINATA_POST_JSON_URL}`,
        data: data,
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRECT_KEY,
          "Content-Type": "application/json",
        },
      });

      const url = `${PINATA_HASH_URL}${response.data.IpfsHash}`;
      console.log(url);

      await createSale(url, price);
      router.push("/searchPage");
    } catch (error) {
      setError("Error while creating NFT");
      setOpenError(true);
    }
  };

  //--- createSale FUNCTION
  const createSale = async (url, formInputPrice, isReselling, id) => {
    try {
      const price = ethers.utils.parseUnits(formInputPrice, "ether");

      const contract = await connectingWithSmartContract();

      const listingPrice = await contract.getListingPrice();

      const transaction = !isReselling
        ? await contract.createToken(url, price, {
            value: listingPrice.toString(),
          })
        : await contract.resellToken(id, price, {
            value: listingPrice.toString(),
          });

      await transaction.wait();
      console.log(transaction);
    } catch (error) {
      setError("error while creating sale");
      setOpenError(true);
      console.log(error);
    }
  };

  //--FETCHNFTS FUNCTION

  const fetchNFTs = async () => {
    try {
      if (!window.ethereum) {
        setError("Please install MetaMask to interact with this marketplace");
        setOpenError(true);
        return [];
      }

      // Check and switch to correct network
      try {
        await handleNetworkSwitch();
      } catch (networkError) {
        console.error("Network switch failed:", networkError);
        setError("Failed to switch to the correct network. Please switch manually.");
        setOpenError(true);
        return [];
      }

      const address = await checkIfWalletConnected();
      if (!address) {
        console.log("No wallet connected");
        setError("Please connect your wallet first");
        setOpenError(true);
        return [];
      }

      try {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        
        // Check chain ID to ensure connected to correct network
        const network = await provider.getNetwork();
        console.log("Connected to network:", network.name, "Chain ID:", network.chainId);
        
        const contract = fetchContract(provider);
        console.log("Contract address:", NFTMarketplaceAddress);
        console.log("Fetching market items...");
        
        // Add try/catch specifically for the contract call
        try {
          const data = await contract.fetchMarketItems();
          console.log("Market items:", data);

          const items = await Promise.all(
            data.map(
              async ({ tokenId, seller, owner, price: unformattedPrice }) => {
                try {
                  const tokenURI = await contract.tokenURI(tokenId);
                  console.log("Token URI for ID", tokenId.toString(), ":", tokenURI);

                  const {
                    data: { image, name, description },
                  } = await axios.get(tokenURI, {});
                  const price = ethers.utils.formatUnits(
                    unformattedPrice.toString(),
                    "ether"
                  );

                  return {
                    price,
                    tokenId: tokenId.toNumber(),
                    seller,
                    owner,
                    image,
                    name,
                    description,
                    tokenURI,
                  };
                } catch (itemError) {
                  console.error("Error processing NFT item:", itemError);
                  return null;
                }
              }
            )
          );
          
          // Filter out any null items from errors
          const validItems = items.filter(item => item !== null);
          console.log("Valid NFTs:", validItems);
          return validItems;
        } catch (contractCallError) {
          console.error("Contract call error:", contractCallError);
          
          // Check if the error might be due to the contract not being deployed on this network
          if (contractCallError.code === 'CALL_EXCEPTION') {
            setError("Contract call failed. Please ensure you're connected to the correct network where the contract is deployed.");
          } else {
            setError(`Contract error: ${contractCallError.message || "Unknown contract error"}`);
          }
          setOpenError(true);
          return [];
        }
      } catch (contractError) {
        console.error("Contract interaction error:", contractError);
        setError(`Contract error: ${contractError.message || "Unknown contract error"}`);
        setOpenError(true);
        return [];
      }
    } catch (error) {
      console.error("Error in fetchNFTs:", error);
      setError(`Error while fetching NFTS: ${error.message || "Unknown error"}`);
      setOpenError(true);
      return [];
    }
  };

  //--FETCHING MY NFT OR LISTED NFTs
  const fetchMyNFTsOrListedNFTs = async (type) => {
    try {
      const address = await checkIfWalletConnected();
      if (address) {
        const contract = await connectingWithSmartContract();

        const data =
          type == "fetchItemsListed"
            ? await contract.fetchItemsListed()
            : await contract.fetchMyNFTs();

        const items = await Promise.all(
          data.map(
            async ({ tokenId, seller, owner, price: unformattedPrice }) => {
              const tokenURI = await contract.tokenURI(tokenId);
              const {
                data: { image, name, description },
              } = await axios.get(tokenURI);
              const price = ethers.utils.formatUnits(
                unformattedPrice.toString(),
                "ether"
              );

              return {
                price,
                tokenId: tokenId.toNumber(),
                seller,
                owner,
                image,
                name,
                description,
                tokenURI,
              };
            }
          )
        );
        return items;
      }
    } catch (error) {
      setError("Error while fetching listed NFTs");
      setOpenError(true);
      console.log(error);
    }
  };

  //---BUY NFTs FUNCTION
  const buyNFT = async (nft) => {
    try {
      const address = await checkIfWalletConnected();
      if (address) {
        const contract = await connectingWithSmartContract();
        const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

        const transaction = await contract.createMarketSale(nft.tokenId, {
          value: price,
        });

        await transaction.wait();
        router.push("/author");
      }
    } catch (error) {
      setError("Error While buying NFT");
      setOpenError(true);
    }
  };

  return (
    <NFTMarketplaceContext.Provider
      value={{
        uploadToPinata,
        checkIfWalletConnected,
        connectWallet,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
        createSale,
        currentAccount,
        titleData,
        setOpenError,
        openError,
        error,
        accountBalance,
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
