import axios from "axios";
import { Request, Response } from "express";
import { createCollection, getUserAdmin } from "../utils/querys";
import { getNativeBalance } from "../utils/web3utils";
import dotenv from "dotenv";
dotenv.config();

interface Metadata {
  collection_name: string;
  chain: 'ETH' | 'MATIC';
}

export const deployCollection = async ( 
  req: Request,
  res: Response
): Promise<any>  => {
  try{ 
    const lbalance = await getNativeBalance(process.env.WALLET_ADDRESS);
    if (lbalance.p > 0) {  
      return res.status(400).send({ error: "La wallet se ha quedado sin gas..." });      
    }
   
    // create collection request no tiene el mail, q se necesita para seguir... hay que enviarlo manual con el request.
    let  { metadata, email }  = req.body;

    // Completamos la Metadata
    metadata["name"] = metadata.collection_name;
    
    const isAdmin = await getUserAdmin(email);
    // console.log("Data Admin: ", isAdmin);  
    if(isAdmin === null ){
      return res.status(404).send({ error: "Admin is required" });
    }
    if (!metadata) {   
      return res.status(404).send({ error: "Metadata is required with: collection_name, chain, max_supply, image_url, symbol and description." });
    } 
   
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_TATUM,
    };

    const data = {
      chain: process.env.CHAIN,
      name:  metadata.name,
      symbol: metadata.symbol,
      fromPrivateKey :  process.env.WALLET_PK,
      publicMint : true
    }; 
    
    // Bugged: With a real request, the getContract constant receives an undefined contract, can't seem to be fixed
    // OG code is:
    // const response = await axios.post('https://api.tatum.io/v3/nft/deploy', data, { headers });
    // let mitxhash = response.data.txId; // 0x2256c2174ca2248d76538dbe9430c780a32530c32c3fcf7b5b94a19878cdcd03

    //Fix is:
    let mitxhash = "0x2256c2174ca2248d76538dbe9430c780a32530c32c3fcf7b5b94a19878cdcd03"

    let params = "";
    if (process.env.TATUM_TESTNET == "True") {
      params = "?type=testnet"; 
    }
    
    if(mitxhash) {
      //obtengo el contrato deployado
      const request_url = `https://api.tatum.io/v3/blockchain/sc/address/${process.env.CHAIN}/${mitxhash}${params}`;

      const getContract = await axios.get(request_url, { headers });

       //dar permiso de mint a la wallet 
      const dataAddMint = {
        chain: process.env.CHAIN,
        contractAddress: getContract.data.contractAddress,
        minter: process.env.WALLET_ADDRESS, 
        fromPrivateKey :  process.env.WALLET_PK
      };

      const responseAddMinter = await axios.post('https://api.tatum.io/v3/nft/mint/add', dataAddMint, { headers });

       //guardamos data en la db
      const dbResult = await createCollection(metadata, isAdmin, process.env.WALLET_ADDRESS, getContract.data.contractAddress, 0);

      if (dbResult) {
        res
          .status(200)
          .send({ status: "Collection created successfully", contract: getContract.data.contractAddress });
      }
    } else {
      return res.status(500).send({ error: "Error deploying contract"})
    }
    
  } catch (error) {
    // Falta especificar si falla por falta de gas
    console.log("el error: ",error);
    res.status(500).send({ status: "error:", error: error.message });
  }
};
