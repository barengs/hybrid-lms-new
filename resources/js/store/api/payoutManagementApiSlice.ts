import { apiSlice } from './apiSlice';

export interface AdminPayout {
  id: number;
  instructor_id: number;
  amount: string | number;
  status: 'pending' | 'completed' | 'rejected';
  method: string;
  account_info: string;
  notes?: string;
  processed_at?: string;
  created_at: string;
  instructor: {
    id: number;
    name: string;
    email: string;
    profile?: {
      avatar?: string;
    };
  };
}

export interface PayoutStats {
  total_payouts: number;
  pending_amount: number;
  pending_count: number;
  this_month_payouts: number;
  average_payout: number;
}

export const payoutManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminPayouts: builder.query<{ success: boolean; data: any }, any>({
      query: (params) => ({
        url: '/admin/payouts',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.data.map(({ id }: { id: number }) => ({ type: 'Payouts' as const, id })),
              { type: 'Payouts', id: 'LIST' },
            ]
          : [{ type: 'Payouts', id: 'LIST' }],
    }),
    getAdminPayoutStats: builder.query<{ success: boolean; data: PayoutStats }, void>({
      query: () => '/admin/payouts/stats',
      providesTags: [{ type: 'Earnings', id: 'ADMIN' }, { type: 'Payouts', id: 'STATS' }],
    }),
    approvePayout: builder.mutation<{ success: boolean; message: string }, { id: number; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/admin/payouts/${id}/approve`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: [{ type: 'Payouts', id: 'LIST' }, { type: 'Payouts', id: 'STATS' }],
    }),
    rejectPayout: builder.mutation<{ success: boolean; message: string }, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/payouts/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [{ type: 'Payouts', id: 'LIST' }, { type: 'Payouts', id: 'STATS' }],
    }),
  }),
});

export const {
  useGetAdminPayoutsQuery,
  useGetAdminPayoutStatsQuery,
  useApprovePayoutMutation,
  useRejectPayoutMutation,
} = payoutManagementApiSlice;
