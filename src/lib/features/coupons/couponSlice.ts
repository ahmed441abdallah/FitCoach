import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Coupon {
  _id: string;
  code: string;
  discount: number;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CouponState {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
}

const initialState: CouponState = {
  coupons: [],
  loading: false,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────
export const getCoupons = createAsyncThunk(
  'coupon/getCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/cupons');
      return res.data.data as Coupon[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch coupons');
    }
  }
);

export const createCoupon = createAsyncThunk(
  'coupon/createCoupon',
  async (data: { code: string; discount: number; expiresAt: string }, { rejectWithValue }) => {
    try {
      const res = await axios.post('/cupons', data);
      return res.data.data as Coupon;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create coupon');
    }
  }
);

export const updateCoupon = createAsyncThunk(
  'coupon/updateCoupon',
  async ({ id, data }: { id: string; data: Partial<{ code: string; discount: number; expiresAt: string }> }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/cupons/${id}`, data);
      return res.data.data as Coupon;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update coupon');
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'coupon/deleteCoupon',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/cupons/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete coupon');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearCouponErrors: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // getCoupons
      .addCase(getCoupons.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(getCoupons.fulfilled, (state, action: PayloadAction<Coupon[]>) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(getCoupons.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string; })

      // createCoupon
      .addCase(createCoupon.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(createCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = false;
        state.coupons.push(action.payload);
      })
      .addCase(createCoupon.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string; })

      // updateCoupon
      .addCase(updateCoupon.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(updateCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = false;
        state.coupons = state.coupons.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })
      .addCase(updateCoupon.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string; })

      // deleteCoupon
      .addCase(deleteCoupon.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(deleteCoupon.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCoupon.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearCouponErrors } = couponSlice.actions;
export default couponSlice.reducer;
