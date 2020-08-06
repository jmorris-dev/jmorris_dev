const express = require('express');
const mongodb = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();

const saltRounds = 10;
const secret = process.env.SECRET_KEY || 'secret';

//GET users takes a username and password and returns token if it matches db

// router.get('/', async (req, res) => {
//     const users = await loadUserCollection();
//     user = await users.findOne({user: req.body.user});
//     authenticated = await bcrypt.compare(req.body.password, user.password)
//     if (authenticated) {
//         res.send(jwt.sign({id: user._id}, secret, { expiresIn: '5d' }));
//     } else res.send(403);
// });

//POST users checks if user exists and if password matches returns a token, otherwise a 403 error
router.post('/', async (req, res) => {
    const users = await loadUserCollection();
    user = await users.findOne({user: req.body.user}).catch(async () => {
        await users.insertOne({
            user: req.body.user,
            password: await bcrypt.hash(req.body.password, saltRounds),
            createdAt: new Date()
        });
    });

    user = await users.findOne({user: req.body.user}).catch((err) => res.send(err));
    authenticated = await bcrypt.compare(req.body.password, user.password)
    if (authenticated) {
        res.send(jwt.sign({id: user._id}, secret, { expiresIn: '1h' }));
    } else res.send(403);
});


async function loadUserCollection() {
    const client = await mongodb.MongoClient.connect
    ('mongodb://localhost:27017', 
    {useUnifiedTopology: true, useNewUrlParser: true});
    return client.db('jmorris_dev').collection('users');
}



module.exports = router;
