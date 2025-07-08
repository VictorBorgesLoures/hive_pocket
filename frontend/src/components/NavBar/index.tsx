import { Link } from "react-router-dom"
import Timer from "@src/components/Timer"
import { useBoard } from "@src/providers/Game";
import { useCallback, useEffect, useState } from "react";
import { GameHookState, GAME_STATE, pretifyGameState, Board } from "@src/types";

export default () => {
  const { board } = useBoard();
  const [timer, setTimer] = useState(0);
  const [username, setUsername] = useState("default");
  const [gameState, setGameState] = useState<GAME_STATE>(GAME_STATE.WAITING);
  const [invert, setInvert] = useState<boolean>(false);
  const [animation, _setAnimation] = useState<boolean>(true);

  useEffect(() => {
    if (board) {
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

  const MiniMax = useCallback(async () => {
    if (board) {
      await Board.minMax(board, 2)
    }
  }, [timer, board, animation])

  const AlfaBeta = useCallback(async () => {
    if (board) {
      await Board.alfaBeta(board, 3);
    }
  }, [timer, board, animation])

  return (
    <nav className="navbar bg-body-tertiary">
      <div className="container container-fluid">
        <Link to="/" className="navbar-brand">Home</Link>
        {
          board
          && gameState === GAME_STATE.WAITING
          && <button type="button" className="btn btn-primary" onClick={() => (board.start())}>
            Press to start the GAME
          </button>
        }
        {
          board
          && gameState === GAME_STATE.PLAYING
          && <button type="button" className="btn btn-secondary" onClick={() => (board.pause())}>
            PAUSE
          </button>
        }
        {
          board
          && gameState === GAME_STATE.PAUSED
          && <button type="button" className="btn btn-info" onClick={() => (board.unpause())}>
            CONTINUE
          </button>
        }
        {
          board
          && gameState === GAME_STATE.FINISHED
          && <button type="button" className="btn btn-danger" onClick={() => (board.restart())}>
            {pretifyGameState(gameState)} - RESTART
          </button>
        }
        {
          board
          && board.gameTree
          && <button type="button" className="btn btn-secondary" onClick={async () => MiniMax()}>
            Minimax
          </button>
        }
        {
          board
          && board.gameTree
          && <button type="button" className="btn btn-secondary" onClick={async () => AlfaBeta()}>
            AlfaBeta
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