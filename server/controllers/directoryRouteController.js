import { rm } from "fs/promises";
import { ObjectId } from "mongodb";
import Directory from "../models/directoryModels.js";
import File from "../models/fileModel.js";


export const fetchingDir = async (req, res) => { 
  try{
      const { rootDirId } = req.user;
  const id = req.params.id || rootDirId;
  const directoryData = await Directory.findOne({ _id: new ObjectId(id) }); //checking directory is present or not
  if (!directoryData)
    return res.status(404).json({ message: "Directory not found!" });
  const directories = await Directory
    .find({ parentDirId: new ObjectId(id) })
    .lean();
  const files = await File
    .find({ parentDirId: new ObjectId(id) })
    .lean();
  if (!files) {
    return res.status(404).json({ message: "file Not Found" });
  }
  return res.status(200).json({
    ...directoryData,
    files: files.map((dir) => ({ ...dir, id: dir._id })), //modifying the id using map
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
  });
  }catch(err){
    console.log(err);
  }

};

export const creatingDir = async (req, res, next) => {
  try {
    const user = req.user;
    const parentDirId = req.params.parentDirId || user.rootDirId;

    // get from body instead of headers
    const { name } = req.body;
    const dirname = name?.trim() || "New Folder";

    const parentDir = await Directory
      .findOne({ _id: new ObjectId(parentDirId) });

    if (!parentDir) {
      return res
        .status(404)
        .json({ message: "Parent directory does not exist!" });
    }

    const newDir = {
      name: dirname,
      parentDirId: new ObjectId(parentDirId),
      userId: user._id,
      createdAt: new Date(),
    };

    const result = await Directory.insertOne(newDir);

    return res.status(201).json({
      _id: result.insertedId,
      ...newDir,
    });
  } catch (err) {
    next(err);
  }
};

export const updatingDir = async (req, res, next) => {
  const { id } = req.params;
  const { newname } = req.body;
  const user = req.user;

  try {
    const a = await Directory.findByIdAndUpdate
      (
        { _id: new ObjectId(id), userId: user._id },
        { $set: { name: newname } }
      );

    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
};
export const deleteDir = async (req, res, next) => {
  const { id } = req.params;
  const parentDirObj = new ObjectId(id);
  const userId = req.user._id;

  async function getDirectoryContent(id) {
    let files = await File
      .find(
        { parentDirId: id, userId }
      ).select("extension")
      .lean(); //bcz find method returns cursor[buffer]  so toarray method needed
    let dir = await Directory
      .find({ parentDirId: id, userId }).select('name')
      .lean();

    for (const { _id, name } of dir) {
      // ith check aaku kittiye folderl yethongu folder parent aayitt indan untill parentDir is zero . its a recursion method

      const { files: childFiles, dir: childDir } = await getDirectoryContent(
        new ObjectId(_id)
      );
      // above method works like this if i have files and   folder inside that sam folder and inside that ghost folder. so first
      //1)it checks filesfolder children dir and returns its sam
      //2) then it checks sams children folder its ghost
      //3) then it checks ghosts children folder its nothing so loop will be stopped
      files = [...files, ...childFiles];
      dir = [...dir, ...childDir];
    }
    if (!files || !dir) {
      return res.status(400).json({ message: "File Not Found" });
    }

    return { files, dir };
  }

  const { files, dir } = await getDirectoryContent(parentDirObj);
  try {
    for (const { _id, extension } of files) {
      await rm(`./storage/${_id.toString()}${extension}`);
    }
    await File.deleteMany({
      _id: { $in: files.map(({ _id }) => _id) },
    });
    await Directory.deleteMany({
      _id: { $in: [...dir.map(({ _id }) => _id), parentDirObj] },
    });
    return res.status(200).json({ message: " Folder Deleted Successfully" });
  } catch (err) {
    console.log(err);
  }
};
