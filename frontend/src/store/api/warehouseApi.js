import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "http://localhost:3000";

export const warehouseApi = createApi({
  reducerPath: "warehouseApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/`,
  }),

  endpoints: (builder) => ({
    createWarehouse: builder.mutation({
      query(data) {
        return {
          url: "warehouse",
          method: "POST",
          body: data,
        };
      },
    }),

    getAllWarehouse: builder.query({
      query: () => "warehouse",
    }),

    updateWarehouse: builder.mutation({
      query: ({ id, data }) => ({
        url: `warehouse/${id}`,
        method: "PATCH",
        body: { ...data },
      }),
    }),

    deleteWarehouse: builder.mutation({
      query: (id) => ({
        url: `warehouse/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateWarehouseMutation,
  useGetAllWarehouseQuery,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApi;
