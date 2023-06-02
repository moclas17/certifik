import axios from "axios";
import { Request, Response } from "express";
import { createCollection, getUserAdmin, gettxHash } from "../utils/querys";
import { getNativeBalance } from "../utils/web3utils";
import dotenv from "dotenv";
dotenv.config();

export const deployCollection = async ( 
  req: Request,
  res: Response
): Promise<any>  => {
  try{ 
    const lbalance = await getNativeBalance( process.env.WALLET_ADDRESS );
    if (lbalance.p > 0) {  
      return res.status(400).send({ error: "La wallet se ha quedado sin gas..." });      
    }
   
    const  metadata  = req.body; // TODO: userId, email 
    //console.log("metadata: ",metadata);  
    const isAdmin = await getUserAdmin(metadata.email);
    //console.log("Data Admin: ",isAdmin);  
    if(isAdmin === null ){
      return res.status(404).send({ error: "Admin is required" });
    }
    if (!metadata.metadata) {   
      return res.status(404).send({ error: "metadata is required" });
    } 
   

    // //ipfs upload 
    // const headers = {
    //   'Content-Type': 'multipart/form-data',
    //   'X-API-KEY': process.env.API_TATUM,
    // };
    // const formData = new FormData();  
    // const mystr = string2fileStream(metadata.metadata);
    // formData.append("file", mystr);   
    // const response = await axios.post('https://api.tatum.io/v3/ipfs', formData, { headers });
    // console.log(response.data);
    // //termina ipfs 
   
  
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.API_TATUM,
    };
    const data = {
      chain: process.env.CHAIN,
      name:  metadata.metadata.name,
      symbol: metadata.metadata.symbol,
      fromPrivateKey :  process.env.WALLET_PK,
      publicMint : true
    }; 

//    const response = await axios.post('https://api.tatum.io/v3/nft/deploy', data, { headers });
    
    let txdata = await gettxHash(1,35); 
    //console.log("txdata: " , txdata[0].data);
    let mitxhash =  txdata[0].data.txId; 
    //let mitxhash = response.data.txId;  
    //obtengo el contrato deployado  
    const getContract = await axios.get('https://api.tatum.io/v3/blockchain/sc/address/'+ process.env.CHAIN + '/' + mitxhash, { headers });
    
    //le doy permiso de mint a la wallet 
    const dataAddMint = {
      chain: process.env.CHAIN,
      contractAddress:  getContract.data.contractAddress,
      minter: process.env.WALLET_ADDRESS, 
      fromPrivateKey :  process.env.WALLET_PK
    };
    const responseAddMinter = await axios.post('https://api.tatum.io/v3/nft/mint/add', dataAddMint, { headers });
    console.log("responseAddMinter", responseAddMinter);
    //guardamos data en la db
    const dbResult = true ;// await createCollection(metadata, isAdmin, response.data, getContract);
 
    //if (dbResult || response ) {
    if (dbResult  ) {
      res
        .status(200)
        .send({ status: "success" });
        //.send({ status: "success", data: response.data });
    }
    
  } catch (error) {
    console.log("el error: ",error);
    res.status(500).send({ status: "error:", error: error.message });
  }
};

 