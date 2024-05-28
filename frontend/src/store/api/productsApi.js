import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "http://localhost:3000";

export const productsApi = createApi({
  reducerPath: "productsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/`,
  }),

  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query(data) {
        return {
          url: "product",
          method: "POST",
          body: data,
        };
      },
    }),

    getAllProducts: builder.query({
      query: () => "product",
    }),

    getAllProductsByMaker: builder.query({
      query: () => "product/maker",
    }),

    getAllProductsByDistributor: builder.query({
      query: () => "product/distributor",
    }),

    getAllProductsFromUser: builder.query({
      query: ({ id }) => ({
        url: `product`,
        method: "GET",
        params: { user: id },
      }),
    }),

    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `product/${id}`,
        method: "PATCH",
        body: { ...data },
      }),
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `product/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAllProductsQuery,
  useGetAllProductsFromUserQuery,
  useGetAllProductsByMakerQuery,
  useGetAllProductsByDistributorQuery,
} = productsApi;
