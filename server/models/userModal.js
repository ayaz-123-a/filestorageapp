import { model, Schema } from "mongoose";
import bcrypt from 'bcrypt'
 const userSchema= new Schema({
    name:{
        type:String,
        required:true,
        minLength:[3,'name should be minimum of 3 character']
    },
    email:{
        type:String,
        required:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,'Please enter the valid email'],
        unique: true
    }, 
    password:{
        type:String,
    },
    rootDirId:{
        type:Schema.Types.ObjectId,
        ref:'Directory',
        required:true
    }, 
    picture:{
        type:String,
        default:'https://i.pinimg.com/736x/1d/ec/e2/1dece2c8357bdd7cee3b15036344faf5.jpg'
    }
 },  
{    strict:'warning'
    }
)

userSchema.pre('save', async function (next) {
  // 'this' refers to the document being saved

  // If there's no password or it hasn't been modified, skip
  if (!this.isModified('password') || !this.password) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User= model('User',userSchema)

export default User