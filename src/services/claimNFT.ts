import { Request, Response } from "express";
import { getNativeBalance } from "../utils/web3utils";
import { getUser, getQRHash, claimedNFT } from "../utils/querys";

  
export const claimNFT = async (req: Request, res: Response): Promise<any> => { 
  
  const { email, bottleId, lensProfile, publicationId, moduleData } =
    req.body as any;
  if (!email || !bottleId) {
    res.status(404).send({ error: "Email and BottleId are required" });
  }

  const user = await getUser(email);
  const hash = await getQRHash(bottleId);
  console.log({ user, hash });

  !user ? res.status(400).send({ error: "Email not found" }) : null;

  !hash ? res.status(400).send({ error: "Hash not valid" }) : null;

  // Habrá problema si se hace request de más de un nft a la vez?
  // Debemos monitorear el status de la tx

  if (user && hash?.isClaimed === false) {
    
    // valida que el admin tenga para los fees.
    const balance = await getNativeBalance(
      "0x1c663755c0b6A1477fDc8a383928a5806398f6C8" 
    );
    
    if (balance > 1) { 
      
      
    }
    res.status(400).send({ error: "La wallet se ha quedado sin gas..." });
  }
};
