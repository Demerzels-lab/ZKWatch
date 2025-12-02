import AgentDetailClient from './AgentDetailClient';
import { mockAgents } from '@/lib/mockData';

// Generate static params for static export
export function generateStaticParams() {
  return mockAgents.map((agent) => ({
    id: agent.id,
  }));
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  return <AgentDetailClient agentId={params.id} />;
}
