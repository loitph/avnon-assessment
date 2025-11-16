import { Component } from '@angular/core';
import { MonthSelector } from '@components/month-selector/month-selector';
import { Planning } from '@components/planning/planning';

@Component({
  selector: 'bb-budget-builder',
  imports: [MonthSelector, Planning],
  templateUrl: './budget-builder.html',
  styleUrl: './budget-builder.scss',
})
export class BudgetBuilder {}
