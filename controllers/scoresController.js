const db = require("../models/House");

// Defining methods for the scoresController
module.exports = {
  findAll: function(req, res) {
    console.log("find function in scoresController.js");
    db.find(req.query)
      .sort({ currScore: -1 })
      .then(dbModel => {
        // console.log(dbModel);
        res.json(dbModel);
      })
      .catch(err => res.status(422).json(err));
  },
  findById: function(req, res) {
    console.log("findById function in scoresController.js");
    db.findById(req.params.id)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  findByName: function(req, res) {
    console.log(req.params.playerName);
    console.log("findByName function in scoresController.js");
    db.find({ playerName: req.params.playerName })
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  create: function(req, res) {
    console.log("create function in scoresController.js");
    console.log(req.body);
    if (req.body.currentGuess) {
      console.log("there's a currentGuess here!");
      console.log("req.params.playerName: ");
      console.log(req.params.playerName);
      console.log("req.params.currentGuess: ");
      console.log(req.params.currentGuess);
      console.log("req.body: ");
      console.log(req.body);
      console.log("req.params: ");
      console.log(req.params);
      db.findOneAndUpdate(
        { playerName: req.body.playerName },
        { currentGuess: req.body.currentGuess }
      )
        .then(dbModel => res.json(dbModel))
        .catch(err => res.status(422).json(err));
    } else {
      db.create(req.body)
        .then(dbModel => res.json(dbModel))
        .catch(err => res.status(422).json(err));
    }
  },
  update: function(req, res) {
    console.log("update function in scoresController.js");
    console.log(req.body);
    db.findOneAndUpdate({ playerName: req.params.playerName }, req.body) //route for updating all?
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  // update: function(req, res) {
  //   console.log("update function in scoresController.js");
  //   console.log(req.body);
  //   db.findOneAndUpdate({ _id: req.params.id }, req.body) //route for updating all?
  //     .then(dbModel => res.json(dbModel))
  //     .catch(err => res.status(422).json(err));
  // },
  remove: function(req, res) {
    console.log("remove function in scoresController.js");
    console.log(req.params.id);
    db.findById({ _id: req.params.id })
      .then(dbModel => dbModel.remove())
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  removeAll: function(req, res) {
    console.log("removeAll function in scoresController.js");
    db.deleteMany({}, function(err) {
      if (err) {
        console.log(err);
      }
    });
  }
};
