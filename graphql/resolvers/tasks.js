const Task = require('../../models/Task');
const User = require('../../models/User');
const { transformTasks } = require('./mergeUtil');

module.exports = {
    tasks: async () => {
        try {
            const tasks = await Task.find();
            return tasks.map(async task => {
                return transformTasks(task);

            })
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    },
    createTask: async (args, req) => {
        try {
            if (!req.isAuth) {
                throw new Error("Not Authenticated.");
            }
            let task = await Task.create({
                title: args.taskInput.title,
                description: args.taskInput.description,
                creator: req.user.id
            })
            await task.save();
            task = transformTasks(task);
            const user = await User.findById(req.user.id);
            if (!user) {
                throw new Error("User not found.");
            }
            user.tasks.push({ _id: task._id });
            await user.save();
            return task;
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }
}