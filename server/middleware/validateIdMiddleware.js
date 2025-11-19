import { ObjectId } from "mongodb";

function validation (req, res, next, id) {
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: `Invalid ID: ${id}` });
  }
  next();
}
export default validation