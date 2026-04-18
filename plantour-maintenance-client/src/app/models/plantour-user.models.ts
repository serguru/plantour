export interface PlantourUserRowDto {
  id: string;
  email: string;
  fullName?: string | null;
  role: string;
  plan?: string | null;
  stripeCustomerId?: string | null;
  stripeCustomerStatus?: string | null;
  stripeSubscriptionId?: string | null;
  stripeSubscriptionStatus?: string | null;
  stripePriceId?: string | null;
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