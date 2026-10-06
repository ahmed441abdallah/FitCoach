import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

// Types
export interface Package {
  _id: string;
  // TODO: Add other fields based on your schema (name, description, price, etc.)
  [key: string]: any;
}

interface PackageState {
  packages: Package[];
  currentPackage: Package | null;
  loading: boolean;
  error: string | null;
}

const initialState: PackageState = {
  packages: [],
  currentPackage: null,
  loading: false,
  error: null,
};

// Async Thunks
export const getPackages = createAsyncThunk(
  'package/getPackages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/package');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch packages');
    }
  }
);

export const getSinglePackage = createAsyncThunk(
  'package/getSinglePackage',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/package/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch package');
    }
  }
);

export const createPackage = createAsyncThunk(
  'package/createPackage',
  async (packageData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post('/package', packageData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create package');
    }
  }
);

export const updatePackage = createAsyncThunk(
  'package/updatePackage',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/package/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update package');
    }
  }
);

export const deletePackage = createAsyncThunk(
  'package/deletePackage',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/package/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete package');
    }
  }
);

const packageSlice = createSlice({
  name: 'package',
  initialState,
  reducers: {
    clearCurrentPackage: (state) => {
      state.currentPackage = null;
    },
    clearPackageErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getPackages
      .addCase(getPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPackages.fulfilled, (state, action: PayloadAction<Package[]>) => {
        state.loading = false;
        state.packages = action.payload;
      })
      .addCase(getPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // getSinglePackage
      .addCase(getSinglePackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSinglePackage.fulfilled, (state, action: PayloadAction<Package>) => {
        state.loading = false;
        state.currentPackage = action.payload;
      })
      .addCase(getSinglePackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createPackage
      .addCase(createPackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPackage.fulfilled, (state, action: PayloadAction<Package>) => {
        state.loading = false;
        state.packages.push(action.payload);
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updatePackage
      .addCase(updatePackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePackage.fulfilled, (state, action: PayloadAction<Package>) => {
        state.loading = false;
        state.packages = state.packages.map((pkg) =>
          pkg._id === action.payload._id ? action.payload : pkg
        );
        if (state.currentPackage?._id === action.payload._id) {
          state.currentPackage = action.payload;
        }
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // deletePackage
      .addCase(deletePackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePackage.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.packages = state.packages.filter((pkg) => pkg._id !== action.payload);
        if (state.currentPackage?._id === action.payload) {
          state.currentPackage = null;
        }
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentPackage, clearPackageErrors } = packageSlice.actions;
export default packageSlice.reducer;
