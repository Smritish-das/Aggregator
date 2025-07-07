const userModel = require('../models/user.models');
const articleModel = require('../models/article.model');

module.exports.createUser = async({ name, email, password, categories }) => {
    if(!name || !email || !password || !categories){
        throw new Error("Please provide all fields");
    }

    // Remove duplicates from categories array
    const uniqueCategories = [...new Set(categories)];

    const user = await userModel.create({
        name,
        email,
        password,
        categories: uniqueCategories
    })

    return user;
}

module.exports.updateUser = async(userId, { name, oldPassword, newPassword, categories }) => {
    const user = await userModel.findById(userId).select('+password');
    if (!user) {
        throw new Error('User not found');
    }

    const updates = {};

    if (name) {
        updates.name = name;
    }

    if (oldPassword && newPassword) {
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }
        updates.password = await userModel.hashPassword(newPassword);
    }

    if (categories) {
        const uniqueCategories = [...new Set(categories)];
        updates.categories = uniqueCategories;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
    );

    return updatedUser;
}

module.exports.getNewsByCategories = async(userId) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const articles = await articleModel.find({
        categories: { $in: user.categories }
    });

    return articles;
}