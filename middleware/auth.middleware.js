const jwt = require('jsonwebtoken')
const userModel = require('../models/user.models')
const blacklistTokenModel = require('../models/blacklistToken.model')


module.exports.authUser = async (req,res,next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({message:'Unauthorized'});
    }

    const blacklistToken = await blacklistTokenModel.findOne({token})
    
    if(blacklistToken){
        return res.status(401).json({message:Unauthorized});
    }
    
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({_id:decoded._id});

        req.user = user;
        next();
    }catch(err){

        return res.status(401).json({message: 'Unauthorized'})
    }
}
