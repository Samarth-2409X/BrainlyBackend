import mongoose, {model, Schema } from "mongoose";
import dotenv from "dotenv";

dotenv.config();
mongoose.connect(process.env.MONGO_URL!);

const UserSchema = new Schema({
    username: {type: String, unique:true},
    password: String
})
export const UserModel =  model("User", UserSchema);

const ContentSchema = new Schema({
  title: String,
  link: String,
  tags: [{type: Schema.Types.ObjectId, ref: "Tag"}],
  type: { 
    type: String, 
    enum: ["youtube", "twitter", "document", "link"], 
    required: true 
  },
  userId: {type: Schema.Types.ObjectId, ref:"User", required: true}
})

export const ContentModel = model("Content", ContentSchema);

const LinkSchema = new Schema({
    hash:String,
    userId:{type: mongoose.Types.ObjectId, ref:"User", required:true, unique:true}
})

export const LinkModel = model("Links", LinkSchema);

const TagSchema = new Schema({
  title:{type: String, required: true, unique:true}
})

export const TagsModel = model("Tag", TagSchema);



