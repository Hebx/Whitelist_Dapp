import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import {providers, Contract} from "ethers";
import {useEffect, useState, useRef} from "react";
import {WHITELIST_CONTRACT_ADDRESS, abi} from "../constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  //Returns a Provider or Signer object representing the Ethereum RPC with or without the signing capabilities of metamask attached
  const getProviderOrSigner = async (needSigner = false) => {
// Since we store web3Modal as a reference  we need to access the `current`value to get access to the underlying object
const provider = await web3ModalRef.current.connect();
const web3Provider = new providers.Web3Provider(provider);
// If user is not connected to rinkeby network let them know and throw an error
const {chainId} = await web3Provider.getNetwork();
if (chainId !== 4)
{
  window.alert("change the network to rinkeby");
  throw new Error("change network to rinkeby");
}
if (needSigner)
 {
   const signer = web3Provider.getSigner();
   return signer;
 }
 return web3Provider;
};
// Add address to whitelist
const addAddressToWhitelist = async () => {
  try {
    // we need a signer here because this is a write transaction
    const signer = await getProviderOrSigner(true);
    // create a new instance of the Contract with a Signer which allows update methods
    const whitelistContract = new Contract(
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      signer
    );
    // call the function from the contract
    const tx = await whitelistContract.addAddressToWhitelist();
    setLoading(true);
    await tx.wait();
    setLoading(false);
    // get the updated number of addresses in the whitelist
    await getNumberOfWhitelisted();
    setJoinedWhitelist(true);
  }
  catch (err) {
    console.error(err);
  }
};

const getNumberOfWhitelisted = async () => {
  try {
    // get the provider from web3modal
    // no need for a signer here because its read only state of the blockchain
    const provider = await getProviderOrSigner();
    // connect to the contract via the provider
    const whitelistContract = new Contract(
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      provider
    );
    // call the numOfAddressesWhitelisted from the contract
    const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
    setNumberOfWhitelisted(_numberOfWhitelisted);
  } catch (err) {
    console.error(err);
  }
};

  const checkIfAddressInWhitelist = async () => {
    try {
      // signer to get the user's address without the need of provider eventho its read transaction
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // get the address associated with the signer which is connected to Metamask
      const address = await signer.getAddress();
      // call the whitelisted address
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address,
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      // get the provider from web3modal which in our case metamask
      // when used for the first time it's prompt the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Waitlist!
          </button>
        )
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your Wallet!
        </button>
      );
    }
  };
  // useEffects to react to change in state of the website
  // the array at the end represents what state changes will trigger this effect
  // in this state whenever the value of `walletConnected` changes this effect will be called
  useEffect(() => {
    if (!walletConnected) {

      // the current value persist as long as the page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>
          Whitelist Dapp
        </title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto!</h1>
          <div className={styles.description}>
            Its an NFT Collection for Crypto Devs!
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>
      <footer className={styles.footer}>
          Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
