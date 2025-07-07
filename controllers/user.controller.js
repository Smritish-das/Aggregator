const { validationResult } = require('express-validator');
const blacklistTokenModel = require('../models/blacklistToken.model')
const userModel = require('../models/user.models')
const userService = require('../services/user.service')


module.exports.registerUser = async(req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const { name, email, password, categories } = req.body;

    const UserAlreadyExists = await userModel.findOne({email});

    if(UserAlreadyExists){
        return res.status(400).json({message:'User already exists'});
    }

    const hashPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        name,
        email,
        password: hashPassword,
        categories
    });

    const token = user.generateAuthToken();

    res.cookie('token', token,
        {
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            samesite:'strict',
            maxAge:7 * 24 * 60 * 60 * 1000
        });

    return res.status(201).json({token, user});
}

module.exports.loginUser = async(req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const { email, password } = req.body;
    const user = await userModel.findOne({email}).select('+password');

    if(!user){
        return res.status(401).json({message:'Invalid email or password'});
    }

    const isMatch = await user.comparePassword(password);

    if(!isMatch){
        return res.status(401).json({message:'Invalid email or password'})
    }

    const token = user.generateAuthToken();

    res.cookie('token', token,
        {
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            samesite:'strict',
            maxAge:7 * 24 * 60 * 60 * 1000
        });

    res.status(200).json({token, user})
}

module.exports.getUserProfile = async(req,res) => {
    const user = req.user

    res.status(200).json(user);

}

module.exports.updateUser = async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try {
        const { name, oldPassword, newPassword, categories } = req.body;
        const updatedUser = await userService.updateUser(req.user._id, {
            name,
            oldPassword,
            newPassword,
            categories
        });

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports.logoutUser = async(req,res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    req.clearCookie('token');

    const exists = await blacklistTokenModel.findOne({token});
    if(!exists){
        await blacklistTokenModel.create({token});
    }else{
        console.log("Token already blacklisted");
    }
    res.status(200).json({message:'Logged out successfully'})
}

module.exports.getNewsByCategories = async(req, res) => {
    try {
        const articles = await userService.getNewsByCategories(req.user._id);
        res.status(200).json({
            articles
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
}