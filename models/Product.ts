import mongoose, { Schema, model } from 'mongoose'
import { MongooseSchemaType, MongooseModelType } from '../interfaces'


const productSchema: MongooseSchemaType = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  images: {
    type: Array,
    required: true
  },
  checked: {
    type: Boolean,
    default: false
  },
  inStock: {
    type: Number,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true
  },
  creator: {
    type: String
  },
  quantity: {
    type: Number,
    default: 1
  }
}, {
  versionKey: false,
  timestamps: true
})


const Dataset: MongooseModelType = mongoose.models.product || model('product', productSchema)
export default Dataset