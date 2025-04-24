import Canva from '@src/components/GameCanva';
import NavBar from '@src/components/NavBar'
import { useBoard } from '@src/providers/Game';
import { Spinner } from 'react-bootstrap';
import '@src/pages/Game/index.css';
import { useRef } from 'react';

export const GamePage = () => {
    const {board} = useBoard();
    if(!board) return <Spinner></Spinner>
    
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    board.addTimerRef(timer);

    return (
        <div className='board-content'>
            <NavBar />
            <Canva board={board}/>
        </div>
    )
}
export default GamePage