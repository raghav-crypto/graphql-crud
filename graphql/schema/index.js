const { buildSchema } = require('graphql');

module.exports = buildSchema(`
        type Error {
            path: String!
            message: String!
        }
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
        type DeleteTask {
            success: Boolean!
            error: [Error!]
        }
        type AuthData {
            userId: ID!
            token: String!
            tokenExpiration: Int!
        }
        input TaskInput {
            title: String!
            description: String
        }
        input UpdateTaskInput {
            taskId: String!
            title: String
            description: String
            status: Boolean
        }
        input AuthInput { 
            name: String!
            password: String!
        }
        input UserInput {
            name: String!
            password: String!
        }
        type RootQuery {
            tasks: [Task!]!
            me: User!
        }
        type RootMutation {
            createTask(taskInput: TaskInput): Task
            createUser(userInput: UserInput): User
            login(authInput: AuthInput): AuthData
            task(taskId: String!): Task!
            updateTask(updateTaskInput: UpdateTaskInput): Task
            deleteTask(taskId: String!): DeleteTask
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `)