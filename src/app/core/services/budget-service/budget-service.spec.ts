import { TestBed } from '@angular/core/testing';

import { BudgetService } from './budget-service';
import { DataBudget } from '@models/budget.model';

describe('Budget', () => {
  let service: BudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BudgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate 12 months for year 2025', () => {
    const result = service.months();

    expect(result.length).toEqual(12);
    expect(result[0]).toEqual({ key: '2025-01', label: 'Jan 2025' });
    expect(result[11]).toEqual({ key: '2025-12', label: 'Dec 2025' });
  });

  it('should update when numberOfMonths changes', () => {
    service._numberOfMonths.set(6);
    const result = service.months();

    expect(result.length).toEqual(6);
    expect(result[5]).toEqual({ key: '2025-06', label: 'Jun 2025' });
  });

  it('should update when year changes', () => {
    service._year.set(2030);
    const result = service.months();

    expect(result[0].key).toEqual('2030-01');
    expect(result[0].label).toContain('2030');
  });

  it('should calculate correct totals when values are updated', () => {
    service.data.update(budgetItem => ({
      ...budgetItem,
      rows: [
        {
          ...budgetItem.rows[0],
          values: {
            ...budgetItem.rows[0].values,
            '2025-01': 100,
            '2025-02': 50,
            '2025-03': 0
          },
        },
        {
          ...budgetItem.rows[1],
          values: {
            ...budgetItem.rows[1].values,
            '2025-01': 200,
            '2025-02': 0,
            '2025-03': 300
          },
        },
        {
          ...budgetItem.rows[2],
          values: {
            ...budgetItem.rows[2].values,
            '2025-01': 0,
            '2025-02': 400,
            '2025-03': 0
          },
        },
      ],
    }));

    const result = service.parentTotalsById();
    expect(result.get('pcat-1')).toEqual([300, 50, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(result.get('pcat-2')).toEqual([0, 400, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });


  it('should calculate correct profitAndLoss when values are updated', () => {
    service.data.update(budgetItem => ({
      ...budgetItem,
      rows: [
        {
          ...budgetItem.rows[0],
          values: {
            ...budgetItem.rows[0].values,
            '2025-01': 100,
            '2025-02': 50,
            '2025-03': 0
          },
        },
        {
          ...budgetItem.rows[1],
          values: {
            ...budgetItem.rows[1].values,
            '2025-01': 200,
            '2025-02': 0,
            '2025-03': 300
          },
        },
        {
          ...budgetItem.rows[2],
          values: {
            ...budgetItem.rows[2].values,
            '2025-01': 0,
            '2025-02': 400,
            '2025-03': 0
          },
        },
      ],
    }));

    const result = service.profitAndLoss();
    expect(result).toEqual([
      300,
      -350,
      300,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]);
  });

  it('should calculate correct openingBalance when values are updated', () => {
    service.data.update(budgetItem => ({
      ...budgetItem,
      rows: [
        {
          ...budgetItem.rows[0],
          values: {
            ...budgetItem.rows[0].values,
            '2025-01': 100,
            '2025-02': 50,
            '2025-03': 0
          },
        },
        {
          ...budgetItem.rows[1],
          values: {
            ...budgetItem.rows[1].values,
            '2025-01': 200,
            '2025-02': 0,
            '2025-03': 300
          },
        },
        {
          ...budgetItem.rows[2],
          values: {
            ...budgetItem.rows[2].values,
            '2025-01': 0,
            '2025-02': 400,
            '2025-03': 0
          },
        },
      ],
    }));

    const result = service.openingBalance();
    expect(result).toEqual([
      0,
      300,
      -50,
      250,
      250,
      250,
      250,
      250,
      250,
      250,
      250,
      250,
    ]);
  });

  it('should calculate correct closingBalance when values are updated', () => {
    service.data.update(budgetItem => ({
      ...budgetItem,
      rows: [
        {
          ...budgetItem.rows[0],
          values: {
            ...budgetItem.rows[0].values,
            '2025-01': 100,
            '2025-02': 50,
            '2025-03': 0
          },
        },
        {
          ...budgetItem.rows[1],
          values: {
            ...budgetItem.rows[1].values,
            '2025-01': 200,
            '2025-02': 0,
            '2025-03': 300
          },
        },
        {
          ...budgetItem.rows[2],
          values: {
            ...budgetItem.rows[2].values,
            '2025-01': 0,
            '2025-02': 400,
            '2025-03': 0
          },
        },
      ],
    }));

    const result = service.closingBalance();
    expect(result).toEqual([
      300,
      -50,
      250,
      250,
      250,
      250,
      250,
      250,
      250,
      250,
      250,
      250,
    ]);
  });

  it('should create new data()', () => {
    service['initRow'];

    const expectedResultData = {
      parentCategories: [
        {
          id: 'pcat-1',
          type: 'income',
          name: 'Delivery'
        },
        {
          id: 'pcat-2',
          type: 'expense',
          name: 'Operation'
        }
      ],
      categories: [
        {
          id: 'cat-1',
          type: 'income',
          name: 'Sales',
          parentId: 'pcat-1'
        },
        {
          id: 'cat-2',
          type: 'income',
          name: 'Commissions',
          parentId: 'pcat-1'
        },
        {
          id: 'cat-3',
          type: 'expense',
          name: 'Hosting',
          parentId: 'pcat-2'
        }
      ],
      rows: [
        {
          id: 'row-1',
          type: 'income',
          categoryId: 'cat-1',
          parentId: 'pcat-1',
          values: {
            ['2025-01' as string]: 0,
            ['2025-02' as string]: 0,
            ['2025-03' as string]: 0,
            ['2025-04' as string]: 0,
            ['2025-05' as string]: 0,
            ['2025-06' as string]: 0,
            ['2025-07' as string]: 0,
            ['2025-08' as string]: 0,
            ['2025-09' as string]: 0,
            ['2025-10' as string]: 0,
            ['2025-11' as string]: 0,
            ['2025-12' as string]: 0,
          }
        },
        {
          id: 'row-2',
          type: 'income',
          categoryId: 'cat-2',
          parentId: 'pcat-1',
          values: {
            ['2025-01' as string]: 0,
            ['2025-02' as string]: 0,
            ['2025-03' as string]: 0,
            ['2025-04' as string]: 0,
            ['2025-05' as string]: 0,
            ['2025-06' as string]: 0,
            ['2025-07' as string]: 0,
            ['2025-08' as string]: 0,
            ['2025-09' as string]: 0,
            ['2025-10' as string]: 0,
            ['2025-11' as string]: 0,
            ['2025-12' as string]: 0,
          }
        },
        {
          id: 'row-3',
          type: 'expense',
          categoryId: 'cat-3',
          parentId: 'pcat-2',
          values: {
            ['2025-01' as string]: 0,
            ['2025-02' as string]: 0,
            ['2025-03' as string]: 0,
            ['2025-04' as string]: 0,
            ['2025-05' as string]: 0,
            ['2025-06' as string]: 0,
            ['2025-07' as string]: 0,
            ['2025-08' as string]: 0,
            ['2025-09' as string]: 0,
            ['2025-10' as string]: 0,
            ['2025-11' as string]: 0,
            ['2025-12' as string]: 0,
          }
        }
      ]
    } as  DataBudget;

    expect(service.data()).toEqual(expectedResultData);
  });

  it('should update data() when user input changes a value', () => {
    const expectedResultData = {
      parentCategories: [
        {
          id: 'pcat-1',
          type: 'income',
          name: 'Delivery'
        },
        {
          id: 'pcat-2',
          type: 'expense',
          name: 'Operation'
        }
      ],
      categories: [
        {
          id: 'cat-1',
          type: 'income',
          name: 'Sales',
          parentId: 'pcat-1'
        },
        {
          id: 'cat-2',
          type: 'income',
          name: 'Commissions',
          parentId: 'pcat-1'
        },
        {
          id: 'cat-3',
          type: 'expense',
          name: 'Hosting',
          parentId: 'pcat-2'
        }
      ],
      rows: [
        {
          id: 'row-1',
          type: 'income',
          categoryId: 'cat-1',
          parentId: 'pcat-1',
          values: {
            ['2025-01' as string]: 100,
            ['2025-02' as string]: 0,
            ['2025-03' as string]: 0,
            ['2025-04' as string]: 0,
            ['2025-05' as string]: 0,
            ['2025-06' as string]: 0,
            ['2025-07' as string]: 0,
            ['2025-08' as string]: 0,
            ['2025-09' as string]: 0,
            ['2025-10' as string]: 0,
            ['2025-11' as string]: 0,
            ['2025-12' as string]: 0,
          }
        },
        {
          id: 'row-2',
          type: 'income',
          categoryId: 'cat-2',
          parentId: 'pcat-1',
          values: {
            ['2025-01' as string]: 0,
            ['2025-02' as string]: 0,
            ['2025-03' as string]: 0,
            ['2025-04' as string]: 0,
            ['2025-05' as string]: 0,
            ['2025-06' as string]: 0,
            ['2025-07' as string]: 0,
            ['2025-08' as string]: 0,
            ['2025-09' as string]: 0,
            ['2025-10' as string]: 0,
            ['2025-11' as string]: 0,
            ['2025-12' as string]: 0,
          }
        },
        {
          id: 'row-3',
          type: 'expense',
          categoryId: 'cat-3',
          parentId: 'pcat-2',
          values: {
            ['2025-01' as string]: 0,
            ['2025-02' as string]: 0,
            ['2025-03' as string]: 0,
            ['2025-04' as string]: 0,
            ['2025-05' as string]: 0,
            ['2025-06' as string]: 0,
            ['2025-07' as string]: 0,
            ['2025-08' as string]: 0,
            ['2025-09' as string]: 0,
            ['2025-10' as string]: 0,
            ['2025-11' as string]: 0,
            ['2025-12' as string]: 0,
          }
        }
      ]
    } as  DataBudget;

    service.data.set(expectedResultData);

    service.updateCell('cat-1', 'pcat-1', '2025-01', 100);
    expect(service.data()).toEqual(expectedResultData);
  });

  it('should update correct data() when user addCategory', () => {
    const defaultData = {
      parentCategories: [
        {
          id: 'pcat-1',
          type: 'income',
          name: 'Delivery'
        },
      ],
      categories: [
        {
          id: 'cat-1',
          type: 'income',
          name: 'Sales',
          parentId: 'pcat-1'
        },
      ],
      rows: [
        {
          id: 'row-1',
          type: 'income',
          categoryId: 'cat-1',
          parentId: 'pcat-1',
          values: {
            ['2025-01' as string]: 0,
          }
        },
      ]
    } as  DataBudget;

    service._numberOfMonths.set(1);

    service.data.set(defaultData);

    service.addCategory('pcat-1', 'Sales', 'income');
    expect(service.data().categories.length).toEqual(2);
    expect(service.data().rows.length).toEqual(2);
    expect(service.data().categories[1].id).toEqual(service.data().rows[1].categoryId);
  });

  it('should update correct data() when user addParentCategory', () => {
    const defaultData = {
      parentCategories: [
        {
          id: 'pcat-1',
          type: 'income',
          name: 'Delivery'
        },
      ],
      categories: [
        {
          id: 'cat-1',
          type: 'income',
          name: 'Sales',
          parentId: 'pcat-1'
        },
      ],
      rows: [
        {
          id: 'row-1',
          type: 'income',
          categoryId: 'cat-1',
          parentId: 'pcat-1',
          values: {
            ['2025-01' as string]: 0,
          }
        },
      ]
    } as  DataBudget;

    service._numberOfMonths.set(1);

    service.data.set(defaultData);

    service.addParentCategory('Tariff', 'expense');
    expect(service.data().parentCategories.length).toEqual(2);
  });

  it('should update correct data() when user removeCategory', () => {
    const defaultData = {
      parentCategories: [
        {
          id: 'pcat-1',
          type: 'income',
          name: 'Delivery'
        },
      ],
      categories: [
        {
          id: 'cat-1',
          type: 'income',
          name: 'Sales',
          parentId: 'pcat-1'
        },
      ],
      rows: [
        {
          id: 'row-1',
          type: 'income',
          categoryId: 'cat-1',
          parentId: 'pcat-1',
          values: {
            ['2025-01' as string]: 0,
          }
        },
      ]
    } as  DataBudget;

    service._numberOfMonths.set(1);

    service.data.set(defaultData);

    service.removeCategory('cat-1');
    expect(service.data().categories.length).toEqual(0);
  });

  it('should update correct data() when user removeParentCategory', () => {
    const defaultData = {
      parentCategories: [
        {
          id: 'pcat-1',
          type: 'income',
          name: 'Delivery'
        },
      ],
      categories: [
        {
          id: 'cat-1',
          type: 'income',
          name: 'Sales',
          parentId: 'pcat-1'
        },
      ],
      rows: [
        {
          id: 'row-1',
          type: 'income',
          categoryId: 'cat-1',
          parentId: 'pcat-1',
          values: {
            ['2025-01' as string]: 0,
          }
        },
      ]
    } as  DataBudget;

    service._numberOfMonths.set(1);

    service.data.set(defaultData);

    service.removeParentCategory('pcat-1');
    expect(service.data().parentCategories.length).toEqual(0);
    expect(service.data().categories.length).toEqual(0);
    expect(service.data().rows.length).toEqual(0);
  });

  it('should update correct data() when user applyAll', () => {
    const defaultData = {
      parentCategories: [
        {
          id: 'pcat-1',
          type: 'income',
          name: 'Delivery'
        },
      ],
      categories: [
        {
          id: 'cat-1',
          type: 'income',
          name: 'Sales',
          parentId: 'pcat-1'
        },
      ],
      rows: [
        {
          id: 'row-1',
          type: 'income',
          categoryId: 'cat-1',
          parentId: 'pcat-1',
          values: {
            ['2025-01' as string]: 0,
            ['2025-02' as string]: 0,
            ['2025-03' as string]: 0,
          }
        },
      ]
    } as  DataBudget;

    service._numberOfMonths.set(3);

    service.data.set(defaultData);

    service.applyAll('cat-1', 50);

    for (let month = 1; month <= 3; month++) {
      expect(service.data().rows[0].values['2025-0' + month]).toEqual(50);
    }
  });
});
