import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Pages imports
import AppPage from '@src/pages/App';
import HomePage from '@src/pages/Home';
import GamePage from '@src/pages/Game';

const router = createBrowserRouter([
    {
        path: '',
        element: <AppPage />,
        children: [
            {
                path: '',
                element: <HomePage />
            },
            {
                path: 'game',
                element: <GamePage />
            }
        ]
    }
]);

export const AppRouter = ()=> {
    return <RouterProvider router={router}></RouterProvider>
}