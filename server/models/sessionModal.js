import mongoose, { model, Schema } from "mongoose";

 const sessionSchema= new Schema({
   userId:{
    type: Schema.Types.ObjectId,
    ref:'users',
    required:true,
   },
    createdAt:{
       type:Date,
       default:Date.now,
       expires:3600 //30 second set aakine
    }
 },  
{    strict:'throw'
    }
)

const Session= model('Session',sessionSchema)
export default Session