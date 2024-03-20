import supabase from "../config/supabase";

interface MetadataProps {
  collection_id: number,
  admin_id: number,
  collection_name: string
  chain: string,
  max_supply: number,
  image_url: string
  description: string,
  nfts_claimed: number,
  collection_contract: string
};

interface AdminProps {
  admin_id: number,
  email: string,
  credits: number
};

export const getUser = async (email: string): Promise<any> => {
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("email", email)
    .maybeSingle();
  return error ? null : data;
};

export const getUserAdmin = async (email: string): Promise<any> => {
  const { data, error } = await supabase
    .from("admin")
    .select()
    .eq("email", email)
    .maybeSingle();
    
  return error ? null : data;
};

export const getQRHash = async (hash: string): Promise<any> => {
  const { data, error } = await supabase
    .from("qrcodes")
    .select()
    .eq("hash", hash)
    .maybeSingle();
  return error ? null : data;
};

export const getCollections = async (adminId: number): Promise<any> => {
  const { data, error } = await supabase.from("collections").select();
  console.log({ data, error });
  return error ? null : data;
};

export const getCollection = async (
  collectionId: number
): Promise<any> => {
  const { data, error } = await supabase.from("collections").select().eq("collection_id", collectionId);;
  return error ? null : data;
};

export const createCollection = async (metadata: MetadataProps, admin: AdminProps, minter: any, contract: string, nfts_claimed: number): Promise<any> => {
 
//altura de la tabla, sirve para poner el id de la nueva coleccion
const { count: preInsertCount, error: preInsertError } = await supabase.from('users').select('*', { count: 'exact', head: true });

  const { collection_name, chain, max_supply, image_url, description } = metadata;

  const { admin_id } = admin;
  const { data, error } = await supabase
    .from("collections")
    .insert([{ 'collection_id':preInsertCount, 'admin_id': admin_id, 'collection_name':collection_name, 'nfts_claimed':nfts_claimed, 'max_supply': max_supply, 'image_url': image_url, 'chain': chain, 'description': description }])
    .select(); 
   
    if (error) {
      console.error(error);
      return null;
    } else {
      return data;
    }
  
  };
 
export const claimedNFT = async (
  wallet: string,
  hash: string
): Promise<any> => {
  const { data, error } = await supabase
    .from("qrcodes")
    .update({ isClaimed: true, owner: wallet }) 
    .match({ hash });
  return error ? error : data;
};

// Cada vez que se mintea un NFt, debería agregarse a la tabla de nfts
// export const addNft = async (collectionId: number, nftId: number, uuid: string, owner: string): Promise<any> => {
//   const { data, error } = await supabase
//     .from("nfts")
//     .insert([
//       { collection_id: collectionId, nft_id: nftId, uuid: uuid, claimed: false, owner: owner }
//     ]);
//   return error ? error : data;
// };

export const updateClaimedSupply = async (new_value: number, contract: string) => {
  const { error } = await supabase
  .from("collections")
  .update({ nfts_claimed: new_value})
  .match({ collection_contract: contract })
  return error;
}

export const getUserNft = async (email: string): Promise<any> => {
  const user = await getUser(email);
  // user.wallet = "0x1c663755c0b6A1477fDc8a383928a5806398f6C8"; // Hard coded as an example
  console.log(user.public_key);
  if (user.public_key) {
    const { data, error } = await supabase
      .from("nfts")
      .select()
      .eq("owner", user.public_key);
      
      if (Array.isArray(data) && data.length === 0) {
        return { message: "This user does not have any NFTs yet!"};
      }

    return error ? error : { "data": data};
  }
  return { message: "User wallet not found" };
};
