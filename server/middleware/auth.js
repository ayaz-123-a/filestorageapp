import redisClient from "../config/redis.js";
import Session from "../models/sessionModal.js";
import User from "../models/userModal.js";

export default async function auth(req, res, next) {
  const { sid } = req.signedCookies;

  if (!sid) {
    res.clearCookie("sid");
    return res.status(401).json({ error: "1 Not logged in!" });
  }

  const redisKey = `session:${sid}`;

  const session = await redisClient.json.get(redisKey);

  if (!session) {
    res.clearCookie("sid");
    return res.status(401).json({ error: "2 Not logged in!" });
  }

  const user = await User.findOne({ _id: session.userId }).lean();
  if (!user) {
    return res.status(401).json({ error: "3 Not logged in!" });
  }
  req.user = user;
  next();
}
