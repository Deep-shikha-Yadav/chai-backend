import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from
"mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
   videofile:{
        type:String,//cloudinary url
        required:true,
},
    thumbnail:{
       type:String,
        required:true,
    },
    title:{
        type:String,//cloudinary url
        required:true,
    },
     duration:{
      type:Number,
        required:true,
      },
      discription:{
       type:String,
        required:true, 
      },
      views:{
        types:Number,
        default:0,
      },
      isPublished:{
        type:Boolean,
        default:true,
      },
      owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
      }

},
{timestamps:true})


videoSchema.plugin (mongooseAggregatePaginate)
export const video=mongoose.model("video",videoSchema)