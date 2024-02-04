import axios from "axios";
import { Request, Response } from "express";
import { createCollection, getUserAdmin } from "../utils/querys";
import { getNativeBalance } from "../utils/web3utils";
import dotenv from "dotenv";
dotenv.config();

export const deployCollection = async ( 
  req: Request,
  res: Response
): Promise<any>  => {
  try{ 
    const lbalance = await getNativeBalance(process.env.WALLET_ADDRESS);
    if (lbalance.p > 0) {  
      return res.status(400).send({ error: "La wallet se ha quedado sin gas..." });      
    }
   
    const  { metadata, email }  = req.body;
    console.log("metadata: ", metadata);  
    // create collection request no tiene el mail, q se necesita para seguir... hay que enviarlo manual con el request.

    const isAdmin = await getUserAdmin(email);
    // console.log("Data Admin: ", isAdmin);  
    if(isAdmin === null ){
      return res.status(404).send({ error: "Admin is required" });
    }
    if (!metadata) {   
      return res.status(404).send({ error: "Metadata is required" });
    } 
   
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.API_TATUM,
    };
    const data = {
      chain: process.env.CHAIN,
      name:  metadata.name,
      symbol: metadata.symbol,
      fromPrivateKey :  process.env.WALLET_PK,
      publicMint : true
    }; 

    const response = await axios.post('https://api.tatum.io/v3/nft/deploy', data, { headers });
     
    let mitxhash = response.data.txId; // 0x69b3dc0c622d1f53f36c6ff0d0c6bae94dcb6050d928e09e2643b2f825874d

    console.log("----- mitxhash");
    console.log(mitxhash);
    console.log("---- mitxhash");

    let params = "";
    if (process.env.TATUM_TESTNET == "True") {
      params = "?type=testnet";
    }
    
    if(mitxhash) {
      //obtengo el contrato deployado
      const getContract = await axios.get(`https://api.tatum.io/v3/blockchain/sc/address/${process.env.CHAIN}/${mitxhash}${params}`, { headers });
       //le doy permiso de mint a la wallet 
      const dataAddMint = {
        chain: process.env.CHAIN,
        contractAddress: getContract.data.contractAddress,
        minter: process.env.WALLET_ADDRESS, 
        fromPrivateKey :  process.env.WALLET_PK
      };

      const responseAddMinter = await axios.post('https://api.tatum.io/v3/nft/mint/add', dataAddMint, { headers });
      console.log("responseAddMinter", responseAddMinter);

       //guardamos data en la db
      const dbResult = await createCollection(metadata, isAdmin, process.env.WALLET_ADDRESS, getContract.data.contractAddress);
 

      if (dbResult) {
        res
          .status(200)
          .send({ status: "Collection created successfully", contract: getContract.data.contractAddress });
      }
    } else {
      return res.status(500).send({ error: "Error deploying contract"})
    }
    
  } catch (error) {
    console.log("el error: ",error);
    res.status(500).send({ status: "error:", error: error.message });
  }
};
