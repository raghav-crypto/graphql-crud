const User = require('../../models/User');
const Task = require('../../models/Task');
const { dateToString } = require('../../helpers/date');

const getUser = async userId => {
    const user = await User.findById(userId);
    return {
        ...user._doc,
        tasks: getTasks.bind(this, user._doc.tasks)
    }
}
const getTasks = async taskIds => {
    try {
        const tasks = await Task.find({ _id: { $in: taskIds } });
        return tasks.map(task => {
            return transformTasks(task);
        })
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}
const transformTasks = task => {
    return {
        ...task._doc,
        createdAt: dateToString(task._doc.createdAt),
        creator: getUser.bind(this, task._doc.creator)
    }
}

module.exports = {
    getUser,
    getTasks,
    transformTasks
}