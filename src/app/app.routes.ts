import { Routes } from '@angular/router';
import { BudgetBuilder } from './pages/budget-builder/budget-builder';

export const routes: Routes = [
  { path: 'budget-builder', component: BudgetBuilder },
  { path: '**', redirectTo: 'budget-builder' },
];
