import { Routes } from '@angular/router';
import { CasaPage } from './pages/casa/casa-page';

export const routes: Routes = [
  { path: '', component: CasaPage },
  { path: '**', redirectTo: '' },
];
