import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "http://localhost:3000";

export const clientsApi = createApi({
  reducerPath: "clientsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/`,
  }),

  endpoints: (builder) => ({
    createClient: builder.mutation({
      query(data) {
        return {
          url: "user",
          method: "POST",
          body: data,
        };
      },
    }),

    getAllClientsByRole: builder.query({
      query: ({role}) => ({
        url: `user/role`,
        method: "GET",
        params: { role },
      }),
    }),

    getAllClients: builder.query({
      query: () => "user",
    }),

    updateClient: builder.mutation({
      query: ({ userId, data }) => ({
        url: `user/${userId}`,
        method: "PATCH",
        body: { ...data },
      }),
    }),

    deleteClient: builder.mutation({
      query: (userId) => ({
        url: `user/${userId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetAllClientsByRoleQuery,
  useGetAllClientsQuery,
} = clientsApi;
