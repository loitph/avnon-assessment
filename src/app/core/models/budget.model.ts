export type MonthVal = string;
export type Income = 'income';
export type Expense = 'expense';

export interface Item {
  id: string;
  type: Income | Expense;
}

export interface ItemCategory extends Item {
  name: string;
  parentId: string;
}

export interface ParentCategory extends Item {
  name: string;
}

export interface RowItem {
  [month: MonthVal]: number;
}

export interface DataItemCategory extends ItemCategory {
  categoryId: string;
  values: RowItem;
}

export interface DataBudget {
  startMonth: MonthVal;
  endMonth: MonthVal;
  parentCategories: ParentCategory[];
  categories: ItemCategory[];
  rows: DataItemCategory[]
}

export interface ItemDataDialog {
  status: boolean;
  name: string;
  type: Expense | Income;
  isParent: boolean;
  targetId: string;
}
