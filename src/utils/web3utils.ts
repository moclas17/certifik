import Web3 from "web3";

export const web3 = new Web3(process.env.RPC_PROVIDER);

export const signMessage = (message: string, pk: string): any => {
  const signedMessage = web3.eth.accounts.sign(message, pk);
  return signedMessage;
};

export const getNativeBalance = async (address: string): Promise<any> => {
  const balanceInWei = await web3.eth.getBalance(address);
  const balance = Number(Web3.utils.fromWei(balanceInWei));
  console.log("Balance ", balance);
  return balance;
};
