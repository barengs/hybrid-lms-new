import { apiSlice } from '../api/apiSlice';

export interface MenuItem {
    id: number;
    parent_id: number | null;
    key: string;
    label_id: string;
    label_en: string;
    route: string | null;
    icon: string | null;
    permission_name: string | null;
    role_group: string;
    order: number;
    children?: MenuItem[];
}

export const menuApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMenus: builder.query<{ data: MenuItem[] }, void>({
            query: () => '/menus',
            providesTags: ['Roles'], // Use Roles tag to invalidate when permissions change
        }),
    }),
});

export const {
    useGetMenusQuery,
} = menuApiSlice;
