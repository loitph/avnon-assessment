import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'bb-dialog',
  imports: [],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dialog {
  @Output() ok = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  triggerOk() {
    this.ok.emit();
  }

  triggerCancel() {
    this.cancel.emit();
  }

  triggerClose() {
    this.close.emit();
  }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this.triggerClose()
    };
  }
}
