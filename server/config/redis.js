import { createClient } from "redis";

const redisClient= createClient()

redisClient.on('error',(error)=>{
    console.log('redis conncetion failed',error);
    process.exit(1)
})

await redisClient.connect()

export default redisClient