import { apiSlice } from './apiSlice';

export interface AdminTransaction {
  id: number | string;
  order_number: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    profile?: {
        avatar?: string;
    };
  };
  items: Array<{
    id: number;
    course_title: string;
    price: string | number;
    course: {
      id: number;
      title: string;
      thumbnail?: string;
    };
  }>;
  total: string | number;
  subtotal: string | number;
  tax: string | number;
  discount: string | number;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled' | 'refunded';
  created_at: string;
  paid_at?: string;
  payments?: Array<{
    id: number;
    payment_method: string;
    payment_status: string;
    amount: string | number;
    completed_at?: string;
  }>;
}

export interface TransactionStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  total_revenue: number;
  this_month_revenue: number;
  revenue_growth: number;
  average_transaction: number;
}

export const transactionManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminTransactions: builder.query<{ success: boolean; data: any }, any>({
      query: (params) => ({
        url: '/admin/transactions',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.data.map(({ id }: { id: string | number }) => ({ type: 'Transactions' as const, id })),
              { type: 'Transactions', id: 'LIST' },
            ]
          : [{ type: 'Transactions', id: 'LIST' }],
    }),
    getAdminTransactionStats: builder.query<{ success: boolean; data: TransactionStats }, void>({
      query: () => '/admin/transactions/stats',
      providesTags: [{ type: 'TransactionStats', id: 'ADMIN' }],
    }),
    getAdminTransactionDetail: builder.query<{ success: boolean; data: AdminTransaction }, string | number>({
      query: (id) => `/admin/transactions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Transactions', id }],
    }),
  }),
});

export const {
  useGetAdminTransactionsQuery,
  useGetAdminTransactionStatsQuery,
  useGetAdminTransactionDetailQuery,
} = transactionManagementApiSlice;
