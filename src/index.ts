import dotenv from "dotenv";
import { app } from "./server.js";

dotenv.config();

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Listening on Port: ${port}`);
});
