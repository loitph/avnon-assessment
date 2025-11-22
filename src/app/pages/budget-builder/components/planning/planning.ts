import { TitleCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ContextMenu } from '@components/context-menu/context-menu';
import { Expense, Income, ItemCategory, ItemDataDialog } from '@models/budget.model';
import { BudgetService } from '@services/budget-service/budget-service';
import { debounceTime, Subject, takeUntil, tap } from 'rxjs';
import { Dialog } from '@components/dialog/dialog';
import { forbiddenNameValidator } from '@directives/forbidden-name.directive';

@Component({
  selector: 'bb-planning',
  imports: [FormsModule, TitleCasePipe, ContextMenu, Dialog, ReactiveFormsModule],
  templateUrl: './planning.html',
  styleUrl: './planning.scss',
  host: { class: 'sync-scroll-x-host' },
})
export class Planning implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChildren('input') inputs!: QueryList<ElementRef<HTMLInputElement>>;
  private inputArray: HTMLInputElement[] = [];

  @ViewChildren('syncBox') syncBoxes!: QueryList<ElementRef>;
  private isSyncing = false;

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
    return this.data().parentCategories.filter((c) => c.type === 'expense');
  });

  childrenOfParent(parentId: string): ItemCategory[] {
    const childCategories = this.data().categories;
    const result = childCategories.filter(category => category.parentId === parentId);

    return result;
  }

  bindingData$ = new Subject<{
    categoryId: string;
    parentId: string;
    month: string;
    value: number;
  }>();

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

  applyAllDialogData = signal<
    Omit<ItemDataDialog, 'name' | 'isParent' | 'type' | 'targetId'>
  >({
    status: false,
  });

  createdCategoryDialogData = signal<Omit<ItemDataDialog, 'name' | 'isParent'>>({
    status: false,
    type: 'income',
    targetId: '',
  });

  private testNameRegex = /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/;

  formCategory = new FormGroup({
    name: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(2),
        forbiddenNameValidator(this.testNameRegex)
      ],
      nonNullable: true,
    }),
  });

  get nameControl(): FormControl {
    return this.formCategory.controls.name;
  }

  removedCategoryDialogData = signal<Omit<ItemDataDialog, 'type'>>({
    targetId: '',
    name: '',
    isParent: false,
    status: false,
  });

  constructor() {
    this.bindingData$
      .pipe(
        debounceTime(500),
        tap(({ categoryId, parentId, month, value }) => {
          this.budgetService.updateCell(categoryId, parentId, month, value);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    effect(() => {
      let isDateUpdated = this.budgetService.isDateUpdated();
      if (isDateUpdated) {
        this.updateInputArray();
        this.focusFirst();

        this.budgetService.stackingUpdated$.next(false);
      }
    })
  }

  ngAfterViewInit() {
    this.updateInputArray();
    this.focusFirst();

    this.inputs.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
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

  private updateInputArray() {
    this.inputArray = (this.inputs || [])
      .map((el) => el?.nativeElement || undefined)
      .filter(el => !!el);
  }

  private focusFirst() {
    if (this.inputArray.length > 0) {
      this.inputArray[0].focus();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.hideMenu();
    event.preventDefault();
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;

    const active = document.activeElement as HTMLInputElement;
    const idx = this.inputArray.indexOf(active);

    if (idx === -1) return;

    let nextIdx: number;
    if (event.key === 'ArrowLeft') {
      nextIdx = idx > 0 ? idx - 1 : this.inputArray.length - 1;
    } else {
      nextIdx = idx < this.inputArray.length - 1 ? idx + 1 : 0;
    }

    this.inputArray[nextIdx].focus();
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

  @HostListener('document:click', ['$event'])
  hideMenu(event?: Event) {
    event?.preventDefault();
    this.context.update(s => ({ ...s, visible: false }));
  }

  openCreatedCategoryDialog(type: Expense | Income, id = '') {
    this.createdCategoryDialogData.set({
      status: true,
      type,
      targetId: id,
    });
  }

  openRemovedCategoryDialog(id: string, name = '', isParent = false) {
    this.removedCategoryDialogData.set({
      status: true,
      isParent,
      name,
      targetId: id,
    });
  }

  onCreateCategory() {
    if (this.formCategory.invalid) return;

    const categoryName = this.formCategory.get('name')?.value.trim();
    if (!categoryName) return;

    const type = this.createdCategoryDialogData().type;
    const parentId = this.createdCategoryDialogData().targetId || '';

    if (parentId) {
      this.budgetService.addCategory(parentId, categoryName, type);
    } else {
      this.budgetService.addParentCategory(categoryName, type);
    }

    this.formCategory.reset();
    this.onCloseCreatedCategoryDialog();
  }

  onRemoveCategory() {
    const isParent = this.removedCategoryDialogData().isParent;
    const targetId = this.removedCategoryDialogData().targetId || '';

    if (isParent) {
      this.budgetService.removeParentCategory(targetId);
    } else {
      this.budgetService.removeCategory(targetId);
    }

    this.onCloseRemovedCategoryDialog();
  }

  openConfirmApplyToAllDialog() {
    this.hideMenu();
    this.applyAllDialogData.set({
      status: true
    });
  }

  onAcceptApplyToAll() {
    this.onCloseConfirmApplyToAllDialog();
    this.applyToAll();
  }

  onCloseCreatedCategoryDialog() {
    this.createdCategoryDialogData.set({
      status: false,
      type: 'income',
      targetId: '',
    });
    this.formCategory.reset();
  }

  onCloseRemovedCategoryDialog() {
    this.removedCategoryDialogData.set({
      status: false,
      name: '',
      isParent: false,
      targetId: '',
    });
  }

  onCloseConfirmApplyToAllDialog() {
    this.applyAllDialogData.set({
      status: false
    });
  }

  ngOnDestroy() {
    this.budgetService.detroyService$.next();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
