import mongoose from 'mongoose'

const connectDB = ():void => {
  if(mongoose.connections[0].readyState) {
    console.log('Already connected')
    return
  }

  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }, err => {
    if(err) throw err
    console.log('Connected to mongodb')
  })
}

export default connectDB
