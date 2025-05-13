import React from 'react';
import ProjectList from '@/components/project/ProjectList';

export default function Home(): React.ReactElement {
  return (
    <main className="container mx-auto py-8">
      <ProjectList />
    </main>
  );
} 