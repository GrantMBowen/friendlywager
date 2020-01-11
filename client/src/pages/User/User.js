import React, { Component } from "react"
import Logo from "../../components/Logo"
import GuessButtons from "../../components/GuessButtons";
import GuessState from "../../components/GuessState";
import Score from "../../components/Score";
import API from "../../utils/API";
import io from 'socket.io-client';

let guess = " "
let score;
let username;

class User extends Component {
    constructor(props){
        super(props);
    this.state = {
        score,
        guess,
        username
    };

    this.socket = io('localhost:3001');

    this.socket.on('RECIEVE_MESSAGE', function(data) {

    });

    this.sendGuess = ev => {
        ev.preventDefault();
        this.socket.emit('SEND_MESSAGE', {
            currentGuess: this.state.guess,
        });
        this.setState({guess: ''});
        this.setState({})
    }
}


    componentDidMount() {
        username = this.props.match.params.username;
        console.log(username);
        this.loadScore();
      }
    
      // Loads score and sets them to this.state.scores
      loadScore = () => {
        API.getPlayerScore(username)
          .then(res =>
            this.setState({
              score: res.data[0].currScore
            })
          )
          .catch(err => console.log(err));
      };

    // function that updates guess state with onClick
guessUpdate = (value) => {
    this.setState({ guess: value});
};




render() {
    return (
        <div>
            <Logo/>
            <Score
                score={this.state.score}
            />
            <GuessState 
                guess={this.state.guess}
            />
            <GuessButtons
            guessUpdate={this.guessUpdate}
            />
        </div>
    )
}

}

export default User;