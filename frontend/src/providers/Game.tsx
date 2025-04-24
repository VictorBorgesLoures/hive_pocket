import { Board } from '@src/types';
import React, { createContext, useCallback, useContext, useState } from 'react';

export interface GameContext {
    board: Board | null;
    setBoard: (board: Board | null) => void;
}

export const boardStorageToken = "@App:board"; 

const Context = createContext<GameContext>({} as GameContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {    
    const [board, setBoard] = useState<Board | null>(() => {
        const storedBoard = localStorage.getItem(boardStorageToken);
        if (!storedBoard) return null;
        
        const boardData = JSON.parse(storedBoard);
        // Convert pieces from plain object to Map before creating Board instance
        if (boardData.pieces) {
            boardData.pieces = new Map(Object.entries(boardData.pieces));
        }
        return new Board(boardData);
    });

    const saveBoard = useCallback(
        (newBoard: Board | null) => {
            if (newBoard) {
                // Convert pieces Map to plain object for storage
                const boardForStorage = {
                    ...newBoard,
                    pieces: Object.fromEntries(newBoard.pieces),
                    timerRef: null,
                    currentCanva: null // Don't store canvas reference
                };
                localStorage.setItem(boardStorageToken, JSON.stringify(boardForStorage));
            } else {
                localStorage.removeItem(boardStorageToken);
            }
            setBoard(newBoard);
        }, [setBoard]
    );

    return (
        <Context.Provider
            value={{
                board,
                setBoard: saveBoard,
            }}
        >
            {children}
        </Context.Provider>
    )

}

export const useBoard = () => {
    const context = useContext(Context);
    if(!context)
        throw new Error("User Context must be used inside a UserProvider");

    return context;
}