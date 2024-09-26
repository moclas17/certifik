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
      return res.status(400).send({ error: "Not enough gas in this wallet..." });      
    }
   
    // create collection request no tiene el mail, q se necesita para seguir... así q hay que enviarlo manual con el request.
    const  { metadata, email }  = req.body;
    
    const isAdmin = await getUserAdmin(email);
    // console.log("Data Admin: ", isAdmin);  
    if(isAdmin === null ){
      return res.status(400).send({ error: "Admin status is required" });
    }
    if (!metadata) {   
      return res.status(400).send({ error: "Metadata info is required" });
    } 
   
    const headers = {
      "Content-Type": "application/json",
      'x-api-key': process.env.API_TATUM
    };

    const data = {
      chain: process.env.CHAIN,
      name:  metadata.name,
      symbol: metadata.symbol,
      fromPrivateKey :  process.env.WALLET_PK,
      publicMint : true
    }; 

    const response = await axios.post('https://api.tatum.io/v3/nft/deploy', data, { headers });
     
    let mitxhash = response.data.txId; // 0x2256c2174ca2248d76538dbe9430c780a32530c32c3fcf7b5b94a19878cdcd03
    

    console.log("---->");
    console.log("mitxhash: ", mitxhash);
    console.log("---->");

    const headers_2 = {
      'x-api-key': process.env.API_TATUM
    };

    let params = "";
    if (process.env.TATUM_TESTNET == "True") {
      params = "?type=testnet";
    }
    
    //obtengo el contrato deployado
    if(mitxhash) {
      const request_url = `https://api.tatum.io/v3/blockchain/sc/address/${process.env.CHAIN}/${mitxhash}${params}`;
      
      // Con Axios:
      // const getContract = await axios.get(request_url, { headers });

      // Con fetch:
      const response = await fetch(request_url, {
        method: 'GET',
        headers: headers_2
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log(response.headers.get('Content-Type')); // Should be application/json
      console.log(response.headers.get('Content-Length')); // Should not be 0
      const text = await response.text(); 
      console.log(text); // See what the actual raw response text is

      const getContract = await response.json();


      console.log("---->");
      console.log("response: ", response);
      console.log("......");
      console.log("request_url: ", request_url);
      console.log("......");
      console.log("getContract: ", getContract);
      console.log("---->");

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
