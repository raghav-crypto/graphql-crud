const User = require('../../models/User');

module.exports = {
    createUser: async (args) => {
        try {
            const { name, password } = args.userInput;

            const user = await User.create({
                name,
                password,
            })
            await user.save();
            return user;
        } catch (err) {
            if (err.name === 'MongoServerError' && err.code === 11000) {
                throw new Error('Username already exists.');
            }
            throw err;
        }
    }
}