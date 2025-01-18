import { Redis } from '@upstash/redis'
import env from "dotenv";
env.config();


const redisUtil = new Redis({
  url: process.env.Upstash_Redis_Url,
  token: process.env.Upstash_Redis_Token,
})

export default redisUtil