import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  "https://mnnbyrdnpuienzscjzjk.supabase.co",
  process.env.SUPA_KEY
);

export default supabase;
