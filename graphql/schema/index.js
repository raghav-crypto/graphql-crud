const { buildSchema } = require('graphql');

module.exports = buildSchema(`
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
        type AuthData {
            userId: ID!
            token: String!
            tokenExpiration: Int!
        }
        input TaskInput {
            title: String!
            description: String
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
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `)