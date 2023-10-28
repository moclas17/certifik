import supabase from "../config/supabase";

interface MetadataProps {
  name: string,
  image: string,
  maxSupply: number
};

interface AdminProps {
  id: number,
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
    .from("Admin")
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
  // return error ? error : data;
  return [];
};

export const getCollection = async (
  adminId: number,
  collectionId: number
): Promise<any> => {
  const { data, error } = await supabase.from("collections").select();
  console.log({ data, error });
  // return error ? error : data;
  return [];
};

export const gettxHash = async (
  adminId: number,
  collectionId: number
): Promise<any> => {
  const { data, error } = await supabase.from("collections").select().eq("id", collectionId);
   return error ? error : data;
  
};

export const createCollection = async (metadata: MetadataProps, admin: AdminProps, minter: number, contract: string): Promise<any> => {
 
  const { name, image, maxSupply } = metadata;
  const { id } = admin;
  const { data, error } = await supabase
    .from("collections")
    .insert([{ 'adminOwner': id, 'name':name,  'supply': maxSupply, 'image': image, 'metadata': metadata, 'contract': contract, 'minter': minter }])
    .select();
   return error ? null : data;
  
};
 
export const claimedNFT = async (
  wallet: string,
  hash: string
): Promise<any> => {
  const { data, error } = await supabase
    .from("qrcodes")
    .update({ isClaimed: true, claimed_by: wallet }) 
    .match({ hash });
  return error ? error : data;
};

export const getUserNft = async (email: string): Promise<any> => {
  const user = await getUser(email);
  if (user.wallet) {
    const { data, error } = await supabase
      .from("qrcodes")
      .select()
      .eq("claimed_by", user.wallet);
    return error ? error : data;
  }
  return null;
};
