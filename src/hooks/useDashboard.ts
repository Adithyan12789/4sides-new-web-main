import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { fetchDashboardData } from '@/store/slices/dashboardSlice';

export const useDashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, error } = useSelector((state: RootState) => state.dashboard);

    useEffect(() => {
        // Start fetching immediately on mount
        if (!data) {
            dispatch(fetchDashboardData());
        }
    }, [dispatch, data]);

    return { data, loading, error };
};
