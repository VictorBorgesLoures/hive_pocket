import { useEffect, useRef, useState} from "react"
import "@src/components/Timer/index.css"
import { GAME_STATE } from "@src/types";

interface Props {
    username: string,
    timer: number,
    invert: boolean,
    gameState: GAME_STATE
}

export default ({username, timer, invert, gameState}:Props) => {
    const timerRef = useRef(0);
    const [stateTimer, setStateTimer] = useState<number>(timer);
    useEffect(() => {
        if(timerRef.current) {
            clearInterval(timerRef.current)
        }
        timerRef.current = setInterval(() => {
            if(gameState === GAME_STATE.PLAYING)
                setStateTimer(prev=> prev-1 < 0 ? 0 : prev-1);
        }, 1000)
        setStateTimer(timer);
    }, [timer, username, gameState])

    return (
        <div className="timer-container text-bg-light">
            <div className={`username ${invert ? 'invert': ''}`}>
                <p>{username}</p>
            </div>
            <div className={`timer ${invert ? 'invert': ''}`}>
                <p>{Math.floor(stateTimer/60).toString().padStart(2, "0")}:{(stateTimer%60).toString().padStart(2, "0")}</p>
            </div>
        </div>
    )
}