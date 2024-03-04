import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "http://localhost:3000";

export const pledgesApi = createApi({
  reducerPath: "pledgesApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
  }),

  endpoints: (builder) => ({
    createPledge: builder.mutation({
      query(data) {
        return {
          url: "pledges",
          method: "POST",
          body: data,
        };
      },
    }),

    getAllPledges: builder.query({
      query: () => "pledges",
    }),

    updatePledge: builder.mutation({
      query: ({ pledge_code, data }) => ({
        url: `pledges/${pledge_code}`,
        method: "PATCH",
        body: { pledge_code, ...data },
      }),
    }),

    deletePledge: builder.mutation({
      query: (id) => ({
        url: `pledges/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreatePledgeMutation,
  useUpdatePledgeMutation,
  useDeletePledgeMutation,
  useGetAllPledgesQuery,
} = pledgesApi;
