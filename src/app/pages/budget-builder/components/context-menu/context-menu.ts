import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'bb-context-menu',
  imports: [],
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.scss',
})
export class ContextMenu {
  @Input() x = 0;
  @Input() y = 0;

  @Output() apply = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
