import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Planning } from './planning';
import { DataBudget } from '@models/budget.model';
import { BudgetService } from '@services/budget-service/budget-service';
import { ElementRef, QueryList } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

describe('Planning', () => {
  let component: Planning;
  let fixture: ComponentFixture<Planning>;
  let budgetService: BudgetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planning);
    component = fixture.componentInstance;
    fixture.detectChanges();
    budgetService = TestBed.inject(BudgetService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return array has parent income categories', () => {
    const defaultData = {
      parentCategories: [
        {
          id: 'pcat-1',
          type: 'income',
          name: 'Sales',
        },
      ],

      categories: [{
          id: 'cat-1',
          type: 'income',
          name: 'Cloud',
          parentId: 'pcat-1',
        },
      ],

      rows: [],
    } as DataBudget;

    component.data.set(defaultData);

    expect(component.incomeCategories().length).toEqual(1);
  });

  it('should return empty array when no parent income categories', () => {
    const defaultData = {
      parentCategories: [
        {
          id: 'pcat-2',
          type: 'expense',
          name: 'Operation',
        },
      ],

      categories: [{
          id: 'cat-3',
          type: 'expense',
          name: 'Hosting',
          parentId: 'pcat-2',
        },
      ],

      rows: [],
    } as DataBudget;
    component.data.set(defaultData);

    expect(component.incomeCategories().length).toEqual(0);
  });

  it('should return array has parent expense categories', () => {
    const defaultData = {
      parentCategories: [
        {
          id: 'pcat-1',
          type: 'expense',
          name: 'Operation',
        },
      ],
  
      categories: [{
          id: 'cat-1',
          type: 'expense',
          name: 'Hosting',
          parentId: 'pcat-1',
        },
      ],
  
      rows: [],
    } as DataBudget;
    component.data.set(defaultData);

    expect(component.expensesCategories().length).toEqual(1);
  });

  it('should return empty array when no parent expense categories', () => {
    const defaultData = {
      parentCategories: [
        {
          id: 'pcat-1',
          type: 'income',
          name: 'Operation',
        },
      ],
  
      categories: [{
          id: 'cat-1',
          type: 'income',
          name: 'Hosting',
          parentId: 'pcat-1',
        },
      ],
  
      rows: [],
    } as DataBudget;
    component.data.set(defaultData);

    expect(component.expensesCategories().length).toEqual(0);
  });

  it('should return array of child categories for given parentId', () => {
    const defaultData = {
      parentCategories: [
        {
          id: 'pcat-1',
          type: 'income',
          name: 'Sales',
        },
      ],

      categories: [
        {
          id: 'cat-1',
          type: 'income',
          name: 'Cloud',
          parentId: 'pcat-1',
        },
        {
          id: 'cat-2',
          type: 'income',
          name: 'On-Premise',
          parentId: 'pcat-1',
        },
      ],

      rows: [],
    } as DataBudget;
    component.data.set(defaultData);

    const children = component.childrenOfParent('pcat-1');
    expect(children.length).toEqual(2);
    expect(children[0].name).toEqual('Cloud');
    expect(children[1].name).toEqual('On-Premise');
  });


  it('should delay call updateCell after 500ms', fakeAsync(() => {
    const payload = {
      categoryId: 'cat-1',
      parentId: 'pcat-1',
      month: '2025-01',
      value: 123,
    };

    spyOn(budgetService, 'updateCell');
    component.bindingData$.next(payload);

    tick(499);
    expect(budgetService.updateCell).not.toHaveBeenCalled();

    tick(1);
    expect(budgetService.updateCell).toHaveBeenCalledTimes(1);
    expect(budgetService.updateCell).toHaveBeenCalledWith('cat-1', 'pcat-1', '2025-01', 123);
  }));

  
  it('should call updateInputArray, focusFirst and reset stackingUpdated$', () => {
    const spyUpdateInputArray = spyOn(component, 'updateInputArray');
    const spyFocusFirst = spyOn(component, 'focusFirst');

    spyOn(budgetService, 'isDateUpdated').and.returnValue(true);
    const nextSpy = spyOn(budgetService.stackingUpdated$, 'next');

    component.updateInputArray();
    component.focusFirst();
    budgetService.stackingUpdated$.next(false);

    expect(spyUpdateInputArray).toHaveBeenCalled();
    expect(spyFocusFirst).toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith(false);
  });


  it('should call updateInputArray and focusFirst after view init', () => {
    const spyUpdateInputArray = spyOn(component, 'updateInputArray');
    const spyFocusFirst = spyOn(component, 'focusFirst');

    component.ngAfterViewInit();

    expect(spyUpdateInputArray).toHaveBeenCalledTimes(1);
    expect(spyFocusFirst).toHaveBeenCalledTimes(1);
  });

  it('should stop listening after destroy$', () => {
    const spyUpdateInputArray = spyOn(component, 'updateInputArray');
    const spyFocusFirst = spyOn(component, 'focusFirst');

    component.ngAfterViewInit();

    component.destroy$.next();

    expect(spyUpdateInputArray).toHaveBeenCalledTimes(1);
    expect(spyFocusFirst).toHaveBeenCalledTimes(1);
  });

  it('should update scrollLeft of other boxes when scrolling', () => {
    const targetElement = component.syncBoxes.toArray()[0].nativeElement;
    const event = { target: targetElement } as unknown as Event;

    targetElement.scrollLeft = 150;

    component.onScroll(event);

    expect(component.isSyncing).toEqual(false);

    for (let boxIndex = 0; boxIndex < component.syncBoxes.length; boxIndex++) {
      const box = component.syncBoxes.toArray()[boxIndex].nativeElement;
      if (box !== targetElement) {
        expect(box.scrollLeft).toEqual(150);
      }
    }
  });

  it('should return correct row data for given categoryId and parentId', () => {
    const expectedResult = [
      {
        month: "2025-01",
        value: 0
      },
      {
        month: "2025-02",
        value: 0
      },
      {
        month: "2025-03",
        value: 0
      },
      {
        month: "2025-04",
        value: 0
      },
      {
        month: "2025-05",
        value: 0
      },
      {
        month: "2025-06",
        value: 0
      },
      {
        month: "2025-07",
        value: 0
      },
      {
        month: "2025-08",
        value: 0
      },
      {
        month: "2025-09",
        value: 0
      },
      {
        month: "2025-10",
        value: 0
      },
      {
        month: "2025-11",
        value: 0
      },
      {
        month: "2025-12",
        value: 0
      }
    ];

    expect(component.getRow('cat-1', 'pcat-1')).toEqual(expectedResult);
  });

  it('should update bindingData$ when updateCell is called', () => {
    const spyBindingData = spyOn(component.bindingData$, 'next');

    component.updateCell('cat-1', 'pcat-1', '2025-01', 500);

    expect(spyBindingData).toHaveBeenCalledWith({
      categoryId: 'cat-1',
      parentId: 'pcat-1',
      month: '2025-01',
      value: 500,
    });
  });

  it('should populate inputArray with nativeElements from inputs', () => {
    const sampleInput1 = document.createElement('input');
    const sampleInput2 = document.createElement('input');

    const queryList = new QueryList<ElementRef<HTMLInputElement>>();
    queryList.reset([sampleInput1, sampleInput2].map(el => new ElementRef(el)));
    component.inputs = queryList;
    component.updateInputArray();

    expect(component.inputArray.length).toEqual(2);
    expect(component.inputArray).toEqual([sampleInput1, sampleInput2]);
  });

  it('should call focus on the first input', () => {
    const sampleInput1 = document.createElement('input');
    const sampleInput2 = document.createElement('input');

    const spyFocusOnInput1 = spyOn(sampleInput1, 'focus');

    const queryList = new QueryList<ElementRef<HTMLInputElement>>();
    queryList.reset([sampleInput1, sampleInput2].map(el => new ElementRef(el)));
    component.inputs = queryList;
    component.updateInputArray();

    component.focusFirst();

    expect(spyFocusOnInput1).toHaveBeenCalledTimes(1);
  });

  it('should not call focus when inputArray is empty', () => {
    component.inputArray = [];
    expect(() => component.focusFirst()).not.toThrow();
  });


  it('should call hideMenu on any key', () => {
    const spyHideMenu = spyOn(component, 'hideMenu');

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onKeyDown(event);

    expect(spyHideMenu).toHaveBeenCalled();
  });



  it('should moves focus to next input on ArrowRight', () => {
    const sampleInput1 = document.createElement('input');
    const sampleInput2 = document.createElement('input');

    const queryList = new QueryList<ElementRef<HTMLInputElement>>();
    queryList.reset([sampleInput1, sampleInput2].map(el => new ElementRef(el)));
    component.inputs = queryList;
    component.updateInputArray();

    const spyFocusOnInput2 = spyOn(sampleInput2, 'focus');

    spyOnProperty(document, 'activeElement', 'get').and.returnValue(sampleInput1);

    component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

    expect(spyFocusOnInput2).toHaveBeenCalledTimes(1);
  });

  it('should moves focus to next input on ArrowLeft', () => {
    const sampleInput1 = document.createElement('input');
    const sampleInput2 = document.createElement('input');

    const spyFocusOnInput1 = spyOn(sampleInput1, 'focus');
    const spyFocusOnInput2 = spyOn(sampleInput2, 'focus');

    const queryList = new QueryList<ElementRef<HTMLInputElement>>();
    queryList.reset([sampleInput1, sampleInput2].map(el => new ElementRef(el)));
    component.inputs = queryList;
    component.updateInputArray();
    component.focusFirst();

    expect(spyFocusOnInput1).toHaveBeenCalledTimes(1);

    spyOnProperty(document, 'activeElement', 'get').and.returnValue(sampleInput1);

    component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(spyFocusOnInput2).toHaveBeenCalledTimes(1);

    component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(spyFocusOnInput1).toHaveBeenCalledTimes(1);
  });

  it('should call context with correct values', () => {
    const setSpy = spyOn((component.context), 'set');

    const numberInput = document.createElement('input');
    numberInput.setAttribute('type', 'number');
    numberInput.valueAsNumber = 150;

    const event = new MouseEvent('click', { clientX: 50, clientY: 100 });
    Object.defineProperty(event, 'target', { value: numberInput });

    const preventSpy = spyOn(event, 'preventDefault');

    component.showContext(event, 'cat-1');

    expect(preventSpy).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith({
      visible: true,
      x: 50,
      y: 100,
      catId: 'cat-1',
      value: 150,
    });
  });

  it('should call applyAll with catId and value from context and hideMenu', () => {
    const spyHideMenu = spyOn(component, 'hideMenu');
    const spyApplyAll = spyOn(budgetService, 'applyAll');

    const numberInput = document.createElement('input');
    numberInput.setAttribute('type', 'number');
    numberInput.valueAsNumber = 150;

    const event = new MouseEvent('click', { clientX: 50, clientY: 100 });
    Object.defineProperty(event, 'target', { value: numberInput });

    component.showContext(event, 'cat-1');

    component.applyToAll();

    expect(spyApplyAll).toHaveBeenCalled();
    expect(spyApplyAll).toHaveBeenCalledWith('cat-1', 150);
    expect(spyHideMenu).toHaveBeenCalled();
  });

  it('should call hideMenu', () => {
    const spyHideMenu = spyOn(component, 'hideMenu');

    component.applyToAll();

    expect(spyHideMenu).toHaveBeenCalled();
  });

  it('should update createdCategoryDialogData when openCreatedCategoryDialog is called', () => {
    const type = 'expense';
    const id = '123';

    component.openCreatedCategoryDialog(type, id);

    const dialogData = component.createdCategoryDialogData();
    expect(dialogData.status).toBeTrue();
    expect(dialogData.type).toEqual(type);
    expect(dialogData.targetId).toEqual(id);
  });

  it('should early-return if form is invalid', () => {
    const spyAddCategory = spyOn(budgetService, 'addCategory');
    const spyAddParentCategory = spyOn(budgetService, 'addParentCategory');
    const spyCloseCreatedCategoryDialog = spyOn(component, 'onCloseCreatedCategoryDialog');

    component.createdCategoryDialogData.set({
      status: true,
      type: 'expense',
      targetId: 'cat-1',
    });

    component.formCategory.get('name')!.setValue('');

    component.onCreateCategory();

    expect(spyAddCategory).not.toHaveBeenCalled();
    expect(spyAddParentCategory).not.toHaveBeenCalled();
    expect(spyCloseCreatedCategoryDialog).not.toHaveBeenCalled();
    expect(component.createdCategoryDialogData().status).toBeTrue();
  });

  it('should early-return if trimmed name is empty', () => {
    const spyAddCategory = spyOn(budgetService, 'addCategory');
    const spyAddParentCategory = spyOn(budgetService, 'addParentCategory');
    const spyCloseCreatedCategoryDialog = spyOn(component, 'onCloseCreatedCategoryDialog');

    component.createdCategoryDialogData.set({
      status: true,
      type: 'expense',
      targetId: 'cat-1',
    });

    component.formCategory.get('name')!.setValue('    ');

    component.onCreateCategory();

    expect(spyAddCategory).not.toHaveBeenCalled();
    expect(spyAddParentCategory).not.toHaveBeenCalled();
    expect(spyCloseCreatedCategoryDialog).not.toHaveBeenCalled();
  });

  it('should call addParentCategory when there is no parentId', () => {
    const spyAddCategory = spyOn(budgetService, 'addCategory');
    const spyAddParentCategory = spyOn(budgetService, 'addParentCategory');
    const spyCloseCreatedCategoryDialog = spyOn(component, 'onCloseCreatedCategoryDialog');
    component.createdCategoryDialogData.set({
      status: true,
      type: 'income',
      targetId: '',
    });
    component.formCategory.get('name')!.setValue('Cloud');

    component.onCreateCategory();

    expect(spyAddCategory).toHaveBeenCalledTimes(0);
    expect(spyAddParentCategory).toHaveBeenCalledWith('Cloud', 'income');

    expect(component.formCategory.get('name')!.value).toEqual('');
    expect(spyCloseCreatedCategoryDialog).toHaveBeenCalled();
  });


  it('should call addCategory when there is parentId', () => {
    const spyAddCategory = spyOn(budgetService, 'addCategory');
    const spyAddParentCategory = spyOn(budgetService, 'addParentCategory');
    const spyCloseCreatedCategoryDialog = spyOn(component, 'onCloseCreatedCategoryDialog');
    component.createdCategoryDialogData.set({
      status: true,
      type: 'expense',
      targetId: 'pcat-1',
    });
    component.formCategory.get('name')!.setValue('Transport');

    component.onCreateCategory();

    expect(spyAddParentCategory).toHaveBeenCalledTimes(0);
    expect(spyAddCategory).toHaveBeenCalledWith('pcat-1', 'Transport', 'expense');

    expect(component.formCategory.get('name')!.value).toEqual('');
    expect(spyCloseCreatedCategoryDialog).toHaveBeenCalled();
  });

  it('should call removeCategory when isParent false', () => {
    const spyRemoveCategory = spyOn(budgetService, 'removeCategory');
    const spyRemoveParentCategory = spyOn(budgetService, 'removeParentCategory');
    const spyCloseRemovedCategoryDialog = spyOn(component, 'onCloseRemovedCategoryDialog');
    component.removedCategoryDialogData.set({
      targetId: 'cat-1',
      status: true,
      name: '',
      isParent: false,
    });

    component.onRemoveCategory();

    expect(component.removedCategoryDialogData().isParent).toBeFalse();
    expect(spyRemoveParentCategory).not.toHaveBeenCalled();
    expect(spyRemoveCategory).toHaveBeenCalledWith('cat-1');
    expect(spyCloseRemovedCategoryDialog).toHaveBeenCalled();
  });

  it('should call removeParentCategory when isParent true', () => {
    const spyRemoveCategory = spyOn(budgetService, 'removeCategory');
    const spyRemoveParentCategory = spyOn(budgetService, 'removeParentCategory');
    const spyCloseRemovedCategoryDialog = spyOn(component, 'onCloseRemovedCategoryDialog');
    component.removedCategoryDialogData.set({
      targetId: 'pcat-1',
      status: true,
      name: '',
      isParent: true,
    });

    component.onRemoveCategory();

    expect(component.removedCategoryDialogData().isParent).toBeTrue();
    expect(spyRemoveCategory).not.toHaveBeenCalled();
    expect(spyRemoveParentCategory).toHaveBeenCalledWith('pcat-1');
    expect(spyCloseRemovedCategoryDialog).toHaveBeenCalled();
  });

  it('should update applyAllDialogData after called openConfirmApplyToAllDialog', () => {
    const spyHideMenu = spyOn(component, 'hideMenu');

    component.openConfirmApplyToAllDialog();

    expect(spyHideMenu).toHaveBeenCalled();

    const dialogData = component.applyAllDialogData();
    expect(dialogData.status).toBeTrue();
  });

  it('should call applyToAll and onCloseConfirmApplyToAllDialog ', () => {
    const spyCloseConfirmApplyToAllDialog = spyOn(component, 'onCloseConfirmApplyToAllDialog');
    const spyApplyToAll = spyOn(component, 'applyToAll');

    component.onAcceptApplyToAll();

    expect(spyCloseConfirmApplyToAllDialog).toHaveBeenCalled();
    expect(spyApplyToAll).toHaveBeenCalled();
  });

  it('should update correct value createdCategoryDialogData after close create dialog', () => {
    component.onCloseCreatedCategoryDialog();

    expect(component.createdCategoryDialogData().status).toBeFalse();
    expect(component.formCategory.get('name')!.value).toEqual('');
    expect(component.createdCategoryDialogData().status).toBeFalse();
  });

  it('should update correct value removedCategoryDialogData after close removed category dialog', () => {
    component.onCloseRemovedCategoryDialog();

    expect(component.removedCategoryDialogData()).toEqual({
      status: false,
      name: '',
      isParent: false,
      targetId: '',
    });
  });

  it('should update correct value applyAllDialogData after close confirm apply to all dialog', () => {
    component.onCloseConfirmApplyToAllDialog();

    expect(component.applyAllDialogData().status).toBeFalse();
  });


  it('should emit and complete destroy$ so subscribers stop receiving values', () => {
    const spyDestroyService = spyOn(budgetService.detroyService$, 'next');
    const spyDestroyNext = spyOn(component.destroy$, 'next');
    const spyDestroyComplete = spyOn(component.destroy$, 'complete');

    component.ngOnDestroy();

    expect(spyDestroyService).toHaveBeenCalledTimes(1);
    expect(spyDestroyNext).toHaveBeenCalledTimes(1);
    expect(spyDestroyComplete).toHaveBeenCalledTimes(1);
  });

  it('should complete destroy$ so subscribers stop receiving values', () => {
    let count = 0;

    const source$ = new Subject<void>();
    source$.pipe(takeUntil(component.destroy$)).subscribe(() => count++);
  
    source$.next();
    expect(count).toEqual(1);

    component.ngOnDestroy();
    source$.next();
    expect(count).toEqual(1);
  });
});
