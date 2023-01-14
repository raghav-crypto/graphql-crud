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
    `)