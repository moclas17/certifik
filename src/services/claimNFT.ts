import { Request, Response } from "express";
import { getNativeBalance } from "../utils/web3utils";
import { getUser, getQRHash, claimedNFT, getCollection, updateClaimedSupply } from "../utils/querys";
import axios from "axios";

const headers = {
  'Content-Type': 'application/json',
  'X-API-KEY': process.env.API_TATUM,
};

let params = "";
if (process.env.TATUM_TESTNET == "True") {
  params = "?type=testnet";
}

export const claimNFT = async (req: Request, res: Response): Promise<any> => { 
  try {
    const { email, bottleId, collectionId } = req.body;
    if (!email || !bottleId) {
      res.status(404).send({ error: "Email and BottleId are required" });
    }
  
    const user = await getUser(email);
    const hash = await getQRHash(bottleId);
    const collection_array = await getCollection(collectionId);
    const collection = collection_array[0];
    //console.log({ user, hash, collection });
  
    !user ? res.status(400).send({ error: "Email not found" }) :null;
    !hash ? res.status(400).send({ error: "Hash not valid" }) : null;
    !collection ? res.status(400).send({ error: "Collection not found "}) : null;

    // Habrá problema si se hace request de más de un nft a la vez?
    // Inhibir a nivel del front end?
    
    // Debemos monitorear el status de la tx
    if(collection.nfts_claimed < collection.supply) {
      if (user && hash?.isClaimed === false) {
      
        // valida que el admin tenga para los fees.
        const balance = await getNativeBalance(
          process.env.WALLET_ADDRESS
        );
  
        if (balance > 0.01) { 

          const nftData = {
            chain: process.env.CHAIN,
            to: user.public_key,
            url: collection.project_url,
            contractAddress: collection.collection_contract,
            fromPrivateKey: process.env.WALLET_PK,
            tokenId: String(collection.supply - (collection.nfts_claimed + 1))
          };
          
          const mintNft = await axios.post(`https://api.tatum.io/v3/nft/mint${params}`, nftData, { headers });
  
          if (mintNft.data.txId) {
            await claimedNFT(user.wallet, hash.hash);
            await updateClaimedSupply(collection.nfts_claimed += 1, collection.contract);
            res.status(200).send({ message: "Claimed successfully", nft: { metadata: collection.metadata, image: collection.image, txHash: mintNft.data.txId }});
          } else {
            res.status(400).send({ error: "We can't mint your nft, try later..." });
          }
          
        } else {
          res.status(400).send({ error: "Wallet out of fund..." });
        }
      } else {

        // console.log(user);
        // console.log(hash?.isClaimed);
        // console.log(hash);

        res.status(400).send({ error: "NFT already claimed" });
      }
    } else {
      res.status(400).send({ error: "Max supply reached for this collection"});
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error", error })
  }
};
