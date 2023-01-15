const Task = require('../../models/Task');
const User = require('../../models/User');
const { transformTasks, getUser } = require('./mergeUtil');

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
    },
    task: async (args) => {
        try {
            const task = await Task.findById(args.taskId)
            if (!task) {
                throw new Error("Task Not Found.");
            }
            return { ...task._doc, creator: getUser(task.creator) };
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    updateTask: async (args, req) => {
        const { title, taskId, description, status } = args.updateTaskInput;
        try {
            if (!req.isAuth) {
                throw new Error("Not Authorized.");
            }
            try {
                let task = await Task.findById(taskId);
                if (!task) {
                    throw new Error("Task Not Found.")
                }
                if (task.creator != req.user.id) {
                    throw new Error("Not Authorized.");
                }
                Object.assign(task, { title, description, status });
                await task.save();
                return task;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    deleteTask: async (args, req) => {
        const { taskId } = args;
        try {
            if (!req.isAuth) {
                throw new Error("Not Authorized.");
            }
            try {
                let task = await Task.findById(taskId);
                if (!task) {
                    throw new Error("Task Not Found.")
                }
                if (task.creator != req.user.id) {
                    throw new Error("Not Authorized.");
                }

                await task.remove();
                return { success: true }
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}