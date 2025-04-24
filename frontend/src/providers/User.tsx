import { User } from '@src/types';
import React, { createContext, useCallback, useContext, useState } from 'react';

export interface UserContext {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const userStorageToken = "@App:user"; 

const Context = createContext<UserContext>({} as UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {    
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem(userStorageToken);
        return storedUser ? JSON.parse(storedUser) : null
    });

    const saveUser = useCallback(
        (newUser: User | null) => {
            localStorage.setItem(userStorageToken, JSON.stringify(newUser));
            setUser(newUser);
        }, [setUser]
    );

    const logout = useCallback(() => {
        localStorage.removeItem(userStorageToken)
        setUser(null)
    }, [setUser])

    return (
        <Context.Provider
            value={{
                user,
                logout,
                setUser: saveUser,
            }}
        >
            {children}
        </Context.Provider>
    )

}

export const useUser = () => {
    const context = useContext(Context);
    if(!context)
        throw new Error("User Context must be used inside a UserProvider");

    return context;
}