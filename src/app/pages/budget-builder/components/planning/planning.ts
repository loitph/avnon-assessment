import { TitleCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContextMenu } from '@components/context-menu/context-menu';
import { Expense, Income } from '@models/budget.model';
import { BudgetService } from '@services/budget-service/budget-service';
import { debounceTime, Subject, tap } from 'rxjs';

@Component({
  selector: 'bb-planning',
  imports: [FormsModule, TitleCasePipe, ContextMenu],
  templateUrl: './planning.html',
  styleUrl: './planning.scss',
  host: { class: 'sync-scroll-x-host' },
})
export class Planning implements AfterViewInit {
  @ViewChildren('input') inputs!: QueryList<ElementRef<HTMLInputElement>>;
  private inputArray: HTMLInputElement[] = [];

  @ViewChildren('syncBox') syncBoxes!: QueryList<ElementRef>;
  private isSyncing = false; // prevents feedback loop

  private budgetService = inject(BudgetService);

  data = this.budgetService.data;
  months = this.budgetService.months;
  parentTotalsById = this.budgetService.parentTotalsById;

  totalMonthlyIncome = this.budgetService.totalMonthlyIncome;
  totalMonthlyExpense = this.budgetService.totalMonthlyExpense;

  profitAndLoss = this.budgetService.profitAndLoss;
  openingBalance = this.budgetService.openingBalance;
  closingBalance = this.budgetService.closingBalance;

  incomeCategories = computed(() => {
    return this.data().parentCategories.filter((c) => c.type === 'income');
  });

  expensesCategories = computed(() => {
    return this.data().parentCategories.filter((c) => c.type === 'expense')
  });

  bindingData$ = new Subject<{
    categoryId: string;
    parentId: string;
    month: string;
    value: number;
  }>();

  removeCategory = this.budgetService.removeCategory.bind(this.budgetService);
  removeParentCategory = this.budgetService.removeParentCategory.bind(this.budgetService);

  context = signal<{
    visible: boolean;
    x: number;
    y: number;
    catId: string;
    value: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    catId: '',
    value: 0
  });

  constructor() {
    this.bindingData$
      .pipe(
        debounceTime(500),
        tap(({ categoryId, parentId, month, value }) => {
          this.budgetService.updateCell(categoryId, parentId, month, value);
        }),
      )
      .subscribe();

    effect(() => {
      let isDateUpdated = this.budgetService.isDateUpdated();
      if (isDateUpdated) {
        this.updateInputArray();
        this.focusFirst();
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateInputArray();
    this.focusFirst();

    this.inputs.changes.subscribe(() => {
      this.updateInputArray();
    });
  }

  onScroll(event: Event) {
    if (this.isSyncing) return;

    const target = event.target as HTMLElement;
    const scrollLeft = target.scrollLeft;

    this.isSyncing = true;

    this.syncBoxes.forEach((box: ElementRef) => {
      if (box.nativeElement !== target) {
        box.nativeElement.scrollLeft = scrollLeft;
      }
    });

    this.isSyncing = false;
  }

  getRow(categoryId: string, parentId: string) {
    return Object.entries(
      this.data().rows.find((r) => r.categoryId === categoryId && r.parentId === parentId)?.values || {},
    ).map(([month, value]) => {
      return { month: month, value: value };
    });
  }

  updateCell(categoryId: string, parentId: string, month: string, value: number) {
    this.bindingData$.next({ categoryId, parentId, month, value });
  }

  private updateInputArray(): void {
    this.inputArray = this.inputs.map((el) => el.nativeElement);
  }

  private focusFirst(): void {
    if (this.inputArray.length > 0) {
      this.inputArray[0].focus();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;

    const active = document.activeElement as HTMLInputElement;
    const idx = this.inputArray.indexOf(active);
    if (idx === -1) return; // not one of our inputs

    let nextIdx: number;
    if (event.key === 'ArrowLeft') {
      nextIdx = idx > 0 ? idx - 1 : this.inputArray.length - 1; // wrap left
    } else {
      nextIdx = idx < this.inputArray.length - 1 ? idx + 1 : 0; // wrap right
    }

    this.inputArray[nextIdx].focus();
    event.preventDefault(); // stop caret movement inside the field
  }

  addCategory(parentId: string, type: Income | Expense) {
    let name = prompt('Enter category name:')?.trim();
    if (!name) return;

    const defaultName =
      name || `New ${type} category ${this.budgetService.data().categories.length + 1}`;

    this.budgetService.addCategory(parentId, defaultName, type);
  }

  addParentCategory(type: Income | Expense) {
    let name = prompt('Enter parent category name:')?.trim();
    if (!name) return;

    const defaultName =
      name || `New ${type} category ${this.budgetService.data().categories.length + 1}`;

    this.budgetService.addParentCategory(defaultName, type);
  }

  showContext(event: MouseEvent, catId: string) {
    event.preventDefault();
    const value = (event.target as HTMLInputElement).valueAsNumber as number;
    this.context.set({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      catId,
      value,
    });
  }

  applyToAll() {
    const { catId, value } = this.context();
    this.budgetService.applyAll(catId, value)
    this.hideMenu();
  }

  hideMenu() {
    this.context.update(s => ({ ...s, visible: false }));
  }
}
