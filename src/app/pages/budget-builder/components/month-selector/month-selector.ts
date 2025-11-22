import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonthVal } from '@models/budget.model';
import { BudgetService } from '@services/budget-service/budget-service';

@Component({
  selector: 'bb-month-selector',
  imports: [FormsModule],
  templateUrl: './month-selector.html',
  styleUrl: './month-selector.scss',
})
export class MonthSelector {
  private budgetService = inject(BudgetService);

  _numberOfMonths = this.budgetService._numberOfMonths;
  _year = this.budgetService._year;

  private monthOfYear = 12;
  private numberOfYears = 84; // from 1942 to 2025

  months =  Array.from({ length: this.monthOfYear }, (_, i) => i + 1);
  years = Array.from({ length: this.numberOfYears }, (_, i) => new Date().getFullYear() - i);

  updateMonth(event: Event) {
    this.budgetService._numberOfMonths.set(Number((event.target as HTMLSelectElement).value));
    this.budgetService.setDateRange();
  }

  updateYear(event: Event) {
    this.budgetService._year.set(Number((event.target as HTMLSelectElement).value));
    this.budgetService.setDateRange();
  }
}
