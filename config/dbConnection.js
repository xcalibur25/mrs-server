const mongoose = require("mongoose")
const connectDB = async () => {
    try {
        console.log("Connection string: ", process.env.CONNECTION_STRING);
        mongoose.set('debug', true);
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Database connected: ",connect.connection.host, connect.connection.name);

    } catch (err) {
        console.log(err);
        process.exit(1);
    }

}

module.exports = connectDB;