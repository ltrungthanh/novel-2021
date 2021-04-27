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
        check('msg', 'Message maximum 160 chars.').isLength({ max: 2000 }),
        check('antispam', 'Anti spam code must not be empty').not().isEmpty()
    ];
}
let validateRegisterUser = () => {
    return [
        check('username', 'Tài khoản không được để trống').not().isEmpty(),
        check('username', 'Tài khoản phải là chữ và số ').isAlphanumeric(),
        check('username', 'Tài khoản tối thiểu có 6 ký tự').isLength({ min: 6 }),
        check('email', 'Bạn chưa nhập email ').not().isEmpty(),
        check('email', 'Email không đúng').isEmail(),
        check('password', 'Mật khẩu tối thiểu có 6 ký tự').isLength({ min: 6 }),
        check('confirmPassword').custom((value, { req }) => {
            if (req.body.password === value) {
                return true;
            } else {
                return false;
            }

        }).withMessage('Mật khẩu chưa trùng'),
        check('agree').isIn(['on']).withMessage('Bạn chưa đồng ý điều khoản')
    ];
}

let validateLogin = () => {
    return [
        check('user.email', 'Invalid does not Empty').not().isEmpty(),
        check('user.email', 'Invalid email').isEmail(),
        check('user.password', 'password more than 6 degits').isLength({ min: 6 })
    ];
}

let validateEditUSer = () => {
    return [
        check('email', 'Email không đúng').isEmail(),
        check('hash_password', 'Mật khẩu tối thiểu có 6 ký tự').isLength({ min: 6 }),
        check('confirmPassword').custom((value, { req }) => {
            if (req.body.hash_password === value) {
                return true;
            } else {
                return false;
            }

        }).withMessage('Mật khẩu chưa trùng'),
    ]
}
let validate = {
    validateRegisterUser: validateRegisterUser,
    validateLogin: validateLogin,
    validateEditUSer: validateEditUSer,
    validateContactForm :validateContactForm
};

module.exports = { validate };