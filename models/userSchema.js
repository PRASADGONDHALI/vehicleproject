const mongoose = require("mongoose");


const vehicleSchema = new mongoose.Schema({
    vehicleName: {
      type: String,
      required: true,
      trim: true,
    },
    speed: {
      type: Number,
      required: true,
      min: 0,
    },
    positionX: {
      type: Number,
      required: true,
      min: 0,
      max: 800,
    },
    positionY: {
      type: Number,
      required: true,
      min: 0,
      max: 800,
    },
    direction: {
      type: String,
      required: true,
    },
  });
  

const userSchema = new mongoose.Schema({
    scenarioName:{
        type: String,
        required: true,
        trim: true,
    },
    scenarioTime:{
        type: Number,
        required: true,
        min: 0,
    },
    vehicles: [vehicleSchema],
});

const userdb = new mongoose.model("users", userSchema);

module.exports = userdb;
