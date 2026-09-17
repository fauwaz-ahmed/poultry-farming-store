import mongoose, { Schema, model, models } from "mongoose";
const ProductSchema = new Schema({
  name:{type:String,required:true,trim:true,index:true},
  slug:{type:String,required:true,unique:true,index:true},
  category:{type:String,required:true,index:true},
  subcategory:String,description:{type:String,required:true},
  images:[String],price:{type:Number,required:true,min:0},
  discountPrice:{type:Number,min:0},stock:{type:Number,required:true,min:0},
  unit:{type:String,required:true},sku:{type:String,required:true,unique:true},
  brand:String,specifications:{type:Map,of:String},details:Schema.Types.Mixed,
  active:{type:Boolean,default:true,index:true},featured:{type:Boolean,default:false,index:true}
},{timestamps:true});
ProductSchema.index({name:"text",description:"text",brand:"text",sku:"text"});
export default models.Product || model("Product", ProductSchema);