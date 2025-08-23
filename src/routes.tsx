import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/home';
import RootLayout from './pages/Layout';
import NotFound from './pages/not-found';
import ErrorPage from './pages/error';
import Stats from './pages/stats';

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
                path:'*',
                element: <NotFound />
            }
        ]
    }
])