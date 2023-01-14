require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const connectDB = require('./config/db');
const app = express();

const Task = require('./models/Task');
const User = require('./models/User');

app.use(express.json());

connectDB();

const findUser = async userId => {
    const user = await User.findById(userId);
    return {
        ...user._doc,
        tasks: findTasks.bind(this, user._doc.tasks)
    }
}
const findTasks = async taskIds => {
    const tasks = await Task.find({ _id: { $in: taskIds } });
    return tasks.map(task => {
        return { ...task._doc, _id: task.id, creator: findUser.bind(this, task._doc.creator) }
    })
}
app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type User{
            _id: ID!
            name: String!
            createdAt: String!
            tasks: [Task!]
        }
        type Task {
            _id: ID!
            title: String!
            description: String
            status: Boolean!
            createdAt: String!
            creator: User!
        }

        input TaskInput {
            title: String!
            description: String
        }
        input UserInput {
            name: String!
            password: String!
        }
        type RootQuery {
            tasks: [Task!]!
        }
        type RootMutation {
            createTask(taskInput: TaskInput): Task
            createUser(userInput: UserInput): User
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        tasks: async () => {
            const tasks = await Task.find();
            return tasks.map(task => {
                return {
                    ...task._doc,
                    creator: findUser.bind(this, task._doc.creator)
                }
            })
        },
        createTask: async (args) => {
            let task = await Task.create({
                title: args.taskInput.title,
                description: args.taskInput.description,
                creator: "63c284c0dac1760ecc19d061"
            })
            await task.save().then(result => {
                task = { ...result._doc, creator: findUser.bind(this, result._doc.creator) }
            });
            const user = await User.findById("63c284c0dac1760ecc19d061");
            user.tasks.push({ _id: task._id });
            await user.save();
            return task;
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
        }
    },
    graphiql: true
}))
app.listen(3000, () => {
    console.log(`Server is up and running on port ${process.env.PORT || "3000"}`);
})