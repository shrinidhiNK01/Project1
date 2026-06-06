export interface AgentActivity {
  agentId: string;
  name: string;
  status: string;
  logs: string[];
}

export interface BoardroomMessage {
  agent: 'AETHER-01' | 'SYNAPSE-X' | 'SENTINEL-9' | 'FLUX-CAP' | 'ADMIN';
  text: string;
  confidencePoints?: number;
  reasoningPath?: string;
  timestamp: string;
}

export interface StrategicRecommendation {
  path: 'ALPHA' | 'BETA' | 'GAMMA';
  title: string;
  probability: number;
  description: string;
}

export interface SimulationResult {
  revGrowthPercent: number;
  nodeClusteringOps: number;
  aiLatencyMs: number;
  trustRatio: number;
  riskDeltaPercent: number;
  revenueForecast: number[];
  recommendations: StrategicRecommendation[];
  timelineSimulationYear: number;
}

export interface MemoryNode {
  id: string;
  label: string;
  type: 'agent' | 'document' | 'db' | 'meeting' | 'server' | 'email' | 'task';
}

export interface MemoryLink {
  source: string;
  target: string;
  type: string;
}

export interface MemoryTimelineItem {
  id: string;
  time: string;
  event: string;
  category: 'Strategic' | 'Architecture' | 'Risk' | 'Operations' | 'Incident';
  summary: string;
}

export interface MemoryGraph {
  nodes: MemoryNode[];
  links: MemoryLink[];
}

export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'synth' | 'tool' | 'output';
  label: string;
  status: 'pending' | 'active' | 'success' | 'error';
  tokenUsage?: number;
  latency?: string;
}
