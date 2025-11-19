import mongoose from "mongoose";

 const connectDB= async()=>{
  try {
   await mongoose.connect(
    process.env.DB_URL
  );
  console.log("Database Connected");
} catch (err) {
  console.log(err);
  process.exit(1);
}
}

process.on("SIGINT", async () => {
  // terminalil ctrl+c press aakittambo databsen connection by defauly aayitt remove aavala. so ith use aakunnu
  await mongoose.disconnect();
  console.log("Client Disconnected!");
  process.exit(0);
});
export default connectDB