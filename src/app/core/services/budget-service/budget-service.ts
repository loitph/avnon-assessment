import { computed, Injectable, signal } from '@angular/core';
import {
  DataBudget,
  DataItemCategory,
  Expense,
  Income,
  MonthVal,
  RowItem,
} from '@models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  _numberOfMonths = signal(12);
  _year = signal(2025);

  data = signal<DataBudget>({
    parentCategories: [
      {
        id: 'pcat-1',
        type: 'income',
        name: 'Delivery',
      },
      {
        id: 'pcat-2',
        type: 'expense',
        name: 'Operation',
      },
    ],

    categories: [
      {
        id: 'cat-1',
        type: 'income',
        name: 'Sales',
        parentId: 'pcat-1',
      },
      {
        id: 'cat-2',
        type: 'income',
        name: 'Commissions',
        parentId: 'pcat-1',
      },
      {
        id: 'cat-3',
        type: 'expense',
        name: 'Hosting',
        parentId: 'pcat-2',
      },
    ],

    rows: [
      // monthly data
    ], // yearly data
  });

  months = computed(() => this.generateMonths());

  parentTotalsById = computed<Map<string, number[]>>(() => {
    const rows = this.data().rows ?? [];
    const monthKeys = this.months().map(m => m.key);
  
    // [parentId]: <sum per month>
    const totals = new Map<string, number[]>();
  
    const rowsByParent = new Map<string, DataItemCategory[]>();
    rows.forEach(row => {
      if (!rowsByParent.has(row.parentId)) {
        rowsByParent.set(row.parentId, []);
      }
      rowsByParent.get(row.parentId)!.push(row);
    });
  
    // sum for each parent
    rowsByParent.forEach((parentRows, parentId) => {
      const sumPerMonth = monthKeys.map(month => {
        return parentRows.reduce((sum, row) => sum + (row.values[month] ?? 0), 0);
      });

      // store result
      totals.set(parentId, sumPerMonth);
    });
  
    return totals;
  });

  totalMonthlyIncome = computed(() => {
    return this.total('income');
  });

  totalMonthlyExpense = computed(() => {
    return this.total('expense');
  });

  profitAndLoss = computed(() => {
    const monthKeys = this.months().map(m => m.key);
    const totals = this.parentTotalsById();

    // total income
    const incomePerMonth = monthKeys.map(() => 0);
    this.data().parentCategories
      .filter(p => p.type === 'income')
      .forEach(p => {
        const arr = totals.get(p.id) ?? [];
        arr.forEach((v, i) => incomePerMonth[i] += v);
      });

    // total expense
    const expensePerMonth = monthKeys.map(() => 0);
    this.data().parentCategories
      .filter(p => p.type === 'expense')
      .forEach(p => {
        const arr = totals.get(p.id) ?? [];
        arr.forEach((v, i) => expensePerMonth[i] += v);
      });

    // result
    return monthKeys.map((_, i) => incomePerMonth[i] - expensePerMonth[i]);
  });

  openingBalance = computed(() => {
    const pnlValues = this.profitAndLoss();
    return [0, ...pnlValues.slice(0, -1).map((_, i) => {
      return pnlValues.slice(0, i + 1).reduce((a, b) => a + b, 0);
    })];
  });

  closingBalance = computed(() => {
    const pnlValues = this.profitAndLoss();
    let cumulative = 0;
    return pnlValues.map(pnl => {
      cumulative += pnl;
      return cumulative;
    });
  });

  isDateUpdated = signal<boolean>(false);

  constructor() {
    this.initRow();
  }

  private initRow() {
    const currentData = this.data();
    const newMonths = this.months();

    const currentRows = currentData.rows || [];

    const updatedRows = currentData.categories.map((cat, catIdx) => {
      const existingRow = currentRows.find((r) => r.categoryId === cat.id);
      const oldValues = existingRow?.values || {};

      // only keep months that are in valid range
      const newValues: RowItem = {};

      newMonths.forEach((month) => {
        const key = month.key;
        // preserve old value if exists, else default to 0
        newValues[key] = oldValues[key] ?? 0;
      });

      return {
        id: existingRow?.id || `row-${catIdx + 1}`,
        type: cat.type,
        categoryId: cat.id,
        parentId: cat.parentId,
        values: newValues,
      } as DataItemCategory;
    });

    this.data.update((d) => ({
      ...d,
      rows: updatedRows,
    }));
  }

  private total(type: Income | Expense): number[] {
    const rows = this.data().rows ?? [];
    const monthKeys = this.months().map(m => m.key);

    return monthKeys.map(month => {
      return rows
        .filter(r => r.type === type)
        .reduce((sum, r) => sum + (r.values[month] ?? 0), 0);
    });
  }

  setDateRange() {
    this.initRow();
    this.isDateUpdated.set(true);
  }

  updateCell(categoryId: string, parentId: string, monthVal: MonthVal, value: number) {
    this.data.update((d) => {
      const newRows = d.rows.map((row) =>
        row.categoryId === categoryId && row.parentId === parentId
          ? {
              ...row,
              values: {
                ...row.values,
                [monthVal]: value,
              },
            }
          : row,
      );

      return { ...d, rows: newRows };
    });
  }

    private generateMonths(): { key: MonthVal; label: string }[] {
      let startMonth = 1;
      let endMonth = this._numberOfMonths();
      const year = this._year();
      const months: { key: MonthVal; label: string }[] = [];

      while (startMonth <= endMonth) {
        months.push({
          key: `${year}-${startMonth.toString().padStart(2, '0')}` as MonthVal,
          label: new Date(year, startMonth - 1).toLocaleString('default', {
            month: 'short',
            year: 'numeric',
          }),
        });

        startMonth++;
      }

      return months;
    }

  addCategory(parentId: string, name: string, type: Income | Expense) {
    const id = `cat-${this.data().categories.length + 1}`;
    const newCategory = {
      id,
      type,
      name,
      parentId,
    };

    let categories = this.data().categories;
    categories = [...categories, newCategory];

    this.data.update((d) => {
      return {
        ...d,
        categories,
      };
    });

    this.initRow();
  }

  addParentCategory(name: string, type: Income | Expense) {
    const id = `pcat-${this.data().parentCategories.length + 1}`;
    const newParentCategory = {
      id,
      type,
      name,
    };

    let parentCategories = this.data().parentCategories;
    parentCategories = [...parentCategories, newParentCategory];

    this.data.update((d) => {
      return {
        ...d,
        parentCategories,
      };
    });

    this.initRow();
  }

  removeCategory(id: string) {
    if (!id) return;

    const categories = this.data().categories.filter((c) => c.id !== id);
    this.data.update((d) => {
      return {
        ...d,
        categories,
      };
    });

    this.initRow();
  }

  removeParentCategory(id: string) {
    if (!id) return;

    const parentCategories = this.data().parentCategories.filter((pc) => pc.id !== id);
    const categories = this.data().categories.filter((c) => c.parentId !== id);

    this.data.update((d) => {
      return {
        ...d,
        parentCategories,
        categories,
      };
    });

    this.initRow();
  }

  applyAll(categoryId: string, value: number) {
    const clickedRow = this.data().rows.find(r => r.categoryId === categoryId);
    if (!clickedRow) return;
    const targetParentId = clickedRow.parentId;

    this.data.update(d => ({
      ...d,
      rows: d.rows.map(row => {
        if (row.categoryId !== categoryId || row.parentId !== targetParentId) {
          return row;
        }

        const allMonths = this.months().map(m => m.key);
        const newValues: Record<string, number> = {};
        allMonths.forEach(m => newValues[m] = value);

        return { ...row, values: newValues };
      })
    }));
  }
}
