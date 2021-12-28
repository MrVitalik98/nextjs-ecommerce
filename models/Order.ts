import mongoose, { Schema, model } from 'mongoose'
import { MongooseSchemaType, MongooseModelType } from '../interfaces'


const orderSchema: MongooseSchemaType = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  cart: Array,
  total: Number
}, {
  timestamps: true,
  versionKey: false
})

const Dataset: MongooseModelType = mongoose.models.order || model('order', orderSchema)
export default Dataset