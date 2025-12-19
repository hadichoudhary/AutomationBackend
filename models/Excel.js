const mongoose = require("mongoose");

const excelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    Id: String,

    date: String,
    time: String,

    

    contentTopic: {
      type: String,
      maxlength: 5000,
    },

    output: {
      type: String,
      maxlength: 10000,
      default:null
    },

    facebookOutPut:{
      type:String,
      maxlength: 10000,
      default:null
    },

    status: {
      type: String,
      index: true,
    },

    linkdlnStatus:{
      type: String,
      index: true,
      default:null
    },

    facebookStatus:{
      type: String,
      index: true,
      default:null
    },

    theme: String,
    link: String,

    needImage: {
      type: Boolean,
      default: false,
    },

    imageLink: String,

    platform: {
      type: String,
      lowercase: true,
      index: true,
    },

    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Excel", excelSchema);
