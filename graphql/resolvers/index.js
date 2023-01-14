const authResolver = require('./auth');
const tasksResolver = require('./tasks');

const rootResolver = {
    ...authResolver,
    ...tasksResolver
}
module.exports = rootResolver;