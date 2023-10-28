import { Request, Response, NextFunction } from "express";
import { getNativeBalance } from "../utils/web3utils";
import { getUser, getQRHash, claimedNFT } from "../utils/querys";

  
export const claimNFT = async (req: Request, res: Response, next: NextFunction): Promise<any> => { 
  try {
    const { email, bottleId } = req.body;
    if (!email || !bottleId) {
      res.status(404).send({ error: "Email and BottleId are required" });
    }
  
    const user = await getUser(email);
    const hash = await getQRHash(bottleId);
    console.log({ user, hash });
  
    !user ? res.status(400).send({ error: "Email not found" }) : next();
  
    !hash ? res.status(400).send({ error: "Hash not valid" }) : next();
  
    // Habrá problema si se hace request de más de un nft a la vez?
    // Debemos monitorear el status de la tx
  
    if (user && hash?.isClaimed === false) {
      
      // valida que el admin tenga para los fees.
      const balance = await getNativeBalance(
        process.env.WALLET_ADDRESS
      );
      
      if (balance > 0.01) { 
        
        // toda la logica del mint
        // obtener data de la coleccion: supply, image, metadata
      }
      res.status(400).send({ error: "Wallet out of fund..." });
    }
  
    res.status(400).send({ error: "NFT already claimed" })
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error", error })
  }
};
