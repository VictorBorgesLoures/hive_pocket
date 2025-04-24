import { GameProvider } from "@src/providers/Game";
import { UserProvider } from "@src/providers/User";
import { Outlet } from "react-router-dom";

export const AppPage = () => 
    <UserProvider >
        <GameProvider>
            <Outlet />
        </GameProvider>
    </UserProvider>

export default AppPage;