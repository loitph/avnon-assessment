import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'bb-context-menu',
  imports: [],
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenu {
  @Input() x = 0;
  @Input() y = 0;

  @Output() apply = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
