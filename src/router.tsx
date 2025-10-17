import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProjectList, ProjectLayout, PlanningView, DepouillementView } from './components/projects';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProjectList />,
  },
  {
    path: '/projects/:projectId',
    element: <ProjectLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="planning" replace />,
      },
      {
        path: 'planning',
        element: <PlanningView />,
      },
      {
        path: 'depouillement',
        element: <DepouillementView />,
      },
    ],
  },
]);
