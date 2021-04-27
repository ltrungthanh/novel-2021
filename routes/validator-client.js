const { check } = require('express-validator');

let validateContactForm = () => {
    return [
        check('name', 'Name must not be empty').not().isEmpty(),
        // check('username', 'Tài khoản phải là chữ và số ').isAlphanumeric(),
        // check('username', 'Tài khoản tối thiểu có 6 ký tự').isLength({ min: 6 }),
        check('email', 'Email must not be empty').not().isEmpty(),
        check('email', 'Email not correct').isEmail(),
        check('sub', 'Subject must not be empty').not().isEmpty(),
        check('sub', 'Subject maximum 160 chars.').isLength({ max: 160 }),
        check('msg', 'Message must not be empty').not().isEmpty(),
        check('msg', 'Message maximum 160 chars. ').isLength({ max: 2000 }),
        check('antispam', 'Anti spam code must not be empty').not().isEmpty()
    ];
}
let validateRegisterUser = () => {
    return [
        check('username', 'Username must not be empty').not().isEmpty(),
        check('username', 'Username must be at least 4 characters long').isLength({ min: 4 }),
        check('email', 'Email must not be empty').not().isEmpty(),
        check('email', 'Email must be a valid email address').isEmail(),
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
        check('password_confirmation').custom((value, { req }) => {
            if (req.body.password === value) {
                return true;
            } else {
                return false;
            }

        }).withMessage('Confirm password must be the same as Password')
    ];
}

let validateLogin = () => {
    return [
        check('email', 'Email must not be empty').not().isEmpty(),
        check('password', 'Password must not be empty').not().isEmpty(),
    ];
}


let validate = {
    validateRegisterUser: validateRegisterUser,
    validateLogin: validateLogin,
    validateContactForm: validateContactForm
};

module.exports = { validate };