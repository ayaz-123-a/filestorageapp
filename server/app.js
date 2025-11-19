import connectDb from './config/db.js'
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import auth from "./middleware/auth.js";

await connectDb()

const mySecretKey = "ProCodrr-storageApp-123$#";

try {
  const app = express();
  app.disable("x-powered-by");

  app.use(cookieParser(mySecretKey));

  app.use(
    cors({
      origin:process.env.APP_URL,
      credentials: true, // allow cookies/authorization headers
    })
  );
  app.use(express.json());

  

  app.use("/directory", auth, directoryRoutes);
  app.use("/file", auth, fileRoutes);
  app.use("/user", userRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err); // let Express handle it
  }
  return res
    .status(err.status || 500)
    .json({ error: err.message || "Something went wrong!" });
});


  app.listen(process.env.PORT, () => {
    console.log(`Server Started`);
  });
} catch (err) {
  console.log(err);
  console.log("database connection failed");
}
