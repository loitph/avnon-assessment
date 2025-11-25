import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dialog } from './dialog';
import { By } from '@angular/platform-browser';

describe('Dialog', () => {
  let component: Dialog;
  let fixture: ComponentFixture<Dialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dialog],
    }).compileComponents();

    fixture = TestBed.createComponent(Dialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit ok when triggerOk() is called', () => {
    const spyEmit = spyOn(component.ok, 'emit');
    component.triggerOk();
    expect(spyEmit).toHaveBeenCalled();
  });

  it('should emit cancel when triggerCancel() is called', () => {
    const spyCancel = spyOn(component.cancel, 'emit');
    component.triggerCancel();
    expect(spyCancel).toHaveBeenCalled();
  });

  it('should emit close when triggerClose() is called', () => {
    const spyClose = spyOn(component.close, 'emit');
    component.triggerClose();
    expect(spyClose).toHaveBeenCalled();
  });

  describe('backdrop click behavior', () => {
    it('should emit close when clicking on backdrop', () => {
      const spyClose = spyOn(component.close, 'emit');
      const backdrop = fixture.debugElement.query(By.css('.close-btn'));

      backdrop?.triggerEventHandler('click', {
        target: backdrop.nativeElement,
        currentTarget: backdrop.nativeElement,
      });

      expect(spyClose).toHaveBeenCalled();
    });

    it('should NOT emit close when clicking inside dialog content', () => {
      const spyClose = spyOn(component.close, 'emit');

      const content = fixture.debugElement.query(By.css('.dialog-body'));
      const child = document.createElement('button');
      content.nativeElement.appendChild(child);

      content.triggerEventHandler('click', {
        target: child,
        currentTarget: content.nativeElement,
      });

      expect(spyClose).not.toHaveBeenCalled();
    });
  });
});
