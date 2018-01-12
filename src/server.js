/*eslint-disable */
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const Post = require('./post.js');

const STATUS_USER_ERROR = 422;

const server = express();
// to enable parsing of json bodies for post requests

server.use(bodyParser.json());

// server.get('/', (req,res) => {
//     Post.find()
//      .then(results => res.status(200).json(results))
//      .catch(error => res.status(400).json({error:'Some error is there'}));
// })

server.get('/accepted-answer/:soID', (req, res) => {
  const id = req.params.soID;
  Post.findOne({ soID: id })
    .then(question =>{
        if(!question) throw new Error('No Question Found');
        if(!question.acceptedAnswerID) throw new Error('No Answer Found');
        return Post.findOne({soID: question.acceptedAnswerID})
    })
    .then( answer => {
        res.status(200).json(answer)
    })
    .catch( error => {
        res.status(STATUS_USER_ERROR).json({error: error.message})
    })
});

server.get('/top-answer/:soID', (req, res) => {
    const id = req.params.soID;
    Post.find({parentID: id}).sort({score:'desc'})
        .then( answers => {
            if(!answers) throw new Error('No Answers on asked question');
            res.status(200).json(answers[0])
        })
        .catch( error => {
            res.status(STATUS_USER_ERROR).json({error: error.message})
        } )
  });

  server.get('/popular-jquery-questions', (req, res) => {
    Post.find({tags: 'jquery'} )
        .or(
            [
                {score:{$gt:5000}},
                {'user.reputation':{$gt:200000}}
            ]
        )
        .then( answers => {
            if(!answers) throw new Error('No Answers on asked question');
            res.status(200).json(answers)
        })
        .catch( error => {
            res.status(STATUS_USER_ERROR).json({error: error.message})
        } )
  });

  server.get('/npm-answers', (req, res) => {
    Post.find( {tags: 'npm'} )
        .then( questions => {
            if(!questions) throw new Error('No questions on asked question');
            const soIDs = []
            questions.forEach(question => soIDs.push(question.soID));
            return Post.find({ parentID: { $in: soIDs } })
        })
        .then((answers) => {
            if (answers.length === 0) throw new Error('No answers found');
            res.status(200).json(answers);
        })
        .catch( error => {
            res.status(STATUS_USER_ERROR).json({error: error.message})
        })
  });

// TODO: write your route handlers here
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/so-posts', { useMongoClient: true })
.then(function() {
    server.listen(5000,function(){
        console.log('The databases are connected to server')
    });
})
.catch(function(err) {
    console.log('Database Connection Failed')
})
module.exports = { server };
