import { Link } from "react-router-dom"
import Timer from "@src/components/Timer"
import { useBoard } from "@src/providers/Game";
import { useEffect, useState } from "react";
import { GameHookState, GAME_STATE, pretifyGameState } from "@src/types";

export default () => {
  const {board} = useBoard();
  const [timer, setTimer] = useState(0);
  const [username, setUsername] = useState("default");
  const [gameState, setGameState] = useState<GAME_STATE>(GAME_STATE.WAITING);
  const [invert, setInvert] = useState<boolean>(false);

  useEffect(() => {
    if(board) {
      board.addHook((args: GameHookState) => {
        setTimer(args.playerTimer);
        setUsername(args.currentPlayer.username);
        setGameState(args.state);
      })
      board.updateHooks();
    }
  }, [board])

  useEffect(() => {
    setInvert(prev => !prev);
  }, [username])

  return (
    <nav className="navbar bg-body-tertiary">
      <div className="container container-fluid">
        <Link to="/" className="navbar-brand">Home</Link>
        {
          board
          && gameState === GAME_STATE.WAITING
          && <button type="button" className="btn btn-primary" onClick={e => (board.start())}>
            Press to start the GAME
            </button>
        }
        {
          board
          && gameState === GAME_STATE.PLAYING
          && <button type="button" className="btn btn-secondary" onClick={e => (board.pause())}>
            PAUSE
            </button>
        }
        {
          board
          && gameState === GAME_STATE.PAUSED
          && <button type="button" className="btn btn-info" onClick={e => (board.unpause())}>
            CONTINUE
            </button>
        }
        {
          board
          && gameState === GAME_STATE.FINISHED
          && <button type="button" className="btn btn-danger" onClick={e => (board.restart())}>
            {pretifyGameState(gameState)} - RESTART
            </button>
        }
        {
          board 
          && <Timer 
          gameState={gameState}
          invert={invert} 
          timer={timer} 
          username={username} 
          />
        }
      </div>
    </nav>
  )
}