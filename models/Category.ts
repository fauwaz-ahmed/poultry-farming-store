import mongoose, { Schema, model, models } from "mongoose";
const CategorySchema = new Schema({
  name:{type:String,required:true,trim:true},
  slug:{type:String,required:true,unique:true,index:true},
  description:String,image:String,active:{type:Boolean,default:true},
  parentId:{type:Schema.Types.ObjectId,ref:"Category",default:null}
},{timestamps:true});
export default models.Category || model("Category", CategorySchema);