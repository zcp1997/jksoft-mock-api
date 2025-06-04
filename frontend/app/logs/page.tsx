import React from 'react';
import LogList from '@/components/log/LogList';

export default function LogsPage(): React.ReactElement {
  return (
    <main className="container mx-auto py-8">
      <LogList />
    </main>
  );
} 