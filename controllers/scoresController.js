const db = require("../models");

// Defining methods for the scoresController
module.exports = {
  findAll: function(req, res) {
    db.House.find(req.query)
      .sort({ currScore: -1 })
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  findById: function(req, res) {
    console.log("findById function in scoresController.js");
    db.House.findById(req.params.id)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  create: function(req, res) {
    console.log("create function in scoresController.js");
    db.House.create(req.body)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  update: function(req, res) {
    console.log("update function in scoresController.js");
    db.House.findOneAndUpdate({ _id: req.params.id }, req.body) //route for updating all?
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
    // },
    // remove: function(req, res) {
    //   db.House.findById({ _id: req.params.id })
    //     .then(dbModel => dbModel.remove())
    //     .then(dbModel => res.json(dbModel))
    //     .catch(err => res.status(422).json(err));
  }
};