const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { getTasks } = require('./util');
const { protectRoute } = require('./util');
const Task = require('../../models/Task');
const sendEmail = require('../../helpers/sendEmail');

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
            const { name, password, email } = args.userInput;

            const user = await User.create({
                name,
                password,
                email
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
    },
    forgotPassword: async (args, req) => {
        const user = await User.findOne({ email: args.email });
        if (!user) {
            throw new Error("User Not found.");
        }
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });
        const resetUrl = `${req.protocol}://${req.get(
            'host',
        )}/resetpassword/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message,
            });

            return { success: true };
        } catch (err) {
            console.log(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });
            throw new Error("Email could not be sent");
        }
    }
}