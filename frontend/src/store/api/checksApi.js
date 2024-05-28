import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "http://localhost:3000";

export const checksApi = createApi({
  reducerPath: "checksApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/`,
  }),

  endpoints: (builder) => ({
    createCheck: builder.mutation({
      query(data) {
        return {
          url: "check",
          method: "POST",
          body: data,
        };
      },
    }),

    getAllChecks: builder.query({
      query: ({type}) => ({
        url: "check",
        method: "GET",
        params: {type},
      }),
    }),

    updateCheck: builder.mutation({
      query: ({ id, data }) => ({
        url: `check/${id}`,
        method: "PATCH",
        body: { ...data },
      }),
    }),

    deleteCheck: builder.mutation({
      query: (id) => ({
        url: `check/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateCheckMutation,
  useGetAllChecksQuery,
  useUpdateCheckMutation,
  useDeleteCheckMutation,
} = checksApi;
