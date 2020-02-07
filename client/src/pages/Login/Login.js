import React, { Component } from "react";
import PlayerAPI from "../../utils/PlayerAPI";
import HouseAPI from "../../utils/HouseAPI";
import { FormBtn, Input } from "../../components/Form";
import Logo from "../../components/Logo";
import InstructionsModal from "../../components/instructionsModal";
import AlertMessages from "../../components/Alerts";
import { Row, Col, Container } from "../../components/Grid";
import "./style.css";

let count = 1;

class Login extends Component {
  // Setting our component's initial state
  state = {
    username: "",
    playerEmail: "",
    possiblePlayerId: "",
    message: 0,
    adminLoginBoolean: false,
    adminEmail: "",
    adminName: "",
    emailButton: false,
    playerEmailButton: false,
    //all games pulled from the database (array of objects), used for rendering dropdowns:
    games: [],
    // ex: Bears v. Packers, entered by admin:
    newGame: "",
    gameInfo: "",
    // Unique id of game from dropdown selection:
    gameId: "",
    introModal: false,
    page: 1,
    nextOrClose: "Next",
    alertVisible: false
  };

  componentDidMount() {
    this.setState({ introModal: true });
  }

  loadGames = () => {
    HouseAPI.getAllGames().then(res => {
      this.setState({ games: res.data });
    });
  };

  // This ONCE handled form input change for all admin game dropdown, but now it is unused
  //bug: If this function is removed, at times you are unable to type in the form input areas...????!!!!
  handleDropdownInputChange = event => {
    this.setState({
      ...this.state,
      gameInfo: event.target.value,
      gameId: event.target.id
    });
  };

  //handles form input change for all fields
  handleInputChange = event => {
    const value = event.target.value;
    this.setState({
      ...this.state,
      [event.target.name]: value
    });
  };

  // to add to dropdown: if there are no games set up, send out a message, and redirect to the admin page to create a game
  setGameInfo = (name, id) => {
    this.setState({ gameInfo: name });
    //If there is an id, this was selected by a player
    if (id) {
      this.setState({ gameId: id });
    }
  };

  //================================= Player Login Function ====================================

  //search the database for any matching usernames.
  //If matching, alert the user to change their name
  handlePlayerSave = event => {
    event.preventDefault();
    //verify unique username
    if (this.state.username && this.state.gameId && this.state.playerEmail) {
      if (
        !this.state.playerEmail.match(
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        )
      ) {
        this.setState({
          message: 9,
          alertVisible: true
        });
        return;
      }
      if (this.state.username.length > 32) {
        this.setState({
          message: 10,
          alertVisible: true
        });
        return;
      }
      PlayerAPI.getPlayers(this.state.gameId)
        .then(res => {
          for (let i = 0; i < res.data.length; i++) {
            // if player already exists and was kicked out
            // Will need to change to load leaderboard for later data access
            if (
              this.state.username === res.data[i].playerName &&
              this.state.gameId === res.data[i].gameId &&
              res.data[i].kickedOut === true
            ) {
              this.setState({
                message: 1,
                alertVisible: true
              });
              return;
            }
            //if player already exists and kickedOut = false and all data matches, log in
            if (
              this.state.username === res.data[i].playerName &&
              this.state.playerEmail === res.data[i].playerEmail &&
              res.data[i].kickedOut === false
            ) {
              this.setState({
                message: 2,
                alertVisible: true
              });
              // to change: if gameOver = true (in House model), take to the stats page
              setTimeout(() => {
                window.location =
                  "/game/" +
                  this.state.gameId +
                  "/user/" +
                  this.state.username +
                  "/userid/" +
                  res.data[i]._id;
                return;
              }, 3000);
              // });
            }
            // if this game already has a player with this playername, but a different email, Alert that their email is incorrect, or, if this is a taken username, they can pick a new username
            if (
              this.state.username === res.data[i].playerName &&
              this.state.playerEmail !== res.data[i].playerEmail
              //   ||
              // (this.state.username !== res.data[i].playerName &&
              //   this.state.playerEmail === res.data[i].playerEmail)
            ) {
              this.setState({ possiblePlayerId: res.data[i]._id });
              this.setState({
                message: 3,
                alertVisible: true
              });
              this.setState({ playerEmailButton: true });
              return;
            }
          }
          // if the data is all new, save and log in
          if (
            this.state.username &&
            this.state.gameId &&
            this.state.playerEmail
          ) {
            //handle save
            const toSave = {
              playerName: this.state.username,
              gameId: this.state.gameId,
              playerEmail: this.state.playerEmail
            };
            PlayerAPI.savePlayer(toSave).then(res => {
              console.log(res.data);
              this.setState({
                message: 4,
                alertVisible: true
              });
              // to change: if gameOver = true (in House model), take to the stats page
              setTimeout(() => {
                window.location =
                  "/game/" +
                  this.state.gameId +
                  "/user/" +
                  this.state.username +
                  "/userid/" +
                  res.data._id;
              }, 3000);
            });
          }
        })
        .catch(err => console.log(err));
    }
  };

