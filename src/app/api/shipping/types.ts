export interface ShippingRate {
	provider: string;
	service: string;
	price: string;
	currency: string;
	estimated_days: number;
}