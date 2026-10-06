import { configureStore } from '@reduxjs/toolkit';
import packageReducer from './features/packages/packageSlice';
import couponReducer  from './features/coupons/couponSlice';
import authReducer from './features/auth/authSlice';

export const store = configureStore({
  reducer: {
    package: packageReducer,
    coupon:  couponReducer,
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
