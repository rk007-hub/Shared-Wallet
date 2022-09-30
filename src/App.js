import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import abi from "./Contracts/SharedWallet.json";
import { useRef } from "react";
import "./App.css";

function App() {
  const contractAddress = "0x46fd051f9c6e3437bea5414fcb8ed0ecc7b82d5c";
  const contractAbi = abi;
  let provider, signer, bankContract;
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [getBalance, setBalance] = useState(null);
  const [input, setInputValue] = useState({
    AddPartner: "",
    depositeMoney: "",
    transferMoney: "",
    money: "",
  });
  const [error, setError] = useState(null);
  const IsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setIsWalletConnected(true);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getContract = () => {
    try {
      if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const AddPartner = async (event) => {
    event.preventDefault();
    getContract();
    const txn = await bankContract.setpartner(input.AddPartner);
    console.log("setting partner...");
    await txn.wait();
    console.log("partner set complete", txn.hash);
  };

  const AddMoney = async (event) => {
    event.preventDefault();
    getContract();
    console.log(input.depositeMoney);
    const txn = await bankContract.depositMoney({
      value: ethers.utils.parseEther(input.depositeMoney),
    });
    console.log("Deposting money...");
    await txn.wait();
    console.log("Deposited money...done", txn.hash);
    gettingBalance();
  };
  const gettingBalance = async () => {
    getContract();
    let current_balance = await bankContract.getWalletBalance();
    setBalance(utils.formatEther(current_balance));
    console.log("Retrieved balance...", current_balance);
  };
  const transferMoney = async (event) => {
    event.preventDefault();
    getContract();
    const txn = await bankContract.transferMoney(
      input.transferMoney,
      ethers.utils.parseEther(input.money)
    );
    console.log("Transferring...");
    await txn.wait();
    console.log("Money transfered", txn.hash);
    gettingBalance();
  };
  const handleInputChange = (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };
  useEffect(() => {
    IsConnected();
    gettingBalance();
  }, [isWalletConnected]);
  return (
    <div className="App">
      <h1>Joint Wallet</h1>
      <h4>Total Wallet Balance: {getBalance}</h4>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            backgroundColor: "blue",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "70px",
            width: "700px",
          }}
        >
          <div style={{ margin: "20px" }}>
            <span>Transfer Money </span>
            <input
              placeholder="Input Address"
              onChange={handleInputChange}
              name="transferMoney"
              value={input.transferMoney}
            ></input>
            <input
              placeholder="input value in ETH"
              onChange={handleInputChange}
              name="money"
              value={input.money}
            ></input>
            <button type="button" onClick={transferMoney}>
              Transfer Money
            </button>
          </div>
          <div>
            <span>Add Partner </span>
            <input
              placeholder="Input partener Address"
              onChange={handleInputChange}
              name="AddPartner"
              value={input.AddPartner}
            ></input>
            <button type="button" onClick={AddPartner}>
              Add
            </button>
          </div>
          <div>
            <span>Deposit Money </span>
            <input
              onChange={handleInputChange}
              name="depositeMoney"
              value={input.depositeMoney}
            ></input>
            <button type="button" onClick={AddMoney}>
              Deposite money in ETH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
