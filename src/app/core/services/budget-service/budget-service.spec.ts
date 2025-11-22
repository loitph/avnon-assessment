import { TestBed } from '@angular/core/testing';

import { BudgetService } from './budget-service';

describe('Budget', () => {
  let service: BudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BudgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate 12 months for a standard year', () => {
    spyOn(service, '_year').and.returnValue(2025);
    spyOn(service, '_numberOfMonths').and.returnValue(12);

    const months = service.months();

    expect(months.length).toBe(12);
    expect(months[0]).toEqual({
      key: '2025-01',
      label: 'Jan 2025',
    });
    expect(months[11]).toEqual({
      key: '2025-12',
      label: 'Dec 2025',
    });
  });
});
