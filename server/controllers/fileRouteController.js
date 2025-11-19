import Directory from "../models/directoryModels.js";
import File from "../models/fileModel.js";
import { rm } from "fs/promises";
import path from "path";
import { ObjectId } from "mongodb";
import { createWriteStream } from "fs";
import mongoose from "mongoose";


export const creatingFile=async(req, res, next) =>  {
const parentDirId = req.params.parentDirId ||req.user.rootDirId
 const parentDirData= await Directory.findById({_id:new ObjectId(parentDirId),userId:req.user._id})
 if(!parentDirData){
  res.status(404).json({err:'no parent directory found'})
 }
  const filename = req.headers.filename || 'untitled';
  const extension = path.extname(filename);
   const fileSaveInDatabase= await File.create({
      extension,
      name: filename,
      parentDirId:parentDirData._id,
      userId:req.user._id
  })
try{
  const fullFileName = `${fileSaveInDatabase._id}${extension}`;
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);
  req.on("end",async()=>{
    return res.status(200).json({message:'file uploaded'})
  })
    } catch(err) {
      await File.findOneAndDelete({ _id: new mongoose.Types.ObjectId(fileSaveInDatabase._id) });
      return res.status(404).json({message:'couldnt upload Files'})
}}

export const readingFile = async (req, res) => {
  const { id } = req.params;

  const fileData = await File.findOne({
    _id: new ObjectId(id),
    userId: req.user._id,
  });

  if (!fileData) {
    return res.status(404).json({ message: "File Not Found!" });
  }

  const filename = `${process.cwd()}/storage/${id}${fileData.extension}`;

  if (req.query.action === "download") {
    return res.download(filename, fileData.name); // ✅ return here to stop further execution
  }

  // ❗ Only runs if action !== download
  return res.sendFile(filename, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: "File not found!" });
    }
  });
};


export const updatingFile=async (req, res, next) => {
  const { id } = req.params;

   const fileData = await File.findOne({_id: new ObjectId(id),userId:req.user._id})
if(!fileData){
  return res.status(404).json({message:'file Not Found'})
}
  fileData.name = req.body.newname;
  try {
    await File.updateOne({_id: new ObjectId(id),userId:req.user._id},{$set:{name:fileData.name}})

    return res.status(200).json({ message: "Renamed" });
  } catch(err) {
    err.status = 500
    next(err)
  }
}

export const deletingFile= async (req, res, next) => {
  const { id } = req.params;
  const fileData= await File.findOne({_id:new ObjectId(id),userId:req.user._id})
  try{
    await rm(`./storage/${id}${fileData.extension}`);
    const file=await File.deleteOne({_id:fileData._id})
    return res.status(200).json('File Deleted Successfully')
  }catch(err){
    console.log('something went wrong',err);
  }
}