import { Request, Response, NextFunction } from "express";
import Web3 from "web3";
import supabase from "../config/supabase";
import { getUser } from "../utils/querys";
export const createWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.RPC_PROVIDER)
    );
   
    // Validar body, email es requerido
    if (!req.body.email) {
      return res.json({
        status: 500,
        error: "Email requerido",
      });
    }
 
    //verifica que el usuario no existe, si existe regresa error 
    const existe = await getUser(req.body.email);

      
    if (existe){
      return res.json({
        status: 500,
        msg: "Usuario existe",
      });
    }
     
    const account = web3.eth.accounts.create();    

    //altura de la tabla, sirve para poner el id del nuevo usuario
    const { count: preInsertCount, error: preInsertError } = await supabase.from('users').select('*', { count: 'exact', head: true });

    const { error } = await supabase.from("users").insert([
      {
        email: req.body.email,
        public_key: account.address,
        private_key: account.privateKey,
        wallet_id: preInsertCount,
      },
    ]);

    if (error) {
      return res.json({
        status: 500,
        msg: "error con Supabase:",
        error_enviado_por_supabase: error,
      });
    }

    return res.json({
      status: 201,
      wallet: account.address,
    });
  } catch (error) {    
    return next(error);
  }
};