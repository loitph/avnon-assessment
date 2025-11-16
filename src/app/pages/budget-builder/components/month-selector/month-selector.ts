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
  start: MonthVal = this.budgetService.data().startMonth;
  end: MonthVal = this.budgetService.data().endMonth;

  update() {
    this.budgetService.setDateRange(this.start, this.end);
  }
}
