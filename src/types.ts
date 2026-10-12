import { FoodItem, UserProfile, Order } from './api.ts';

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export type ActiveView = 'storefront' | 'checkout' | 'tracking' | 'admin';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
