import { toast } from "react-toastify";
import { configureStore, isRejectedWithValue } from "@reduxjs/toolkit";
import { clientsApi } from "./api/clientsApi";
import { employeesApi } from "./api/employeesApi";
import { contractsApi } from "./api/contractsApi";
import { productsApi } from "./api/productsApi";

export const rtkQueryErrorLogger =
  () => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      console.warn('We got a rejected action!')
      console.warn(action.payload.data.error)
      const errorMessage = Array.isArray(action.payload.data.message)
        ? action.payload.data.message[0]
        : action.payload.data.message;

      console.warn(errorMessage);
      toast.error(errorMessage);
    }
    return next(action)
  }

export const store = configureStore({
  reducer: {
    [clientsApi.reducerPath]: clientsApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [contractsApi.reducerPath]: contractsApi.reducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat([
      rtkQueryErrorLogger,
      clientsApi.middleware,
      employeesApi.middleware,
      productsApi.middleware,
      contractsApi.middleware,
    ]),
});
