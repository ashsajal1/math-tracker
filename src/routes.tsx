import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/home';
import RootLayout from './pages/Layout';
import NotFound from './pages/not-found';
import ErrorPage from './pages/error';
import Stats from './pages/stats';
import History from './pages/history';
import Settings from './pages/settings';

export const router = createBrowserRouter([
    {
        path: '',
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path:'/',
                element: <Home />
            },
            {
                path:'/stats',
                element: <Stats />
            },
            {
                path:'/history',
                element: <History />
            },
            {
                path:'/settings',
                element: <Settings />
            },
            {
                path:'*',
                element: <NotFound />
            }
        ]
    }
])