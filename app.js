require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const connectDB = require('./config/db');
const app = express();

const Task = require('./models/Task');

app.use(express.json());

connectDB();

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Task {
            _id: ID!
            title: String!
            description: String
            status: Boolean!
            createdAt: String!
        }
        input TaskInput {
            title: String!
            description: String
        }
        type RootQuery {
            tasks: [Task!]!
        }
        type RootMutation {
            createTask(taskInput: TaskInput): Task
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        tasks: async () => {
            const tasks = await Task.find();
            return tasks;
        },
        createTask: async (args) => {
            const task = await Task.create({
                title: args.taskInput.title,
                description: args.taskInput.description,
            })
            await task.save();
            return task;
        }
    },
    graphiql: true
}))
app.listen(3000, () => {
    console.log(`Server is up and running on port ${process.env.PORT || "3000"}`);
})