const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Connected with Database");

    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;