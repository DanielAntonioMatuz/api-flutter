var User = require('../models/user')
var jwt = require('jwt-simple')
var config = require('../config/dbconfig')

var functions = {
    addNew: function (req, res) {
        if ((!req.body.name) || (!req.body.password)) {
            res.json({success: false, msg: 'Enter all fields'})
        }
        else {
            var newUser = User({
                name: req.body.name,
                password: req.body.password,
                domiciality: req.body.domiciality,
                age: req.body.age
            });
            newUser.save(function (err, newUser) {
                if (err) {
                    res.json({success: false, msg: 'Failed to save'})
                }
                else {
                    res.json({success: true, msg: 'Successfully saved'})
                }
            })
        }
    },
    authenticate: function (req, res) {
        User.findOne({
            name: req.body.name
        }, function (err, user) {
                if (err) throw err
                if (!user) {
                    res.status(403).send({success: false, msg: 'Authentication Failed, User not found'})
                }

                else {
                    user.comparePassword(req.body.password, function (err, isMatch) {
                        if (isMatch && !err) {
                            var token = jwt.encode(user, config.secret)
                            res.json({success: true, token: token, id:user._id})
                        }
                        else {
                            return res.status(403).send({success: false, msg: 'Authentication failed, wrong password'})
                        }
                    })
                }
        }
        )
    },
    getinfo: function (req, res) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1]
            var decodedtoken = jwt.decode(token, config.secret)
            return res.json({success: true, msg: decodedtoken})
        }
        else {
            return res.json({success: false, msg: 'No Headers'})
        }
    },
    updateInfo: function (req, res) {
        var data = req.body;

        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1]
            var decodedtoken = jwt.decode(token, config.secret)
        }
        else {
            return res.json({success: false, msg: 'No Headers'})
        }

        var id = decodedtoken._id;

        console.log(data);

        User.findByIdAndUpdate(id, {
            domiciality: data.domiciality,
            age: data.age
        }, (err, user_data) => {
            if (user_data) {
                res.status(200).send({user: user_data});
            }
        });
    },
    getUserInfo: function (req, res) {

        let id = req.params['id'];

        User.findById(id, (err, user) => {
            if(err){
                res.status(500).send({message: 'Error en el servidor'});
            } else {
                if(user){
                    res.status(200).send({user:user});
                } else {
                    res.status(500).send({message:'No existe un usuario con ese ID'});
                }
            }
        })
    }
}

module.exports = functions