  emailPlayerUsername = event => {
    event.preventDefault();
    const toFind = this.state.possiblePlayerId;
    PlayerAPI.getPlayerScore(toFind).then(res => {
      const toSend = {
        playerName: res.data.playerName,
        playerEmail: res.data.playerEmail
      };
      HouseAPI.sendEmail(toSend);
    });
    return;
  };

  //================================ Admin Login Function ====================================
  // consider saving the admin info in a separate collection, querying the collection, then adding that info (gameInfo and _id) to the corresponding game

  handleAdminSave = event => {
    event.preventDefault();
    if (
      !this.state.adminEmail.match(
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      )
    ) {
      this.setState({
        message: 9,
        alertVisible: true
      });
      return;
    }
    if (this.state.adminName.length > 32) {
      this.setState({
        message: 10,
        alertVisible: true
      });
      return;
    }
    // This is a new game to save. Accept all fields and save
    else if (this.state.newGame) {
      this.setState(state => {
        state.gameInfo = "";
        state.gameId = "";
      });
      const toSave = {
        adminName: this.state.adminName,
        adminEmail: this.state.adminEmail,
        gameInfo: this.state.newGame
      };
      HouseAPI.saveGame(toSave).then(res => {
        this.setState({
          message: 5,
          alertVisible: true
        });
        // to change: if gameOver = true (in House model), take to the stats page
        setTimeout(() => {
          window.location =
            "/admingame/" + res.data._id + "/admin/" + this.state.adminName;
        }, 3000);
      });
    }

    // This is a previously created game. Go to the page after checking admin credentials.
    else if (
      this.state.adminName &&
      this.state.adminEmail &&
      this.state.gameInfo
    ) {
      const toFind = this.state.gameId;

      HouseAPI.getGameInfo(toFind)
        .then(res => {
          // If there is an admin already in the system, they were logged out
          // Make sure their email and name match the database then log them back in
          if (res.data) {
            if (
              this.state.adminName !== res.data.adminName &&
              this.state.adminEmail !== res.data.adminEmail
            ) {
              this.setState({
                message: 6,
                alertVisible: true
              });
              return;
            } else if (
              this.state.adminEmail === res.data.adminEmail &&
              this.state.gameId === res.data._id &&
              this.state.adminName !== res.data.adminName
            ) {
              this.setState({
                message: 7,
                alertVisible: true
              });
              //email username option...add button to email
              this.setState({ emailButton: true });
              return;
            } else if (
              this.state.adminName === res.data.adminName &&
              this.state.gameId === res.data._id &&
              this.state.adminEmail !== res.data.adminEmail
            ) {
              this.setState({
                message: 8,
                alertVisible: true
              });
              //email username option...add button to email
              this.setState({ emailButton: true });
              return;
            }

            // if already in the database and their input matches, load the admin page
            else if (
              this.state.adminName === res.data.adminName &&
              this.state.adminEmail === res.data.adminEmail &&
              this.state.gameId === res.data._id
            ) {
              this.setState({
                message: 2,
                alertVisible: true
              });
              // to change: if gameOver = true (in House model), take to the stats page
              setTimeout(() => {
                window.location =
                  "/admingame/" +
                  this.state.gameId +
                  "/admin/" +
                  this.state.adminName;
              }, 3000);
            }
          }
        })
        .catch(err => console.log(err));
    }
  };

  emailUsername = event => {
    event.preventDefault();
    const toFind = this.state.gameId;
    HouseAPI.getGameInfo(toFind).then(res => {
      const toSend = {
        adminName: res.data.adminName,
        adminEmail: res.data.adminEmail
      };
      HouseAPI.sendEmail(toSend);
    });
    return;
  };

  // ============================== Modal Controls and Conditional Rendering ======================================
  toggleLogin = event => {
    this.setState(prevState => ({
      adminLoginBoolean: !prevState.adminLoginBoolean
    }));
  };

  toggleIntro = () => {
    if (this.state.introModal) {
      this.setState({ introModal: false });
    } else {
      this.setState({ introModal: true });
    }
  };

  introNextorClose = () => {
    count++;
    this.setState({ page: count });
    if (count < 5) {
      this.setState({ introModal: true });
    } else if (count === 5) {
      this.setState({ nextOrClose: "Close" });
    } else {
      this.toggleIntro();
    }
  };

  setShow = () => {
    if (this.state.alertVisible) {
      this.setState({ alertVisible: false });
    } else {
      this.setState({ alertVisible: true });
    }
  };

