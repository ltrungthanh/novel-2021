var express = require('express');
var router = express.Router();
const Clients = require('../../models/clientModel');

const formidable = require('formidable');
var path = require('path');
const ftp = require("basic-ftp");
var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

let uploadFtp = async function(fileData, file_name) {
    const client = new ftp.Client(10000)
    client.ftp.verbose = true
    try {
        await client.access({
            host: "103.133.108.105",
            user: "vuducthuan1994",
            password: "dungthuan94",
            //secure: true,
            port: 21
        });
        await client.uploadFrom(fileData, `image_service/public/images/${file_name}`);

    } catch (err) {
        console.log("Upload loi")
        console.log(err)
    }
    client.close()
};

router.get('/', isAuthenticated, function(req, res) {
    Clients.find({}, function(err, clients) {
        res.render('admin/pages/hosts/index', { title: "Host", clients: clients.map(client => client.toJSON()), layout: 'admin.hbs' });
    }).sort({ updated_date: -1 });
});


router.get('/edit-client/:host', isAuthenticated, function(req, res) {
    Clients.findOne({ host: req.params.host }, function(err, client) {
        if (!err) {
            let domainName = client.host.split('.')[0];
            console.log(domainName)
            res.render('admin/pages/hosts/edit', {
                messages: req.flash('messages'),
                client: client,
                title: "Edit Host",
                domainName: domainName,
                layout: 'admin.hbs'
            });
        }
    }).lean();
});


router.post('/edit-client/:host', isAuthenticated, function(req, res) {
    const form = formidable({ multiples: true });
    const domainName = req.params.host.trim().split('.')[0];

    form.on('fileBegin', function(name, file) {
        if (name == 'home_image' && file.name !== '') {
            uploadFtp(file.path, `home_page_${domainName}.png`)
        }
        if (name == 'logo' && file.name !== '') {
            uploadFtp(file.path, `logo_${domainName}.png`)
        }
    });
    form.parse(req, (err, fields) => {

        if (err) {
            req.flash('messages', "Update khong thanh cong !");
        } else {
            Clients.updateOne({ host: fields.host }, fields, function(err, callback) {
                if (!err) {
                    req.flash('messages', 'Update thành công !')
                    res.redirect('back');
                } else {
                    req.flash('messages', 'Update không thành công công !')
                    res.redirect('back');
                }
            });
        }
    });



});
router.get('/add-client', isAuthenticated, function(req, res) {
    res.render('admin/pages/hosts/add-client', { title: "Thêm mới client", layout: 'admin.hbs' });
});

router.post('/add-client', isAuthenticated, function(req, res) {
    const form = formidable({ multiples: true });
    let domainName = process.env.DOMAIN_NAME;
    form.on('fileBegin', function(name, file) {
        if (name == 'home_image' && file.name !== '') {
            file.path = path.join(__basedir, `public/img/homepage_${domainName}.png`);
        }
        if (name == 'logo' && file.name !== '') {
            file.path = path.join(__basedir, `public/img/logo_${domainName}.png`);
        }
    });
    form.parse(req, (err, fields) => {
        if (err) {
            req.flash('messages', "Update khong thanh cong !");
            res.redirect('back');
        } else {
            Clients.create(fields, function(err, data) {
                if (!err) {
                    req.flash('messages', 'Thêm thành công !')
                    res.redirect('/admin/hosts');

                } else {
                    req.flash('messages', 'Không thêm được clients')
                    res.redirect('back');
                }
            });
        }
    });
});

router.get('/delete/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    Clients.remove({
        _id: id,
    }, function(err) {
        if (!err) {
            req.flash('messages', 'Delete Client Success !')
            res.redirect('back');
        } else {
            req.flash('messages', 'Delete Client Fail ! !')
            res.redirect('back');
        }
    });
});


module.exports = router;