const express = require('express')
const router = express.Router();
const { body } = require('express-validator')
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register',[
    body('categories').isArray().withMessage('Categories must be an array')
        .custom((value) => {
            if (!value || value.length === 0) {
                throw new Error('At least one category must be selected');
            }
            const validCategories = ['Technology', 'Business', 'Entertainment', 'Environment', 'Finance', 'Smart Home', 'Social Media', 'Retail'];
            const isValid = value.every(cat => validCategories.includes(cat));
            if (!isValid) {
                throw new Error('Invalid category selected. Must be one of: Technology, Business, Entertainment, Environment, Finance, Smart Home, Social Media, Retail');
            }
            return true;
        }),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('name').isLength({min:3}).withMessage('First name must be at least of 3 character'),
    body('password').isLength({min:6}).withMessage('Password must be at least of 6 characters')
], userController.registerUser);

router.post('/login',[
    body('email').isEmail().withMessage('Enter a valid email.'),
    body('password').isLength({min:6}).withMessage('Enter a valid password')
],userController.loginUser);

router.get('/profile',authMiddleware.authUser, userController.getUserProfile)

router.get('/logout',authMiddleware.authUser, userController.logoutUser);

router.get('/news', authMiddleware.authUser, userController.getNewsByCategories);

router.put('/update', [
    authMiddleware.authUser,
    body('name').optional().isLength({min: 3}).withMessage('Name must be at least 3 characters long'),
    body('oldPassword').optional().isLength({min: 6}).withMessage('Old password must be at least 6 characters'),
    body('newPassword')
        .optional()
        .isLength({min: 6}).withMessage('New password must be at least 6 characters')
        .custom((value, { req }) => {
            if (req.body.oldPassword && !value) {
                throw new Error('New password is required when old password is provided');
            }
            if (!req.body.oldPassword && value) {
                throw new Error('Old password is required to set new password');
            }
            return true;
        }),
    body('categories').optional()
        .isArray().withMessage('Categories must be an array')
        .custom((value) => {
            if (value && value.length === 0) {
                throw new Error('At least one category must be selected');
            }
            if (value) {
                const validCategories = ['Technology', 'Business', 'Entertainment', 'Environment', 'Finance', 'Smart Home', 'Social Media', 'Retail'];
                const isValid = value.every(cat => validCategories.includes(cat));
                if (!isValid) {
                    throw new Error('Invalid category selected. Must be one of: Technology, Business, Entertainment, Environment, Finance, Smart Home, Social Media, Retail');
                }
            }
            return true;
        })
], userController.updateUser);

module.exports = router;