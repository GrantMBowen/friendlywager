import "./style.css";
import React, { Component } from "react";
import Leaderboard from "../../components/Leaderboard";
import AdminBtns from "../../components/AdminBtns";
import { Col, Row, Container } from "../../components/Grid";
import PlayerAPI from "../../utils/PlayerAPI";
import HouseAPI from "../../utils/HouseAPI";
import io from "socket.io-client";
import Logo from "../../components/Logo";

class AdminGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scoreSeed: [],
      answer: " ",
      currentGuess: "",
      gameId: ""
    };

    this.socket = io("https://justafriendlywager.herokuapp.com/", {
      transports: ["websocket"]
    });

    this.componentDidMount = () => {
      this.setState({ gameId: this.props.match.params.gameId });
    };

    //When socket receives a current bet from a user, update the scoreSeed state
    this.socket.on("RECIEVE_MESSAGE", function(data) {
      //If there is a currentGuess, render to the page
      if (data.playerName) {
        console.log(data.playerName);
        addUserInfo(data);
        console.log(
          "the guess " +
            data.currentGuess +
            " came from user " +
            data.playerName +
            "and this game: " +
            data.gameId
        );
      }
    });

    const addUserInfo = data => {
      console.log("here's the data sent from users by socket");
      console.log(data); // {playerName: "Tarzan", currentGuess: " "}
      console.log("here's the scoreseed: ");
      console.log(this.state.scoreSeed);
      this.setState(state => {
        var playerIndex = -1;
        var alreadyHere = false;
        //make sure we only update current players's guesses
        for (let i = 0; i < state.scoreSeed.length; i++) {
          if (state.scoreSeed[i].playerName === data.playerName) {
            //malfunctions if you use === - It behaves like the data types are different, when they SHOULD both be strings
            playerIndex = i;
            console.log("these names are matching!");
            alreadyHere = true;
            break;
          } else {
            console.log("hey these names don't match");
            alreadyHere = false;
          }
        }
        // Create a new card for new player
        if (!alreadyHere) {
          // may need to change currScore default for late logins
          // data.currScore = 50;
          const scoreSeed = state.scoreSeed.concat(data);
          return { scoreSeed };
        } else {
          const scoreSeed = [...state.scoreSeed];
          scoreSeed[playerIndex].currentGuess = data.currentGuess;
          playerIndex = -1;
          return { scoreSeed };
        }
      });
    };

    //what purpose does this serve? If I move this or remove this, the following functions become undefined
    this.sendUserInfo = ev => {
      ev.preventDefault();
      this.socket.emit("SEND_MESSAGE", {
        user: this.state.scoreSeed.user,
        currentGuess: this.state.scoreSeed.currentGuess
      });
    };
  }

  setModalHalt = ev => {
    this.socket.emit("toggle_modal", {
      gameId: this.state.gameId,
      setModalHalt: true
    });
  };

  setModalCorrect = value => {
    this.socket.emit("toggle_modal", {
      gameId: this.state.gameId,
      setModalHalt: false,
      setModalCorrect: true,
      answer: value
    });
  };

  haltBets = () => {
    console.log("halt bets button pressed");
    // io.socket.off();  //does not work yet
  };

  //send house answer and player guesses to the server for calculation
  handleAnswer = value => {
    const toSend = [{ answer: value }, { gameId: this.state.gameId }];
    // const toSend = this.state.scoreSeed.concat(houseAnswer);
    console.log(toSend);
    PlayerAPI.calculateScores(toSend).then(res => {
      console.log("scores saved");
      console.log("after that, ...");
      console.log(res.data);
      this.setState({
        scoreSeed: res.data
      });
      console.log("this.state.scoreSeed is now: ");
      console.log(this.state.scoreSeed);
    });
  };

  // deleteAllPlayers = () => {
  //   PlayerAPI.deleteAllPlayers().then(res => {
  //     this.setState(state => {
  //       state.scoreSeed = [];
  //     });
  //   });
  //   console.log("deletingggggg");
  //   window.location.reload();
  // };

  endGame = () => {
    const toSave = { _id: this.state.gameId, gameOver: true };
    HouseAPI.saveGame(toSave).then(res => {
      console.log(res.data);
    });
  };

  //Maybe add: only render if the admin in the database matches the admin params
  //create message with link to login if this is not the case

  render() {
    return (
      <div className="bglayer">
        <Container fluid>
          <Row>
            <Col size="md-8">
              {/* <div className="wrapper"> */}
              <Leaderboard
                scoreSeed={this.state.scoreSeed}
                gameId={this.props.match.params.gameId}
                currentGuess={this.state.currentGuess}
                // deleteAllPlayers={this.deleteAllPlayers}
                endGame={this.endGame}
              />
              {/* </div> */}
            </Col>

            <Col size="md-4" className="center-buttons">
              <Logo />

              <AdminBtns
                handleAnswer={this.handleAnswer}
                setModalHalt={this.setModalHalt}
                setModalCorrect={this.setModalCorrect}
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default AdminGame;
