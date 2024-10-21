import {Component, Input, WritableSignal} from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {MenuModule} from "primeng/menu";
import {OverlayModule} from "primeng/overlay";
import {MenuItem} from "primeng/api";

@Component({
  selector: 'app-popup-menu',
  standalone: true,
  imports: [
    ButtonDirective,
    MenuModule,
    OverlayModule
  ],
  templateUrl: './popup-menu.component.html',
  styleUrl: './popup-menu.component.css'
})
export class PopupMenuComponent {
  @Input() items!: MenuItem[];
  overlayVisible: boolean | WritableSignal<boolean> = false;

  toggle(): void{
    this.overlayVisible = !this.overlayVisible;
  }
}
