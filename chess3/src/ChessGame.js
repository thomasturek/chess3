import React, { useEffect, useState } from "react";
import Chessboard from "chessboardjsx";
import socketIO from "socket.io-client";
import { Chess } from "chess.js";
import "./ChessGame.css";

const socket = socketIO.connect("http://54.163.168.91:3000", {
  transports: ["websocket"],
  cors: {
    origin: "*",
  },
});

const ChessGame = () => {
  const [fen, setFen] = useState(new Chess().fen());
  const [highlight, setHighlight] = useState({});
  const [room, setRoom] = useState("");
  const [orientation, setOrientation] = useState("");
  const [username, setUserName] = useState("");
  const [connected, setConnection] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {

  socket.on("startGame", (fen) => {
    setFen(fen);
  });

  socket.on("connect", () => {

    if (!connected) {

      const roomName = "Dad and Thomas";
      setUserName("a");
      setRoom(roomName);
      socket.emit("joinRoom", roomName, "a");
      setConnection(true);
    }

  });

  socket.on("move", function (move) {
    movePiece(move);
  });

  socket.on("listen", function (move) {
    listen(move);
  });

  socket.on("setOrientation", function (orientation) {
    setOrientation(orientation);
  });

  socket.on("turn", function (turn) {
      setIsMyTurn(turn === orientation);
    });

  socket.on("gameover", function (result) {
    alert(`Game over. ${result}`);
  });
}, [room, orientation, setIsMyTurn, connected, setOrientation, setConnection]);

  const movePiece = (move) => {

    console.log(isMyTurn)

    if(isMyTurn) {

      const chess = new Chess(fen);

      chess.turn = orientation;
      const update = `${move.from}-${move.to}`;

      chess.move(update);

      setFen(chess.fen());
      chess.load(chess.fen());
      setHighlight({});

      socket.emit("move", { room: room, move: move, username: username});

      console.log("Broadcasted")
  }
};

    const listen = (move) => {
    console.log("enemy move received", move);

    const chess = new Chess(fen);

    console.log(move.color);

    chess.move(move);

    setFen(chess.fen());

    console.log("enemy move set");
    };

  return (
    <div className="chessboard-wrapper">
      <div className="room-info">
        <h2> Room Chat </h2> <br /><br />

        <input
          type="text"
          id="form-input-chat"
          className="form-input-chat"
        />
        <button className="form-submit-button">
          Send
        </button>

      </div>

      <div className="room-moves">
        <h2> Move History </h2> <br /><br />

      </div>

      <div className="chessboard">
      <Chessboard
        position={fen}
        orientation={orientation}
        onDrop={({ sourceSquare, targetSquare,  }) =>
          movePiece({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
            color: orientation === "white" ? "w" : "b",
          })
        }
        squareStyles={highlight}
        dropSquareStyle={{ boxShadow: "inset 0 0 1px 4px #90EE90" }}
      />
      </div>

      <div className="room-detail">
      <h2 className = "room"> Room: {room}</h2>
      </div>
      <div className="turn">
      <h2 className= "playerturn"> {isMyTurn ? `It is ${orientation}'s turn` : `It is ${orientation === "white" ? "black" : "white"}'s turn`} </h2>
      </div>
    </div>
  );
};

export default ChessGame;
