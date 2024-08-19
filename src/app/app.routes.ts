import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'basic',
    loadComponent: () => import('./pages/basic/basic.component'),
  },
  {
    path: 'loader',
    loadComponent: () => import('./pages/loader/loader.component'),
  },
  {
    path: 'shaders',
    loadComponent: () => import('./pages/shaders/shaders.component'),
  },
  {
    path: '',
    redirectTo: '/basic',
    pathMatch: 'full',
  }
];
