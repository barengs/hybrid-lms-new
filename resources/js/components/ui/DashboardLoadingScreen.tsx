import React from 'react';
import { DashboardLayout } from '@/components/layouts';
import { PageSkeleton } from './PageSkeleton';

export const DashboardLoadingScreen = () => (
  <DashboardLayout>
    <PageSkeleton />
  </DashboardLayout>
);
