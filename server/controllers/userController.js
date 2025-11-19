import mongoose, { Types } from "mongoose";
import Directory from "../models/directoryModels.js";
import User from "../models/userModal.js";
import Session from "../models/sessionModal.js";
import { verifyIdToken } from "../services/googleOauthService.js";
import redisClient from "../config/redis.js";

  const sesssionId = crypto.randomUUID();
  const redisKey = `session:${sesssionId}`;

export const userRegister = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }
  // const existingUser = await User.findOne({email})
  // if (existingUser) {
  //   return res.status(409).json({ message: "User already exists! Try Login" });
  // }
  const session = await mongoose.startSession();

  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    session.startTransaction();
    const userRootDir = await Directory.insertOne({
      _id: rootDirId,
      name: `root-${email}`,
      parentDirId: null,
      userId,
    });
    const userData = new User({
      name,
      email,
      password,
      rootDirId,
    });
    session.commitTransaction();
    userData.save();
    return res.status(201).json({ message: "user created successfully!" });
  } catch (err) {
    session.abortTransaction();
    if (err.code === 121) {
      res.status(400).json({ error: "Invalid Fields" });
    } else if (err.code === 11000) {
      // by using indexing we are validating. Its more fast and efficient rather than find or exist operation
      if (err.keyValue.email) {
        return res
          .status(409)
          .json({ message: "User already exists! Try Login" });
      }
    }
    {
      next(err);
    }
  }
};

export const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }); //user email id and pass matched then  return user details else return null
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }
  // const allSessions = await Session.find({ userId: user.id });
  // if (allSessions.length >= 2) {
  //   await allSessions[0].deleteOne();
  // }
  // const session = await Session.create({ userId: user._id });

  const sessionExpiryTime = 60 * 60 * 24 * 7;
  const session = await redisClient.json.set(redisKey, "$", {
    userId: user._id,
  });
  redisClient.expire(redisKey, sessionExpiryTime);
  res.cookie("sid", sesssionId, {
    httpOnly: true,
    signed: true,
    maxAge: sessionExpiryTime,
  });
  res.status(200).json(`welcome ${user.name}`);
};

export const gettingUser = (req, res) => {
  res.json({
    name: req.user.name,
  });
};

export const logoutUser = async (req, res) => {
  const { sid } = req.signedCookies;
  await redisClient.del(redisKey)
  res.clearCookie("sid");
  return res.status(200).end();
};

export const loginWithGoogle = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const { name, email, picture } = await verifyIdToken(idToken);

    let user = await User.findOne({ email });

    // ---------------------------------------------------
    // IF USER DOES NOT EXIST -> CREATE USER
    // ---------------------------------------------------
    if (!user) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const userId = new Types.ObjectId();
        const rootDirId = new Types.ObjectId();

        await Directory.insertOne(
          {
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId
          },
          { session }
        );

        await User.insertOne(
          {
            _id: userId,
            name,
            email,
            picture,
            rootDirId
          },
          { session }
        );

        await session.commitTransaction();

        user = await User.findById(userId); // load the newly created user
      } catch (err) {
        await session.abortTransaction();
        return next(err);
      }
    }

    // ---------------------------------------------------
    // USER EXISTS -> UPDATE GOOGLE PICTURE IF NEEDED
    // ---------------------------------------------------
    if (!user.picture.includes("googleusercontent.com")) {
      user.picture = picture;
      await user.save();
    }

    // ---------------------------------------------------
    // CREATE REDIS SESSION FOR BOTH NEW + EXISTING USERS
    // ---------------------------------------------------
    const sessionId = new Types.ObjectId().toString();
    const redisKey = `session:${sessionId}`;
    const ttl = 60 * 60 * 24 * 7; // 7 days

    await redisClient.json.set(redisKey, "$", {
      userId: user._id.toString()
    });

    await redisClient.expire(redisKey, ttl);

    // ---------------------------------------------------
    // SET COOKIE FOR BOTH NEW + EXISTING USERS
    // ---------------------------------------------------
    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      maxAge: ttl * 1000
    });

    return res.json({ message: "logged in" });

  } catch (err) {
    next(err);
  }
};

