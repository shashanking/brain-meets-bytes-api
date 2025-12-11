// import mongoose, { Schema } from "mongoose";
// const mongooseIncrement: any = require("mongoose-increment");
// const increment = mongooseIncrement(mongoose);

// export function addIncrement(
//   collection: any,
//   schema: any,
//   field: any,
//   startVal: any,
//   incVal: any,
//   unique: any
// ): void {
//   schema.plugin(increment, {
//     start: startVal,
//     modelName: collection,
//     fieldName: field,
//     unique: unique,
//     increment: incVal,
//   });
// }
// export default { addIncrement };

import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

export default mongoose.model("Counter", CounterSchema);