  render() {
    return (
      <Container>
        <Logo />
        {!this.state.adminLoginBoolean ? (
          //  ============================================ Player Rendering =============================================
          <Row>
            
            <Col size='lg-4 md-4 sm-4'>
              
          <form className="form-inline">
            <div className="dropdown show">
              <Row>
                <Col size='12'>
                <a
                className="btn btn-secondary dropdown-toggle"
                href="#"
                role="button"
                id="dropdownMenuLink"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={this.loadGames}
              >
                {this.state.gameInfo || "Select Your Game"}
              </a>
              
              
              <div
                className="dropdown-menu"
                aria-labelledby="dropdownMenuLink"
                name={this.state.gameInfo}
                value={this.state.gameId}
              >
                {this.state.games.map(game => (
                  <a
                    className="dropdown-item"
                    key={game._id}
                    value={game._id}
                    onClick={() => {
                      this.setGameInfo(game.gameInfo, game._id);
                    }}
                  >
                    {game.gameInfo}
                  </a>
                ))}
              </div>
              </Col>
              </Row>
            </div>

            <Row>
              <Col size='12'>
            <Input
              value={this.state.username}
              onChange={this.handleInputChange}
              name="username"
              placeholder="Username (required)"
            ></Input>
            </Col>
            </Row>
            <Row>
              <Col size='12'>

            <Input
              value={this.state.playerEmail}
              onChange={this.handleInputChange}
              name="playerEmail"
              placeholder="Email (required)"
            ></Input>
            </Col>
            </Row>

            {this.state.playerEmailButton ? (
              <p>
                Forgot your username?{" "}
                <button onClick={this.emailPlayerUsername}>
                  Email Login Info
                </button>
              </p>
            ) : (
              <p></p>
            )}
            <Row>
              <Col size='6'>
            <FormBtn 
              disabled={!this.state.username || !this.state.gameId}
              onClick={this.handlePlayerSave}
            >
              Submit
            </FormBtn>
            </Col>
            <Col size='6'>
              <button className='guessButton squishy btn-1' onClick={this.toggleLogin}>Admin Login
            </button>
          </Col>
           </Row> 
          </form>
          
          </Col>
          </Row>
        ) : (
          //  ============================================ Admin Rendering =============================================
          // create new game
          <form className="form-inline">
            <Input
              value={this.state.newGame}
              onChange={this.handleInputChange}
              name="newGame"
              placeholder="Create New Ex: Cat v. Dog"
            ></Input>

            {/* select existing game */}
            <div className="dropdown show">
              <a
                className="btn btn-secondary dropdown-toggle"
                href="#"
                role="button"
                id="dropdownMenuLink"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={this.loadGames}
              >
                {this.state.gameInfo || "Select Existing Game"}
              </a>

              <div
                className="dropdown-menu"
                aria-labelledby="dropdownMenuLink"
                name={this.state.gameInfo}
                value={this.state.gameId}
              >
                {/* maybe create an option to make your own game in the dropdown? */}
                <a
                  className="dropdown-item"
                  key={"no answer"}
                  onClick={() => {
                    this.setGameInfo("", "");
                  }}
                >
                  {"Select Existing Game"}
                </a>
                {this.state.games.map(game => (
                  <a
                    className="dropdown-item"
                    key={game._id}
                    value={game._id}
                    onClick={() => {
                      this.setGameInfo(game.gameInfo, game._id);
                    }}
                  >
                    {game.gameInfo}
                  </a>
                ))}
              </div>
            </div>
            {/* 
            <input
              type="text"
              list="games"
              value={this.state.gameInfo}
              id={this.state.gameId}
              // onChange={this.handleInputChange}
              onChange={this.handleDropdownInputChange}
              // name="gameInfo"
              name={this.state.gameId}
              placeholder="Type or Select a Game"
              onClick={this.loadGames}
            />
            <datalist
              id="games"
              // onChange={this.change}
              // value={this.state.gameId}
            >
              {this.state.games.map(game => (
                <option
                  class="dropdown-item"
                  key={game._id}
                  id={game._id}
                  value={game.gameInfo}
                  name={game._id}
                  // onClick={() => {
                  // onSelect={() => {
                  // bug-sending the game-_id in the argument does not work, because of the manual input option to create a name
                  // this.setGameId(game._id);
                  // }}
                >
                  {game.gameInfo}
                </option>
              ))}
            </datalist> */}
            <Input
              value={this.state.adminName}
              onChange={this.handleInputChange}
              name="adminName"
              placeholder="Username (required)"
            ></Input>
            <Input
              value={this.state.adminEmail}
              onChange={this.handleInputChange}
              name="adminEmail"
              placeholder="Email (required)"
            ></Input>
            {this.state.emailButton ? (
              <p>
                Forgot your username?{" "}
                <button onClick={this.emailUsername}>Email Login Info</button>
              </p>
            ) : (
              <p></p>
            )}
            <FormBtn className='btn-1 squishy'
              disabled={
                !this.state.adminName ||
                !this.state.adminEmail ||
                (!this.state.gameInfo && !this.state.newGame)
              }
              onClick={this.handleAdminSave}
            >
              Submit
            </FormBtn>
            <button className='btn-1 squishy' onClick={this.toggleLogin}>Login as Player</button>
          </form>
        )}
        <InstructionsModal
          show={this.state.introModal}
          page={this.state.page}
          nextOrClose={this.state.nextOrClose}
          onHide={this.introNextorClose}
          toggleIntro={this.toggleIntro}
        />
        <AlertMessages
          message={this.state.message}
          newGame={this.state.newGame}
          adminName={this.state.adminName}
          adminEmail={this.state.adminEmail}
          alertVisible={this.state.alertVisible}
          setShow={this.setShow}
        />
      </Container>
    );
  }
}

export default Login;
