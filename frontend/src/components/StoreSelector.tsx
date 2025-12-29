import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Chip
} from '@mui/material';
import { Store } from '../types';
import { apiService } from '../services/api';

interface StoreSelectorProps {
  onStoreSelect: (store: Store | null) => void;
  selectedStore: Store | null;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({ 
  onStoreSelect, 
  selectedStore 
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const data = await apiService.getStores();
      setStores(data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    onStoreSelect(store || null);
  };

  return (
    <Box>
      <FormControl fullWidth disabled={loading}>
        <InputLabel id="store-select-label">Select Store</InputLabel>
        <Select
          labelId="store-select-label"
          value={selectedStore?.id || ''}
          label="Select Store"
          onChange={(e) => handleChange(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {stores.map((store) => (
            <MenuItem key={store.id} value={store.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {store.name}
                <Chip 
                  label={store.platform} 
                  size="small" 
                  color="primary"
                />
                <Chip 
                  label={store.status} 
                  size="small" 
                  color={store.status === 'online' ? 'success' : 'default'}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};