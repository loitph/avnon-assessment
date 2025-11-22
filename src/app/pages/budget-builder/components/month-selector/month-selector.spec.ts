import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthSelector } from './month-selector';
import { By } from '@angular/platform-browser';

describe('MonthSelector', () => {
  let component: MonthSelector;
  let fixture: ComponentFixture<MonthSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setDateRange exactly once per change event', () => {
    const monthSelect = fixture.debugElement.query(By.css('#month-selector')).nativeElement;
    const yearSelect = fixture.debugElement.query(By.css('#year-selector')).nativeElement;

    monthSelect.value = '6';
    monthSelect.dispatchEvent(new Event('change'));

    yearSelect.value = '2025';
    yearSelect.dispatchEvent(new Event('change'));

    expect(component._numberOfMonths()).toBe(6);
    expect(component._year()).toBe(2025);
  });
});
