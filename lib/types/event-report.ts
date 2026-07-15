export interface StallSalesReport {
  stallId: string;
  name: string;
  color: string;
  status: string;
  revenue: number;
  orderCount: number;
  percentage: number;
  fichasIssued?: number;
  fichasDelivered?: number;
}

export interface EventReport {
  totalRevenue: number;
  orderCount: number;
  averageTicket: number;
  salesByHour: { hour: string; value: number }[];
  salesByCategory: { name: string; percentage: number }[];
  topProducts: {
    name: string;
    sales: number;
    revenue: number;
    image: string;
  }[];
  salesByStall: StallSalesReport[];
}

export interface EventResumo {
  orderCount: number;
  totalRevenue: number;
  consumerCount: number;
  pendingOrderCount: number;
  salesByStall: StallSalesReport[];
}
