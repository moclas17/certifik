import { Router } from "express";

import { createWallet } from "./services/createWallet";
import { adminAuth } from "./services/adminAuth";
import { deployCollection} from "./services/createCollection";
import {
  getAdminCollections,
  getAdminCollection,
} from "./services/getCollections";
import { claimNFT } from "./services/claimNFT";
import { getNFT } from "./services/getNFT";
import { mintBatch } from "./services/mintBatch";

import { verifyToken } from "./utils/validateToken";

export const router: Router = Router();

router.get("/", (req, res) => {
  res.send("Hell!!");
});

router.post("/signup", createWallet);
router.post("/login", adminAuth);
router.post("/create-collection", verifyToken, deployCollection);
// router.post("/transfer-nft", transferNft); // El usuario lo solicita

// router.get("/admin-collections/:id", getAdminCollections);
/* router.get(
  "/admin-collections/:adminId/collection/:collectionId",
  getAdminCollection
); 
router.post("/mint-batch", verifyToken, mintBatch);
*/
router.post("/claim", claimNFT);
router.get("/nfts", getNFT);
// router.get("/nfts/:id", getUserNft);
