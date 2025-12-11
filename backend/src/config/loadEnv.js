import dotenv from "dotenv";
import fs from "fs";

 // load .env

if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local", override: true });
}
else{
    dotenv.config();
}
