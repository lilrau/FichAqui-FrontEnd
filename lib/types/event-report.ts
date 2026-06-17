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
}
