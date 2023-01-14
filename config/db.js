const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, () => {
            console.log(`Connected with ${process.env.DB_NAME} Database.`);
        });

    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;