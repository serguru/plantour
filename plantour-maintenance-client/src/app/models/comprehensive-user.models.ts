export interface ComprehensiveUserDto {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    googleSub?: string;
    facebookUserId?: string;
    notes?: string;
    createdAt: string;
    temporary: boolean;
    participantCode?: string;
    paymentProcessorSubscriptionId?: string;
    accessTypeId: string;
    currencyId?: string;
    
    // Collections as generic objects
    userSettings: any[];
    userKeys: any[];
    userThings: any[];
    userTodos: any[];
    userPackages: any[];
    adminsParticipantAdmins: any[];
    adminsParticipantParticipants: any[];
    aiPrompts: any[];
    aiTripPlans: any[];
    refreshTokens: any[];
    trips: any[];
    
    // Indirect relationships
    tripUsers: any[];
    tripUserThings: any[];
    tripUserTodos: any[];
    tripUserExpenses: any[];
    tripUserPackages: any[];
    
    // Other relationships
    apiVisits: any[];
    contactSubmissions: any[];
    
    // Counts
    totalTripsCount: number;
    totalThingsCount: number;
    totalTodosCount: number;
    totalExpensesCount: number;
    totalPackagesCount: number;
}