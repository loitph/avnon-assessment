import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetBuilder } from './budget-builder';

describe('BudgetBuilder', () => {
  let component: BudgetBuilder;
  let fixture: ComponentFixture<BudgetBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
