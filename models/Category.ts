import mongoose, { Schema, model, Model, Document } from 'mongoose'
import { MongooseSchemaType, MongooseModelType } from '../interfaces'


const categorySchema: MongooseSchemaType = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  products: [
    {
      productId: {
        type: String,
        required: true
      }
    }
  ],
  creator: {
    type: String,
    required: true
  }
}, {
  versionKey: false,
  timestamps: true
})


const Dataset: MongooseModelType = mongoose.models.category || model('category', categorySchema)
export default Dataset