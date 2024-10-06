import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import productsSlice from "./productsSlice";
import { authReducer, cartReducer, productReducer, searchReducer } from "./slices";

const dataPersistConfig = {
  key: "cart",
  storage,
  whitelist: ["cart"],
};

const productPersistConfig = {
  key: "product",
  storage,
  whitelist: ["product", "token"],
};

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "user"],
};

const persistedProductReducer = persistReducer(productPersistConfig, productReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedCartReducer = persistReducer(dataPersistConfig, cartReducer);


export const store = configureStore({
  reducer: {
    products: productsSlice,
    product: persistedProductReducer,
    cart: persistedCartReducer,
    search: searchReducer,
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;