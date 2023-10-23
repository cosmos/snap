import * as mongoose from 'mongoose';
import { Chain } from "./types/chains";
import { registry } from "./types/registry";
import { MONGODB_URI } from "./constants"


mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    } as mongoose.ConnectOptions)
    .then(async connection => {
      // TODO app logic
    })
    .catch(error => console.log(error));



// Define a schema for notifications
const notificationSchema = new mongoose.Schema({
    read: Boolean,
    address: String,
    lease: String,
    notification: String,
  });
  
// Create a model based on the schema
const Notification = mongoose.model('Notification', notificationSchema);