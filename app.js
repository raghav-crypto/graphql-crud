require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const connectDB = require('./config/db');
const graphqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/auth');
const User = require('./models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use(isAuth);

app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true
}))
app.put('/resetpassword/:resetToken', async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.json({ message: "Invalid token", success: true })
    }
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    const userData = { id: user.id }
    const token = jwt.sign(userData,
        process.env.JWT_SECRET,
        { expiresIn: '1h' });
    await user.save();
    return res.json({ success: true, message: "Password Successfully Reset.", data: { token } })
})
app.get('/confirmEmail', async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.json({ message: "Invalid Token", success: false })
        }
        const splitToken = token.split('.')[0];
        const confirmEmailToken = crypto
            .createHash('sha256')
            .update(splitToken)
            .digest('hex');

        // get user by token
        const user = await User.findOne({
            confirmEmailToken,
            isEmailVerified: false,
        });
        if (!user) {
            return res.json({ message: "Invalid Token", success: false })
        }

        // update confirmed to true
        user.confirmEmailToken = undefined;
        user.isEmailVerified = true;

        user.save({ validateBeforeSave: false });
        return res.json({ success: true })
    }
    catch (error) {
        console.log(error);

    }
})
app.listen(3000, () => {
    console.log(`Server is up and running on port ${process.env.PORT || "3000"}`);
})