export interface PlantourUserRowDto {
  id: string;
  email: string;
  fullName?: string | null;
  role: string;
  plan?: string | null;
  paddleCustomerId?: string | null;
  paddleCustomerStatus?: string | null;
  paddleSubscriptionId?: string | null;
  paddleSubscriptionStatus?: string | null;
  paddlePriceId?: string | null;
  temporary: boolean;
  dateJoined: string;
  hasActiveSubscription: boolean;
  latestPlanStartedAt?: string | null;
  lastVisitAt?: string | null;
  tripsCount: number;
  itemsCount: number;
  todosCount: number;
  expensesCount: number;
  travelersCount: number;
  paymentsTotal?: string | null;
}