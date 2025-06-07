import React from 'react';
import './App.css';
import Root from './routes/root';
import {
  Navigate,
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import ErrorPage from './pages/ErrorPage';
import LoopingTimerPage from './pages/LoopingTimerPage';

const App = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Navigate to="looping_timer" replace />,
        },
        {
          path: 'looping_timer',
          element: <LoopingTimerPage />,
        },
      ],
    },
  ];

  // Use basename for GitHub Pages deployment
  const basename =
    process.env.NODE_ENV === 'production' ? '/looping-timer' : '';

  return <RouterProvider router={createBrowserRouter(routes, { basename })} />;
};

export default App;
