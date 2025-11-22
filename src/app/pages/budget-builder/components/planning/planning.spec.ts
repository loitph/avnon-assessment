import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planning } from './planning';

describe('Planning', () => {
  let component: Planning;
  let fixture: ComponentFixture<Planning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planning);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return empty array when no income categories', () => {
    component.data.set({
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
    });

    expect(component.incomeCategories().length).toEqual(0);
  });

  it('should return empty array when no expense categories', () => {
    component.data.set({
      parentCategories: [
        {
          id: 'pcat-2',
          type: 'income',
          name: 'Operation',
        },
      ],
  
      categories: [{
          id: 'cat-3',
          type: 'income',
          name: 'Hosting',
          parentId: 'pcat-2',
        },
      ],
  
      rows: [],
    });

    expect(component.expensesCategories().length).toEqual(0);
  });
});
