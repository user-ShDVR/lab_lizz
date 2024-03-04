import { configureStore } from "@reduxjs/toolkit";
import { clientsApi } from "./api/clientsApi";
import { employeesApi } from "./api/employeesApi";
import { pledgesApi } from "./api/pledgesApi";
import { contractsApi } from "./api/contractsApi";

export const store = configureStore({
  reducer: {
    [clientsApi.reducerPath]: clientsApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [pledgesApi.reducerPath]: pledgesApi.reducer,
    [contractsApi.reducerPath]: contractsApi.reducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat([
      clientsApi.middleware,
      employeesApi.middleware,
      pledgesApi.middleware,
      contractsApi.middleware,
    ]),
});
