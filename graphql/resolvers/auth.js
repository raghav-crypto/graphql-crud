const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { getTasks } = require('./util');
const { protectRoute } = require('./util');
const Task = require('../../models/Task');
const { unusedFragMessage } = require('graphql/validation/rules/NoUnusedFragments');

module.exports = {
    me: async (args, req) => {
        try {
            protectRoute(req.isAuth);
            const user = await User.findById(req.user.id);
            if (!user) {
                throw new Error("Not Authenticated.")
            }
            return { ...user._doc, tasks: getTasks(user.tasks) };
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    },
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
    },
    login: async (args) => {
        const { name, password } = args.authInput;
        const user = await User.findOne({ name }).select("+password");
        if (!user) {
            throw new Error("User does not exist!");
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            throw new Error("Invalid Password");
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })
        return { userId: user.id, token, tokenExpiration: 1 };
    },
    deleteUser: async (args, req) => {
        protectRoute(req.isAuth);
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                throw new Error("Not Authorized!");
            }

            await Task.deleteMany({ _id: { $in: user.tasks } });
            await user.remove();
            return { success: true };
        } catch (error) {
            console.log(error);
            throw error;
        }

    },
    updateUser: async (args, req) => {
        protectRoute(req.isAuth);
        try {
            const user = await User.findOneAndUpdate({ _id: req.user.id }, { name: args.username }, { new: true });
            return user;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
}