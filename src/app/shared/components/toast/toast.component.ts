import { Component } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {

  toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {}

  close(id: number) {
    this.toastService.remove(id);
  }

  getClass(type: string) {
    switch (type) {
      case 'success': return 'bg-success text-white';
      case 'error': return 'bg-danger text-white';
      case 'info': return 'bg-primary text-white';
      default: return 'bg-secondary text-white';
    }
  }

  getIcon(type: string) {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-x-circle-fill';
      case 'info': return 'bi-info-circle-fill';
      default: return 'bi-bell-fill';
    }
  }
}