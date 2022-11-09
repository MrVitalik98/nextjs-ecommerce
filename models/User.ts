import mongoose, { Schema, model } from 'mongoose'
import { MongooseSchemaType, MongooseModelType } from '../interfaces'


const userSchema: MongooseSchemaType= new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user'
  },
  root: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
  }
}, {
  versionKey: false,
  timestamps: true
})

const Dataset: MongooseModelType = mongoose.models.user || model('user', userSchema)
export default Dataset