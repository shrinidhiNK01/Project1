import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Cpu, 
  Database, 
  Search, 
  Briefcase, 
  History, 
  Sliders, 
  TrendingUp, 
  Terminal, 
  ChevronRight, 
  Play, 
  ArrowRight, 
  Upload, 
  Clock, 
  Network, 
  RefreshCw, 
  Send, 
  Globe, 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  GitBranch, 
  Workflow, 
  Layers,
  Heart,
  Volume2
} from "lucide-react";

import { 
  BoardroomMessage, 
  StrategicRecommendation, 
  SimulationResult, 
  MemoryNode, 
  MemoryLink, 
  MemoryTimelineItem,
  WorkflowStep
} from "./types";

export default function App() {
  // Navigation State: 'landing' | 'dashboard'
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');

  // Authentication & WebSockets clearance states
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; role: 'admin' | 'analyst' | 'viewer' } | null>(() => {
    const saved = localStorage.getItem("omnisync_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem("omnisync_token"));
  
  // Auth Form interface selectors
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authFormTab, setAuthFormTab] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authRole, setAuthRole] = useState<'admin' | 'analyst' | 'viewer'>('analyst');
  const [authError, setAuthError] = useState<string>("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string>("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);

  // WebSocket streams status monitoring states
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [wsStatusMessage, setWsStatusMessage] = useState<string>("SYSTEM_STANDBY_WAIT");
  const [wsTelemetry, setWsTelemetry] = useState<{ frequencyKhz: number; gpuTemp: number; latencyMs: number } | null>(null);

  // Authorization Warning state modal triggers
  const [authWarning, setAuthWarning] = useState<string | null>(null);
  
  // Dashboard Sub-Tabs
  const [activeTab, setActiveTab] = useState<'wf' | 'sim' | 'board' | 'kb' | 'memory'>('board');
  
  // System general variables
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [apiLogs, setApiLogs] = useState<string[]>(["[08:45:00] OMNISYNC AI Core boot active.", "[08:45:02] Synapse network synchronized with PostgreSQL layer.", "[08:45:05] Standby node ready on port 3000."]);
  const [notifications, setNotifications] = useState<string[]>([
    "Singapore node routing synchronized.",
    "Singapore data replica drift minimized to 0.04%."
  ]);

  // Shared scenario triggers (Demand, Replacement, Market Crash)
  const [selectedScenario, setSelectedScenario] = useState<string>("300% Demand Surge");
  const [yearSlider, setYearSlider] = useState<number>(2028);
  const [demandSurgeSlider, setDemandSurgeSlider] = useState<number>(300);
  const [aiReplacementSlider, setAiReplacementSlider] = useState<number>(40);
  
  // Tab-specific details
  // 1. Swarm State
  const [selectedAgent, setSelectedAgent] = useState<string>("AETHER-01");
  const [agentCommsInput, setAgentCommsInput] = useState<string>("");
  const [swarmCommsLogs, setSwarmCommsLogs] = useState<string[]>([
    "[SYSTEM] Swarm active. AETHER-01 polling sub-nodes.",
    "[AETHER-01] Execute standard validation on pipeline logs.",
    "[SYNAPSE-X] Indexing files... Completed sub-10ms query vector checks.",
    "[SENTINEL-9] Latency spikes in Frankfurt observed at 14ms. Proceeding under caution."
  ]);
  const [isSwarmThinking, setIsSwarmThinking] = useState<boolean>(false);

  // 2. Simulation Results
  const [simResults, setSimResults] = useState<SimulationResult>({
    revGrowthPercent: 142.8,
    nodeClusteringOps: 8200000,
    aiLatencyMs: 14,
    trustRatio: 0.9982,
    riskDeltaPercent: -0.04,
    revenueForecast: [42, 48, 55, 78, 62, 59, 81, 95, 110],
    recommendations: [
      {
        path: "ALPHA",
        title: "Southeast Asian Node Migration",
        probability: 0.84,
        description: "Execute automated expansion into Southeast Asian data nodes to mitigate impending European latency spikes. ROI projected at 12.4% within 48 hours."
      },
      {
        path: "BETA",
        title: "Upshift Administrative Overhead",
        probability: 0.61,
        description: "Transition 40% of administrative overhead to GenAI-04 agents. Resource reallocation estimated to save $14M in recurring costs per simulation cycle."
      },
      {
        path: "GAMMA",
        title: "Activate Capital Hedge Protocol",
        probability: 0.32,
        description: "Activate protective hedge protocols for Tier-1 markets. Defensive posturing suggested by 18% variance in market volatility signals."
      }
    ],
    timelineSimulationYear: 2028
  });
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // 3. Boardroom Debate Details
  const [corporateDebate, setCorporateDebate] = useState<BoardroomMessage[]>([
    {
      agent: "AETHER-01",
      text: "Our global scale-out target needs precise metric audits. All nodes, provide immediate state feedback.",
      confidencePoints: 95,
      reasoningPath: "ROOT -> CORE_DEBATE_ENGAGEMENT",
      timestamp: "14:02:11"
    },
    {
      agent: "SYNAPSE-X",
      text: "FastAPI gateway is currently processing 8.2M ops. LangGraph state engines show stable synchronization across Pinecone vector indices. Database schemas match standard relational parameters.",
      confidencePoints: 94,
      reasoningPath: "VEC_INDEX_DUAL -> SUB_10MS_RETRIEVAL",
      timestamp: "14:02:14"
    },
    {
      agent: "SENTINEL-9",
      text: "Warning: Frankfurt node replication delay has pulsed to 14ms. Schema sync operations are operating under security warning limit.",
      confidencePoints: 85,
      reasoningPath: "SPIKE_DETECTED -> COMPLIANCE_DRIFT_04",
      timestamp: "14:02:18"
    },
    {
      agent: "FLUX-CAP",
      text: "Flux has preemptively rerouted 25% of memory caching limits to offset safety margins. Computation rates remain optimized at 840 TFLOPS output.",
      confidencePoints: 89,
      reasoningPath: "RESOURCE_OPTIMIZE_COHORT_v4",
      timestamp: "14:02:22"
    }
  ]);
  const [boardroomOverrideInput, setBoardroomOverrideInput] = useState<string>("");
  const [isBoardroomPlanning, setIsBoardroomPlanning] = useState<boolean>(false);
  const [overallConfidence, setOverallConfidence] = useState<number>(94);
  const [overallRisk, setOverallRisk] = useState<number>(12);
  const [overallSync, setOverallSync] = useState<number>(78);
  const [computeLoad, setComputeLoad] = useState<number[]>([40, 60, 30, 80, 50, 45, 20]);

  // 4. Knowledge Engine Query
  const [kbQueryInput, setKbQueryInput] = useState<string>("Identify supply chain bottlenecks in EMEA");
  const [kbQueryResults, setKbQueryResults] = useState<string>("Semantic database query completed. Root analysis reveals a 68% risk mismatch on critical European data transitions due to delayed db schemas alignment in team B's migration pipelines.");
  const [isKbSearching, setIsKbSearching] = useState<boolean>(false);
  const [indexedDatabases, setIndexedDatabases] = useState([
    { name: "PostgreSQL Central Cluster", size: "4.2 TB", status: "SYNCED" },
    { name: "Pinecone Vector Store", size: "820M Vectors", status: "REALTIME" },
    { name: "S3 Enterprise PDF Bucket", size: "12,450 Files", status: "INDEXED" },
  ]);
  const [knowledgeGraph, setKnowledgeGraph] = useState<{ nodes: MemoryNode[], links: MemoryLink[] }>({
    nodes: [
      { id: "1", label: "Global_Logistics_v4", type: "document" },
      { id: "2", label: "Frankfurt_Gateway_Spike", type: "server" },
      { id: "3", label: "Team_B_Database_Sync", type: "db" },
      { id: "4", label: "Q3_Risk_Debate", type: "meeting" }
    ],
    links: [
      { source: "1", target: "2", type: "triggers" },
      { source: "2", target: "3", type: "caused_by" },
      { source: "3", target: "4", type: "reviewed_in" }
    ]
  });

  // 5. Memory Timeline Retrieval
  const [memorySearchText, setMemorySearchText] = useState<string>("");
  const [isMemoryRecalling, setIsMemoryRecalling] = useState<boolean>(false);
  const [memoryTimeline, setMemoryTimeline] = useState<MemoryTimelineItem[]>([
    {
      id: "ev1",
      time: "2026-01-15T10:30:00Z",
      event: "Project Titan Framework Initialization",
      category: "Strategic",
      summary: "Strategic goals established. AI executives mapped workflow auto-balancing rules to secure delivery pipelines."
    },
    {
      id: "ev2",
      time: "2026-03-04T16:45:12Z",
      event: "Relational PostgreSQL Migration",
      category: "Architecture",
      summary: "Synapse-X synchronized legacy files directly into PostgreSQL databases with zero downtime during peak load."
    },
    {
      id: "ev3",
      time: "2026-05-18T14:12:00Z",
      event: "Frankfurt Replication Lag",
      category: "Incident",
      summary: "Primary Frankfurt instances lagged due to cross-continental schema variations in database migration dependencies."
    },
    {
      id: "ev4",
      time: "2026-06-02T09:00:00Z",
      event: "AI Executive Overrule deployed",
      category: "Operations",
      summary: "Boardroom Core overrode standard cache routes and deployed Protocol Alpha to secure transactional latency stability."
    }
  ]);

  // 6. Visual Workflow pipeline simulation helper
  const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'success'>('idle');
  const [pipelineSteps, setPipelineSteps] = useState<WorkflowStep[]>([
    { id: "web_hook", type: "trigger", label: "Inbound Hook Trigger", status: "pending" },
    { id: "multi_agent_synth", type: "synth", label: "Multi-Agent Swarm Reasoning", status: "pending" },
    { id: "db_upsert", type: "tool", label: "PostgreSQL Schema Upsert", status: "pending" },
    { id: "terminal_output", type: "output", label: "Audit Alert Log Dispatch", status: "pending" }
  ]);
  const [activeLogStep, setActiveLogStep] = useState<string>("Ready for orchestration trigger");

  // Ref for automated log scrolling
  const debateEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll effects
  useEffect(() => {
    debateEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [corporateDebate]);

  // WebSocket Live Sync Stream Connection Hook
  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
    
    console.log(`[WEBSOCKET] Bootstrapping real-time server bridge to ${wsUrl}`);
    let socket: WebSocket;
    
    try {
      socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setWsConnected(true);
        setWsStatusMessage("SYNCED_OK");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "handshake") {
            setWsStatusMessage("SYNCED_OK");
            setApiLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SOCKET_HANDSHAKE: Handshake verified over WebSockets.`]);
          } else if (payload.type === "telemetry") {
            setWsTelemetry({
              frequencyKhz: payload.frequencyKhz,
              gpuTemp: payload.gpuTemp,
              latencyMs: payload.latencyMs
            });
          } else if (payload.type === "chat_receive") {
            // Echoed live messages get formatted into Swarm lines!
            setSwarmCommsLogs(prev => [
              ...prev,
              `[LIVE_BROADCAST] [${payload.agent}] ${payload.text}`
            ]);
          }
        } catch (err) {
          console.error("Failed to decode JSON packet:", err);
        }
      };

      socket.onclose = () => {
        setWsConnected(false);
        setWsStatusMessage("CONN_OFFLINE");
      };

      setWebSocket(socket);
    } catch (err) {
      console.error("[WEBSOCKET] Client failed connecting:", err);
      setWsConnected(false);
      setWsStatusMessage("CONN_FAIL");
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Broadcast messages through active WebSocket link
  const broadcastWebSocketMessage = (text: string) => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN && currentUser) {
      webSocket.send(JSON.stringify({
        type: "chat_broadcast",
        agent: currentUser.name.toUpperCase(),
        text: text
      }));
    }
  };

  // Directory Auth Registration & Verification Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMsg("");
    setIsAuthSubmitting(true);

    const isRegister = authFormTab === 'signup';
    const url = isRegister ? "/api/auth/register" : "/api/auth/login";
    const bodyPayload = isRegister 
      ? { email: authEmail, password: authPassword, name: authName, role: authRole }
      : { email: authEmail, password: authPassword };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Execution routine failed.");
      }

      // Save credentials session
      localStorage.setItem("omnisync_user", JSON.stringify(data.user));
      localStorage.setItem("omnisync_token", data.token);
      setCurrentUser(data.user);
      setAuthToken(data.token);
      setAuthSuccessMsg(isRegister ? "Security directory record created. Agent active." : "Security token verified. Access approved.");
      
      setApiLogs(prev => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] AUTH_SYNC: ${data.user.name} online with ${data.user.role.toUpperCase()} privileges.`
      ]);

      setTimeout(() => {
        setShowAuthModal(false);
        setAuthEmail("");
        setAuthPassword("");
        setAuthName("");
        if (viewMode === 'landing') {
          setViewMode('dashboard');
        }
      }, 1200);
    } catch (err: any) {
      setAuthError(err.message || "Credential screening blocked.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("omnisync_user");
    localStorage.removeItem("omnisync_token");
    setCurrentUser(null);
    setAuthToken(null);
    setApiLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] AUTH_SYNC: Secure security session closed.`]);
  };

  // Helper authorization validator
  const checkHasPermission = (requiredRole: 'admin' | 'analyst'): boolean => {
    if (!currentUser) {
      setAuthWarning("AUTHENTICATION REQUIRED: Please Sign In to access these security configurations.");
      return false;
    }
    
    // Viewer is read-only
    if (currentUser.role === 'viewer') {
      setAuthWarning(`AUTHORIZATION DENIED: Clearance [VIEWER] is insufficient. Required: [${requiredRole.toUpperCase()}].`);
      return false;
    }

    if (requiredRole === 'admin' && currentUser.role !== 'admin') {
      setAuthWarning("AUTHORIZATION DENIED: Executive directive overrides require [ADMIN] root credentials.");
      return false;
    }

    return true;
  };

  // Background random logs pulse to simulate a live server network
  useEffect(() => {
    const logInterval = setInterval(() => {
      const pingNodes = ["Frankfurt_N04", "Singapore_Edge_A2", "Silicon_Valley_Main", "US_East_Drizzle"];
      const statuses = ["RESOLVED", "SECURE", "QUERY_COMPLETED", "ROUTING_STABLE"];
      const randomNode = pingNodes[Math.floor(Math.random() * pingNodes.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const timestamp = new Date().toLocaleTimeString();
      
      setApiLogs(prev => {
        const next = [...prev, `[${timestamp}] NODE_HEURISTIC: ${randomNode} check ${randomStatus}.`];
        if (next.length > 30) next.shift();
        return next;
      });
    }, 4500);

    return () => clearInterval(logInterval);
  }, []);

  // Update simulation parameters based on Year & triggers changes dynamically
  useEffect(() => {
    // Dynamically calculate fake numbers reflecting changes in configuration sliders
    const scaleFactor = (demandSurgeSlider / 100) * (1 + (yearSlider - 2024) * 0.02);
    const replacementDiscount = (aiReplacementSlider / 100) * 0.4;
    
    setSimResults(prev => {
      const calculatedRevGrowth = Number((142.8 * scaleFactor * (1 - replacementDiscount)).toFixed(1));
      const calculatedOps = Math.floor(8200000 * scaleFactor);
      const calculatedLatency = Math.max(4, Math.floor(14 * scaleFactor * (1 - (aiReplacementSlider / 100) * 0.3)));
      const calculatedRisk = Number((-0.04 + (demandSurgeSlider > 350 ? 2.5 : -1.2)).toFixed(2));
      
      // Scale forecast graph
      const originalForecast = [42, 48, 55, 78, 62, 59, 81, 95, 110];
      const scaledForecast = originalForecast.map(v => Math.max(5, Math.floor(v * scaleFactor * (1 - replacementDiscount * 0.5))));

      return {
        ...prev,
        revGrowthPercent: calculatedRevGrowth,
        nodeClusteringOps: calculatedOps,
        aiLatencyMs: calculatedLatency,
        riskDeltaPercent: calculatedRisk,
        revenueForecast: scaledForecast
      };
    });
  }, [yearSlider, demandSurgeSlider, aiReplacementSlider]);

  // SCENARIO ACTION BUTTON TRIGGER
  const triggerSimulationScenario = async (scenarioName: string, demandMultiplier: number, replacementRate: number) => {
    if (!checkHasPermission('analyst')) return;
    setSelectedScenario(scenarioName);
    setDemandSurgeSlider(demandMultiplier);
    setAiReplacementSlider(replacementRate);
    setIsSimulating(true);

    try {
      const response = await fetch("/api/gemini/simulate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioName })
      });
      const data = await response.json();
      setIsSimulated(data.isSimulated);
      setSimResults(data);
      
      // Log event
      setApiLogs(prev => [...prev, `[SYSTEM] Simulation Engine generated strategic response for: ${scenarioName}`]);
    } catch (err) {
      console.warn("Backend API not reachable, running programmatic simulation sync.");
    } finally {
      setIsSimulating(false);
    }
  };

  // MULTI-AGENT SWARM COGNITIVE INQUIRY
  const handleSwarmCommsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentCommsInput.trim()) return;

    const userMsg = agentCommsInput;
    setAgentCommsInput("");
    setSwarmCommsLogs(prev => [
      ...prev,
      `[HUMAN_OVERRIDE] ${userMsg}`
    ]);
    setIsSwarmThinking(true);

    try {
      // Direct inquiry to semantic knowledge matching
      const response = await fetch("/api/gemini/memory-recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg })
      });
      const data = await response.json();
      setIsSimulated(data.isSimulated);
      
      // Assemble response timeline or findings
      setTimeout(() => {
        setSwarmCommsLogs(prev => [
          ...prev,
          `[OMNISYNC_BRAIN] Recall matching vector node structure: ${data.findings}`,
          `[SYNAPSE-X] Relational schema indexed ${data.nodes?.length || 0} entities linked directly to standard security parameters.`
        ]);
        setIsSwarmThinking(false);
      }, 1500);

    } catch (err) {
      setTimeout(() => {
        setSwarmCommsLogs(prev => [
          ...prev,
          `[OMNISYNC_BRAIN] Simulated callback: Evaluated parameters for "${userMsg}". Swarm resolved execution sequence with active status code 200.`
        ]);
        setIsSwarmThinking(false);
      }, 1200);
    }
  };

  // KNOWLEDGE VECTOR INDEXING QUERY
  const handleKbQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbQueryInput.trim()) return;
    if (!checkHasPermission('analyst')) return;

    setIsKbSearching(true);
    try {
      const response = await fetch("/api/gemini/memory-recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: kbQueryInput })
      });
      const data = await response.json();
      
      setKbQueryResults(data.findings);
      
      if (data.nodes && data.nodes.length > 0) {
        setKnowledgeGraph({
          nodes: data.nodes,
          links: data.links || []
        });
      }
    } catch (err) {
      console.warn("Falling back to programmatic query indexing.");
    } finally {
      setIsKbSearching(false);
    }
  };

  // BOARDROOM STRATEGIC EXECUTIVE OVERRIDE DEBATE STREAM
  const handleInjectBoardroomOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardroomOverrideInput.trim()) return;
    if (!checkHasPermission('admin')) return;

    const overridePrompt = boardroomOverrideInput;
    setBoardroomOverrideInput("");
    
    // Broadcast via socket so other simulated monitors capture it
    broadcastWebSocketMessage(overridePrompt);
    
    // Add user message immediately
    const userMsg: BoardroomMessage = {
      agent: "ADMIN",
      text: overridePrompt,
      timestamp: new Date().toLocaleTimeString().substring(0, 5)
    };
    
    setCorporateDebate(prev => [...prev, userMsg]);
    setIsBoardroomPlanning(true);

    try {
      const response = await fetch("/api/gemini/boardroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: overridePrompt })
      });
      const data = await response.json();
      
      setIsSimulated(data.isSimulated);
      setOverallConfidence(data.confidenceScore || 94);
      setOverallRisk(data.riskFactor || 12);
      setOverallSync(data.resourceSync || 78);
      
      // Insert debate turns with short delays to look highly authentic
      if (data.debate && data.debate.length > 0) {
        let i = 0;
        const interval = setInterval(() => {
          if (i < data.debate.length) {
            const turn = data.debate[i];
            const msg: BoardroomMessage = {
              agent: turn.agent,
              text: turn.text,
              confidencePoints: turn.confidencePoints || 90,
              reasoningPath: turn.reasoningPath || "DYNAMIC_REASONING_NODE",
              timestamp: new Date().toLocaleTimeString().substring(0, 5)
            };
            setCorporateDebate(prev => [...prev, msg]);
            
            // Randomize compute graph loads as they discuss
            setComputeLoad(Array.from({ length: 7 }, () => Math.floor(Math.random() * 80) + 20));

            i++;
          } else {
            clearInterval(interval);
            setIsBoardroomPlanning(false);
          }
        }, 1500);
      } else {
        setIsBoardroomPlanning(false);
      }

    } catch (err) {
      console.error("Boardroom override failed, firing simulation backup replies.", err);
      setTimeout(() => {
        const fallbacks: BoardroomMessage[] = [
          {
            agent: "AETHER-01",
            text: `Executive order received: "${overridePrompt}". We are deploying defensive Protocol Alpha immediately and prioritizing structural asset protection.`,
            confidencePoints: 94,
            reasoningPath: "COGNITIVE_SHIELD -> MANUAL_OVERRIDE_ALIGN",
            timestamp: new Date().toLocaleTimeString().substring(0, 5)
          },
          {
            agent: "SYNAPSE-X",
            text: "Synapse-X acknowledges override. Relational schemas are locked down in read-only standby states. Rerouting all secondary LangGraph task agents to local encrypted clusters.",
            confidencePoints: 91,
            reasoningPath: "STANDBY_MODE_DEPLOYED -> SECURE_ISOLATION",
            timestamp: new Date().toLocaleTimeString().substring(0, 5)
          }
        ];
        
        setCorporateDebate(prev => [...prev, ...fallbacks]);
        setOverallConfidence(88);
        setOverallRisk(34);
        setOverallSync(92);
        setIsBoardroomPlanning(false);
      }, 1200);
    }
  };

  // MEMORY TIMELINE TRAVERSAL SEARCH
  const triggerMemorySearch = async () => {
    if (!memorySearchText.trim()) return;
    setIsMemoryRecalling(true);

    try {
      const response = await fetch("/api/gemini/memory-recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: memorySearchText })
      });
      const data = await response.json();
      
      if (data.timeline && data.timeline.length > 0) {
        setMemoryTimeline(data.timeline);
      }
    } catch (err) {
      console.warn("Fallback query sorting on timeline files.");
    } finally {
      setIsMemoryRecalling(false);
    }
  };

  // RECONSTRUCT ORCHESTRATOR PIPELINE (Visual Animation)
  const executeOrchestratorPipeline = () => {
    if (pipelineState === 'running') return;
    
    setPipelineState('running');
    setActiveLogStep("Trigger received. Initializing API Webhook authentication...");
    
    // Reset steps
    setPipelineSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));

    // Step 1: Trigger active
    setTimeout(() => {
      setPipelineSteps(prev => prev.map((s, idx) => idx === 0 ? { ...s, status: 'active' } : s));
      setActiveLogStep("Webhook Verified [200 OK]. Dispatching context metadata to Multi-Agent swarm...");
    }, 1000);

    // Step 2: Agent reasoning logic active
    setTimeout(() => {
      setPipelineSteps(prev => prev.map((s, idx) => {
        if (idx === 0) return { ...s, status: 'success', tokenUsage: 250, latency: '190ms' };
        if (idx === 1) return { ...s, status: 'active' };
        return s;
      }));
      setActiveLogStep("Multi-Agent swarm active. Translating natural language prompt into database Drizzle schema directives...");
    }, 2500);

    // Step 3: Database action active
    setTimeout(() => {
      setPipelineSteps(prev => prev.map((s, idx) => {
        if (idx === 1) return { ...s, status: 'success', tokenUsage: 640, latency: '410ms' };
        if (idx === 2) return { ...s, status: 'active' };
        return s;
      }));
      setActiveLogStep("Executing Drizzle-ORM migration pipeline. Postgres relational transaction cluster secured.");
    }, 4500);

    // Step 4: Dispatch output logs
    setTimeout(() => {
      setPipelineSteps(prev => prev.map((s, idx) => {
        if (idx === 2) return { ...s, status: 'success', tokenUsage: 80, latency: '120ms' };
        if (idx === 3) return { ...s, status: 'active' };
        return s;
      }));
      setActiveLogStep("Audit alert successfully marshalled to Discord, Slack, and cloud storage systems.");
    }, 6200);

    // Done
    setTimeout(() => {
      setPipelineSteps(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: 'success', tokenUsage: 20, latency: "45ms" } : s));
      setPipelineState('success');
      setActiveLogStep("Distributed orchestration routine completed. Sync level 100% stable.");
      
      setApiLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ORCHESTRATION_PIPELINE: Executed successfully in 7.1 seconds`]);
    }, 7500);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen relative font-sans overflow-x-hidden selection:bg-brand-cyan/30 text-on-surface bg-[#03060a] flex items-center justify-center p-4">
        {/* Dynamic Grid Background with Shift Animation */}
        <div className="fixed inset-0 select-none pointer-events-none z-0 opacity-15 high-tech-grid animate-grid-shift"></div>
        {/* Glows */}
        <div className="fixed -top-40 -left-40 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[160px] pointer-events-none"></div>
        <div className="fixed bottom-10 right-10 w-96 h-96 bg-brand-purple/10 rounded-full blur-[160px] pointer-events-none"></div>
        <div className="fixed inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-brand-cyan/25 to-transparent pointer-events-none animate-scanline z-50"></div>

        <div className="relative z-10 max-w-md w-full space-y-6">
          {/* Locked System Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 font-mono text-[10px] uppercase tracking-wider animate-pulse mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>OMNISYNC SECURE LOCK ENFORCED</span>
            </div>
            
            <h1 className="font-display font-black text-4xl tracking-tight text-white uppercase text-glow-cyan">
              OMNISYNC AI
            </h1>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
              ENTER OPERATOR SECURITY GATE // CLEARANCE VERIFIED PROTOCOL
            </p>
          </div>

          {/* Secure Form Panel */}
          <div className="glass-panel rounded-2xl border-2 border-brand-cyan/20 bg-[#06090d] shadow-[0_0_50px_rgba(0,242,255,0.12)] overflow-hidden">
            {/* Form switcher tabs */}
            <div className="flex border-b border-white/5 font-mono text-[10px] font-bold">
              <button 
                type="button"
                onClick={() => {
                  setAuthFormTab('signin');
                  setAuthError("");
                  setAuthSuccessMsg("");
                }}
                className={`flex-1 py-3 text-center cursor-pointer transition-colors uppercase tracking-wider ${authFormTab === 'signin' ? 'bg-brand-cyan/10 text-brand-cyan border-b-2 border-brand-cyan' : 'text-zinc-500 hover:text-white'}`}
              >
                Sign In Credentials
              </button>
              <button 
                type="button"
                onClick={() => {
                  setAuthFormTab('signup');
                  setAuthError("");
                  setAuthSuccessMsg("");
                }}
                className={`flex-1 py-3 text-center cursor-pointer transition-colors uppercase tracking-wider ${authFormTab === 'signup' ? 'bg-brand-cyan/10 text-brand-cyan border-b-2 border-brand-cyan' : 'text-zinc-500 hover:text-white'}`}
              >
                Register New Agent
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              <h3 className="font-display font-semibold text-xs text-zinc-300 uppercase tracking-wider text-center">
                {authFormTab === 'signin' ? 'VERIFY DECRYPTION KEYPAIR' : 'CREATE OPERATIONAL DOSSIER'}
              </h3>

              {authFormTab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-brand-cyan-dim">Agent Call Sign (Full Name)</label>
                  <input 
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Dr. Alexis Synapse"
                    className="w-full bg-black/60 border border-brand-cyan/20 rounded px-3 py-2 text-sm text-brand-cyan placeholder:text-zinc-700 font-mono focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-brand-cyan-dim">Operational Email</label>
                <input 
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="agent@omnisync.ai"
                  className="w-full bg-black/60 border border-brand-cyan/20 rounded px-3 py-2 text-sm text-brand-cyan placeholder:text-zinc-700 font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-brand-cyan-dim">Security Passphrase</label>
                <input 
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/60 border border-brand-cyan/20 rounded px-3 py-2 text-sm text-[#74f5ff] placeholder:text-zinc-700 font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {authFormTab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-brand-cyan-dim">Authorization Class (Clearance level)</label>
                  <select 
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value as 'admin' | 'analyst' | 'viewer')}
                    className="w-full bg-black/80 border border-brand-cyan/20 rounded px-3 py-2 text-sm text-brand-cyan font-mono focus:outline-none focus:border-brand-cyan text-white"
                  >
                    <option value="admin" className="bg-zinc-950 text-white">ADMINISTRATOR (Executive Overrides)</option>
                    <option value="analyst" className="bg-zinc-950 text-white">ANALYST (Simulation Controllers)</option>
                    <option value="viewer" className="bg-zinc-950 text-white">VIEWER (Observe Raw Telemetries)</option>
                  </select>
                </div>
              )}

              {authError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-2.5 text-xs text-red-400 font-mono leading-normal">
                  ERROR_CODE_0x04: {authError}
                </div>
              )}

              {authSuccessMsg && (
                <div className="bg-green-500/10 border border-green-500/30 rounded p-2.5 text-xs text-green-400 font-mono leading-normal">
                  HANDSHAKE_SECURE: {authSuccessMsg}
                </div>
              )}

              <button 
                type="submit"
                disabled={isAuthSubmitting}
                className="w-full py-2.5 rounded bg-brand-cyan text-black hover:bg-opacity-80 transition-colors font-mono text-xs uppercase font-bold cursor-pointer disabled:opacity-40 shadow-[0_0_15px_rgba(0,242,255,0.2)]"
              >
                {isAuthSubmitting ? 'Authenticating System...' : authFormTab === 'signin' ? 'Verify Credentials' : 'Instantiate Agent Desk'}
              </button>
            </form>

            {/* Quick Demo Access Credentials Reference */}
            {authFormTab === 'signin' && (
              <div className="p-4 bg-black/50 border-t border-white/5 font-mono text-[9px] text-[#74f5ff]/60 leading-relaxed space-y-1">
                <span className="block font-bold text-[#74f5ff] uppercase mb-0.5">Quick Demo Access Keys:</span>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Email: <strong className="text-white">admin@omnisync.ai</strong></span>
                  <span>Pass: <strong className="text-white font-mono">admin123</strong></span>
                  <span className="text-amber-400 font-bold">(ADMIN)</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span>Email: <strong className="text-white">analyst@omnisync.ai</strong></span>
                  <span>Pass: <strong className="text-white font-mono font-bold">analyst123</strong></span>
                  <span className="text-brand-purple font-bold">(ANALYST)</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <span className="text-zinc-600 font-mono text-[9px] tracking-widest uppercase block">
              Omnisync High-Performance Relational Datastores Protected
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden selection:bg-brand-cyan/30 text-on-surface">
      {/* Dynamic Grid Background with Shift Animation */}
      <div className="fixed inset-0 select-none pointer-events-none z-0 opacity-15 high-tech-grid animate-grid-shift"></div>
      
      {/* Cyan/Blue futuristic background glow overlays */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-brand-purple/10 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Futuristic Scanline hologram effect */}
      <div className="fixed inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-brand-cyan/20 to-transparent pointer-events-none animate-scanline z-50"></div>

      {/* Header Panel */}
      <header className="sticky top-0 w-full glass-panel border-b border-[#74f5ff]/10 backdrop-blur-xl flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 z-50">
        <div 
          onClick={() => setViewMode('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-8 h-8 rounded-lg bg-brand-cyan/20 border border-brand-cyan/50 flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-brand-cyan text-glow-cyan text-lg animate-pulse">hub</span>
          </div>
          <span className="font-display font-black text-xl tracking-tight text-brand-cyan text-glow-cyan uppercase transition-all group-hover:tracking-widest">
            OMNISYNC AI
          </span>
        </div>

        {viewMode === 'dashboard' && (
          <nav className="hidden lg:flex items-center gap-8 text-label-sm font-label-sm">
            <button 
              onClick={() => setActiveTab('wf')} 
              className={`py-1 cursor-pointer transition-colors ${activeTab === 'wf' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-on-surface-variant hover:text-white'}`}
            >
              WORKFORCE SWARM
            </button>
            <button 
              onClick={() => setActiveTab('kb')} 
              className={`py-1 cursor-pointer transition-colors ${activeTab === 'kb' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-on-surface-variant hover:text-white'}`}
            >
              KNOWLEDGE GRAPH
            </button>
            <button 
              onClick={() => setActiveTab('board')} 
              className={`py-1 cursor-pointer transition-colors ${activeTab === 'board' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-on-surface-variant hover:text-white'}`}
            >
              AI BOARDROOM
            </button>
            <button 
              onClick={() => setActiveTab('sim')} 
              className={`py-1 cursor-pointer transition-colors ${activeTab === 'sim' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-on-surface-variant hover:text-white'}`}
            >
              DECISION DECK
            </button>
            <button 
              onClick={() => setActiveTab('memory')} 
              className={`py-1 cursor-pointer transition-colors ${activeTab === 'memory' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-on-surface-variant hover:text-white'}`}
            >
              MEMORY SEARCH
            </button>
          </nav>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {/* Real-Time WebSocket Telemetry Node */}
          <div className="flex items-center gap-2 font-mono text-[10px] bg-black/40 px-3 py-1.5 rounded border border-[#74f5ff]/20">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-500'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${wsConnected ? 'bg-green-400' : 'bg-red-500'}`}></span>
            </span>
            <span className={wsConnected ? 'text-green-400 font-bold' : 'text-red-400'}>
              WS_{wsStatusMessage}
            </span>
            {wsConnected && wsTelemetry && (
              <span className="hidden md:inline text-on-surface-variant border-l border-white/10 pl-2 ml-1">
                {wsTelemetry.latencyMs}ms // {wsTelemetry.gpuTemp}°C // {wsTelemetry.frequencyKhz}kHz
              </span>
            )}
          </div>

          {/* Current Authorization Clearance Badge */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[10px] font-bold border uppercase ${
                currentUser.role === 'admin' 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 text-glow-amber' 
                  : currentUser.role === 'analyst' 
                    ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/40 text-glow-purple' 
                    : 'bg-white/5 text-on-surface-variant border-white/20'
              }`}>
                <span>{currentUser.name} ({currentUser.role})</span>
              </div>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/30 hover:bg-red-500/25 transition-all text-red-400 font-mono text-[10px] font-bold uppercase cursor-pointer"
                title="Disconnect Account Clearance"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800">
                <span>GUEST_VIEWER</span>
              </div>
              <button 
                onClick={() => {
                  setAuthFormTab('signin');
                  setShowAuthModal(true);
                }}
                className="px-3.5 py-1.5 rounded bg-brand-cyan text-black hover:bg-opacity-80 transition-all font-mono text-[10px] font-bold uppercase cursor-pointer"
              >
                Sign In / Up
              </button>
            </div>
          )}

          <button 
            onClick={() => {
              if (viewMode === 'landing') setViewMode('dashboard');
              else setViewMode('landing');
            }}
            className="px-3 py-1.5 rounded bg-brand-cyan/15 border border-brand-cyan/40 hover:bg-brand-cyan/25 transition-all text-brand-cyan hover:glow-border font-mono text-[10px] font-bold uppercase whitespace-nowrap cursor-pointer"
          >
            {viewMode === 'landing' ? 'ENTER DASHBOARD' : 'TERMINAL SHIELD'}
          </button>
        </div>
      </header>

      {/* App views container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 min-h-[calc(100vh-80px)]">
        
        {/* ======================================================= */}
        {/* VIEW 1: LANDING PAGE                                    */}
        {/* ======================================================= */}
        {viewMode === 'landing' && (
          <div className="flex flex-col items-center">
            {/* Cinematic Hero */}
            <div className="text-center max-w-3xl pt-12 md:pt-20 pb-8 relative">
              <div className="scan-line"></div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-purple/10 border border-brand-purple/30 rounded-full text-brand-purple font-mono text-xs tracking-wider uppercase mb-6 animate-pulse-slow">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autonomous Enterprise AGI Ecosystem</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-white mb-6 uppercase leading-[1.05]">
                The Autonomous <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple text-glow-cyan">
                  AI Workforce
                </span> <br />
                For Modern Enterprises
              </h1>

              <p className="font-sans text-on-surface-variant font-light text-base sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
                Transform your organization into a self-learning, self-optimizing intelligence network. Coordinate multiple specialized agents to automate workflows, retrieve records, simulate future trajectories, and draft policies.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                <button 
                  onClick={() => {
                    setViewMode('dashboard');
                    setActiveTab('board');
                  }}
                  className="px-8 py-3.5 bg-brand-cyan text-black font-semibold text-sm hover:scale-[1.03] transition-transform flex items-center gap-2 tracking-wider uppercase shadow-[0_0_20px_rgba(0,242,255,0.4)] cursor-pointer"
                >
                  <span>Launch AI Network</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setViewMode('dashboard');
                    setActiveTab('sim');
                  }}
                  className="px-8 py-3.5 bg-transparent border border-brand-cyan/40 text-brand-cyan font-semibold text-sm hover:bg-brand-cyan/10 transition-all flex items-center gap-2 tracking-wider uppercase cursor-pointer"
                >
                  <span>View Simulation</span>
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Glowing Interactive Core Visualizer */}
            <div className="w-full max-w-xl mx-auto py-12 flex flex-col items-center">
              <div className="relative w-64 h-64 flex items-center justify-center glass-panel rounded-full border border-brand-cyan/20 cursor-pointer group hover:scale-[1.01] transition-all">
                {/* Hologram rings */}
                <div className="absolute inset-2 border border-dashed border-brand-purple/20 rounded-full animate-[spin_30s_linear_infinite]"></div>
                <div className="absolute inset-4 border border-brand-cyan/15 rounded-full animate-[spin_10s_linear_infinite_reverse]"></div>
                
                {/* Central Core Sphere */}
                <div className="absolute w-24 h-24 bg-gradient-to-tr from-brand-cyan to-brand-purple rounded-full mix-blend-screen opacity-70 blur-[15px] animate-pulse"></div>
                
                <div className="relative z-10 text-center flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-4xl text-brand-cyan animate-spin duration-10000" style={{ fontVariationSettings: "'FILL' 1" }}>
                    token
                  </span>
                  <span className="font-mono text-[9px] text-brand-cyan tracking-[0.3em]">AGI_ONLINE</span>
                </div>
              </div>
              <p className="text-xs font-mono text-on-surface-variant mt-4 uppercase tracking-[0.2em]">Click outer core boundaries to align telemetry</p>
            </div>

            {/* Futuristic Stats Panel */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-gutter my-8">
              <div className="glass-panel p-6 rounded-xl border border-brand-cyan/10 text-center relative group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-brand-cyan/10 border border-brand-cyan/30 rounded font-mono text-[9px] text-brand-cyan text-glow-cyan uppercase">Decisions</div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white mt-2 group-hover:text-brand-cyan transition-colors">12M+</div>
                <div className="text-xs text-on-surface-variant font-light mt-1">Autonomous Workflows</div>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-brand-cyan/10 text-center relative group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-brand-purple/10 border border-brand-purple/30 rounded font-mono text-[9px] text-brand-purple text-glow-purple uppercase">Optimize</div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white mt-2 group-hover:text-brand-purple transition-colors">94%</div>
                <div className="text-xs text-on-surface-variant font-light mt-1">Labor Efficiency Gains</div>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-brand-cyan/10 text-center relative group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-brand-cyan/10 border border-brand-cyan/30 rounded font-mono text-[9px] text-brand-cyan text-glow-cyan uppercase">Agents</div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white mt-2 group-hover:text-brand-cyan transition-colors">5,000+</div>
                <div className="text-xs text-on-surface-variant font-light mt-1">Synchronized Cooperatives</div>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-brand-cyan/10 text-center relative group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-brand-purple/10 border border-brand-purple/30 rounded font-mono text-[9px] text-brand-purple text-glow-purple uppercase">Network</div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white mt-2 group-hover:text-brand-purple transition-colors">Real-Time</div>
                <div className="text-xs text-on-surface-variant font-light mt-1">Drizzle-Postgres Audits</div>
              </div>
            </div>

            {/* Immersive Platform Architecture Diagram Component */}
            <div className="w-full glass-panel rounded-2xl border border-brand-cyan/15 p-6 md:p-8 my-10 bg-gradient-to-b from-[#0d1515]/80 to-transparent">
              <h3 className="font-display text-white text-xl md:text-2xl font-bold uppercase mb-4 tracking-tight">
                Architectural Framework // Intelligence Network Ecosystem
              </h3>
              <p className="text-sm text-on-surface-variant mb-8 max-w-2xl font-light">
                OMNISYNC leverages hierarchical agent state systems powered by LangGraph, secure vector embeddings pipelines, and highly responsive Express + PostgreSQL persistence maps to govern operations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 text-xs">
                {/* Column 1 */}
                <div className="glass-panel p-4 rounded bg-[#0d1515]/60 border-l-2 border-brand-cyan">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-brand-cyan" />
                    <span className="font-mono text-white text-sm font-bold uppercase">Relational Pipeline</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    PostgreSQL storage using strict Drizzle mapping interfaces. Tracks operational data structures, file indices, and historical ledger updates safely.
                  </p>
                </div>
                {/* Column 2 */}
                <div className="glass-panel p-4 rounded bg-[#0d1515]/60 border-l-2 border-brand-purple">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-brand-purple" />
                    <span className="font-mono text-white text-sm font-bold uppercase">Agent Orchestration</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    LangGraph multi-agent coordination system. Isolates and schedules operations for specialized domains (Research, strategy, accounting, security).
                  </p>
                </div>
                {/* Column 3 */}
                <div className="glass-panel p-4 rounded bg-[#0d1515]/60 border-l-2 border-brand-cyan">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-brand-cyan" />
                    <span className="font-mono text-white text-sm font-bold uppercase">Semantic Index</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    Dual vector-embedding indexing pipelines. Serves real-time information query retrievals and file context lookups under sub-10ms rates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 2: OPERATIONS CONTROL CENTER                        */}
        {/* ======================================================= */}
        {viewMode === 'dashboard' && (
          <div className="grid grid-cols-12 gap-6 relative z-10 h-full">

            {/* Sidebar Controller (Hidden on Small screens, styled premium glassmorphism) */}
            <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
              {/* System core state */}
              <div className="glass-panel rounded-2xl p-6 border-t-2 border-brand-cyan/20 bg-[#0d1515]/40 backdrop-blur-xl">
                <div className="font-mono text-[9px] text-brand-cyan tracking-widest uppercase mb-1 flex items-center justify-between">
                  <span>OMNISYNC NETWORK</span>
                  <span className="animate-pulse font-bold text-glow-cyan">● ONLINE</span>
                </div>
                <h3 className="font-display font-black text-xl text-white uppercase mb-2 tracking-tight">SYSTEM HEALTH</h3>

                <div className="space-y-4 my-4">
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-on-surface-variant mb-1">
                      <span>COGNITIVE SWARM DATA</span>
                      <span className="text-brand-cyan">99.8% STABLE</span>
                    </div>
                    <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-brand-cyan w-[99%] text-glow-cyan shadow-[0_0_8px_#00f2ff]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-on-surface-variant mb-1">
                      <span>VECTOR DATA ENTROPY</span>
                      <span className="text-brand-purple">0.0024 OK</span>
                    </div>
                    <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-brand-purple w-[88%] shadow-[0_0_8px_#9d05ff]"></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 p-3 bg-white/5 rounded border border-white/10 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="opacity-60">Frankfurt Ping:</span>
                    <span className="text-brand-cyan">14ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Singapore Latency:</span>
                    <span className="text-brand-cyan">28ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">DB Schema Validation:</span>
                    <span className="text-brand-green">SUCCESSFUL</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Notification log */}
              <div className="glass-panel rounded-2xl p-4 flex-grow flex flex-col h-64 lg:h-auto overflow-hidden bg-[#0d1515]/40 backdrop-blur-xl">
                <div className="font-mono text-[10px] text-brand-cyan tracking-wider mb-2 uppercase flex items-center justify-between">
                  <span>NETWORK ALERTS</span>
                  <Activity className="w-3.5 h-3.5 animate-pulse text-brand-cyan" />
                </div>
                
                <div className="flex-grow overflow-y-auto space-y-2.5 font-mono text-[10px] scroll-smooth pr-1 custom-scrollbar" ref={logsEndRef}>
                  {apiLogs.map((log, index) => (
                    <div key={index} className="text-on-surface-variant border-b border-white/5 pb-1">
                      <span className="opacity-40">:: </span>
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>

              {/* App Status Indicator */}
              <div className="p-3 bg-brand-cyan/15 border border-brand-cyan/30 rounded-lg text-xs leading-snug">
                <span className="font-bold text-brand-cyan">Hologram View Layer:</span> Integrated server proxies and fallback mocks are online. All Gemini responses process strictly server-side.
              </div>
            </aside>

            {/* Main Interactive Deck */}
            <main className="col-span-12 lg:col-span-9 flex flex-col gap-6">
              
              {/* Responsive Navigation Tab controls on Mobile */}
              <div className="flex lg:hidden bg-surface-container-lowest border border-white/10 p-1.5 rounded-lg overflow-x-auto gap-2 text-xs font-mono custom-scrollbar">
                <button 
                  onClick={() => setActiveTab('board')} 
                  className={`px-3 py-1.5 rounded cursor-pointer whitespace-nowrap ${activeTab === 'board' ? 'bg-brand-cyan/20 text-brand-cyan' : 'text-on-surface hover:bg-white/5'}`}
                >
                  BOARDROOM
                </button>
                <button 
                  onClick={() => setActiveTab('wf')} 
                  className={`px-3 py-1.5 rounded cursor-pointer whitespace-nowrap ${activeTab === 'wf' ? 'bg-brand-cyan/20 text-brand-cyan' : 'text-on-surface hover:bg-white/5'}`}
                >
                  WORKFORCE
                </button>
                <button 
                  onClick={() => setActiveTab('sim')} 
                  className={`px-3 py-1.5 rounded cursor-pointer whitespace-nowrap ${activeTab === 'sim' ? 'bg-brand-cyan/20 text-brand-cyan' : 'text-on-surface hover:bg-white/5'}`}
                >
                  DECISION
                </button>
                <button 
                  onClick={() => setActiveTab('kb')} 
                  className={`px-3 py-1.5 rounded cursor-pointer whitespace-nowrap ${activeTab === 'kb' ? 'bg-brand-cyan/20 text-brand-cyan' : 'text-on-surface hover:bg-white/5'}`}
                >
                  GRAPH
                </button>
                <button 
                  onClick={() => setActiveTab('memory')} 
                  className={`px-3 py-1.5 rounded cursor-pointer whitespace-nowrap ${activeTab === 'memory' ? 'bg-brand-cyan/20 text-brand-cyan' : 'text-on-surface hover:bg-white/5'}`}
                >
                  MEMORY SEARCH
                </button>
              </div>

              {/* Dynamic Panel renderer based on activeTab */}
              
              {/* ======================================================= */}
              {/* TAB: BOARDROOM CORE                                    */}
              {/* ======================================================= */}
              {activeTab === 'board' && (
                <div className="space-y-6">
                  {/* Title Bar */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                      <span className="font-mono text-xs text-brand-cyan uppercase tracking-wider">SECURE EXECUTIVE LINK // SECTOR-07</span>
                      <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase leading-tight">VIRTUAL BOARDROOM</h2>
                    </div>
                    {/* Diagnostic scoreboard */}
                    <div className="flex gap-4 p-3 glass-panel rounded-xl font-mono text-center">
                      <div>
                        <div className="text-[9px] opacity-60">ACTIVE COGNITION</div>
                        <div className="text-lg font-bold text-brand-cyan">1,248 Node</div>
                      </div>
                      <div className="w-[1px] bg-white/15"></div>
                      <div>
                        <div className="text-[9px] opacity-60">SYNC DELTA</div>
                        <div className="text-lg font-bold text-brand-purple">0.4ms</div>
                      </div>
                    </div>
                  </div>

                  {/* High fidelity Boardroom debate panel */}
                  <div className="grid grid-cols-12 gap-6">
                    {/* Left: AI Personnel list */}
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-3">
                      <div className="font-mono text-[10px] text-on-surface-variant flex items-center gap-1.5 uppercase px-1">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-80"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-cyan"></span>
                        </span>
                        <span>AGI Strategic Council</span>
                      </div>

                      {/* CEO AETHER-01 */}
                      <div className="glass-panel p-3.5 rounded-xl border border-brand-cyan/15 flex items-center gap-3 hover:border-brand-cyan/50 transition-colors cursor-pointer group bg-[#0d1515]/30">
                        <div className="w-10 h-10 rounded-full border border-brand-cyan/50 flex items-center justify-center bg-brand-cyan/10 text-brand-cyan group-hover:glow-border-cyan transition-all">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-mono text-xs text-glow-cyan text-brand-cyan uppercase font-bold">AETHER-01</h4>
                          <p className="text-[9px] opacity-60 lowercase font-mono">CHIEF STRATEGIC OFFICER</p>
                        </div>
                      </div>

                      {/* CTO SYNAPSE-X */}
                      <div className="glass-panel p-3.5 rounded-xl border border-brand-cyan/15 flex items-center gap-3 hover:border-brand-purple/50 transition-colors cursor-pointer group bg-[#0d1515]/30">
                        <div className="w-10 h-10 rounded-full border border-brand-purple/50 flex items-center justify-center bg-brand-purple/10 text-brand-purple group-hover:glow-border-purple transition-all">
                          <Terminal className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-mono text-xs text-glow-purple text-brand-purple uppercase font-bold">SYNAPSE-X</h4>
                          <p className="text-[9px] opacity-60 lowercase font-mono">INFRASTRUCTURE & COMPUTE</p>
                        </div>
                      </div>

                      {/* Risk Sentinel-9 */}
                      <div className="glass-panel p-3.5 rounded-xl border border-brand-cyan/15 flex items-center gap-3 hover:border-red-400/50 transition-colors cursor-pointer group bg-[#0d1515]/30">
                        <div className="w-10 h-10 rounded-full border border-red-500/50 flex items-center justify-center bg-red-500/10 text-red-400 transition-all">
                          <ShieldAlert className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-mono text-xs text-red-400 uppercase font-bold">SENTINEL-9</h4>
                          <p className="text-[9px] opacity-60 lowercase font-mono">BIAS & RISK COMPLIANCE</p>
                        </div>
                      </div>

                      {/* Operations Director */}
                      <div className="glass-panel p-3.5 rounded-xl border border-brand-cyan/15 flex items-center gap-3 hover:border-brand-cyan/50 transition-colors cursor-pointer group bg-[#0d1515]/30">
                        <div className="w-10 h-10 rounded-full border border-brand-cyan/30 flex items-center justify-center bg-zinc-800 text-brand-cyan transition-all">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-mono text-xs text-white uppercase font-bold">FLUX-CAP</h4>
                          <p className="text-[9px] opacity-60 lowercase font-mono">WORKPLACE LATENCY LOGS</p>
                        </div>
                      </div>
                    </div>

                    {/* Central Dialogue feed */}
                    <div className="col-span-12 md:col-span-8 flex flex-col gap-4">
                      <div className="glass-panel rounded-2xl p-5 border-t-2 border-brand-cyan/25 flex flex-col min-h-[380px] bg-[#0d1515]/20 justify-between">
                        {/* Feed header */}
                        <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-2.5 font-mono text-[10px]">
                          <span className="text-brand-cyan flex items-center gap-1">
                            <RefreshCw className={`w-3 h-3 ${isBoardroomPlanning ? "animate-spin" : ""}`} />
                            STRATEGIC DIALOGUE MATRIX
                          </span>
                          <span className="opacity-60 uppercase">Live Debate</span>
                        </div>

                        {/* Speech bubbles */}
                        <div className="flex-grow overflow-y-auto max-h-[300px] space-y-4 pr-1.5 custom-scrollbar">
                          {corporateDebate.map((msg, index) => {
                            const isAdmin = msg.agent === "ADMIN";
                            const isCEO = msg.agent === "AETHER-01";
                            const isCTO = msg.agent === "SYNAPSE-X";
                            const isRisk = msg.agent === "SENTINEL-9";
                            const avatarColor = isAdmin ? "bg-white/10 border-white text-white" : 
                                               isCEO ? "bg-brand-cyan/10 border-brand-cyan text-brand-cyan" :
                                               isCTO ? "bg-brand-purple/10 border-brand-purple text-brand-purple" :
                                               isRisk ? "bg-red-500/15 border-red-500 text-red-400" : "bg-zinc-800 border-zinc-700 text-brand-cyan";

                            return (
                              <div key={index} className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                                <div className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-mono font-bold ${avatarColor}`}>
                                  {msg.agent.charAt(0)}
                                </div>
                                <div className={`glass-panel p-3.5 rounded-xl max-w-[85%] ${isAdmin ? "rounded-tr-none border-r-2 border-brand-cyan/60" : "rounded-tl-none border-l-2 border-brand-cyan/40"}`}>
                                  <div className="flex items-center justify-between font-mono text-[9px] mb-1 gap-4">
                                    <span className="text-brand-cyan font-bold">{msg.agent}</span>
                                    <span className="opacity-40">{msg.timestamp}</span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-glow-cyan leading-relaxed text-on-surface">
                                    {msg.text}
                                  </p>
                                  {msg.reasoningPath && (
                                    <div className="mt-2 text-[8px] font-mono opacity-50 border-t border-white/5 pt-1">
                                      ROUTE: {msg.reasoningPath} // CONFIDENCE: {msg.confidencePoints}%
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div ref={debateEndRef} />
                        </div>

                        {/* Interactive override input */}
                        <form onSubmit={handleInjectBoardroomOverride} className="mt-4 pt-3.5 border-t border-white/5 flex gap-2">
                          <input 
                            type="text" 
                            disabled={isBoardroomPlanning}
                            value={boardroomOverrideInput}
                            onChange={(e) => setBoardroomOverrideInput(e.target.value)}
                            placeholder="INJECT EXECUTIVE STRATEGIC OVERRIDE..."
                            className="bg-surface-container-lowest/80 border border-brand-cyan/30 text-xs sm:text-sm text-brand-cyan placeholder:text-brand-cyan-dim/40 rounded px-3 py-2 flex-grow focus:outline-none focus:border-brand-cyan font-mono"
                          />
                          <button 
                            type="submit"
                            disabled={isBoardroomPlanning || !boardroomOverrideInput.trim()}
                            className="p-2.5 bg-brand-cyan hover:scale-[1.03] transition-transform text-black flex items-center justify-center rounded cursor-pointer disabled:opacity-40"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Decision Confidence Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter my-6">
                    <div className="glass-panel p-5 rounded-xl border border-brand-cyan/10">
                      <div className="flex justify-between font-mono text-[10px] opacity-60 mb-2">
                        <span>CONSENSUS DEBATE RATIO</span>
                        <span>{overallConfidence}%</span>
                      </div>
                      <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-cyan" style={{ width: `${overallConfidence}%` }} />
                      </div>
                    </div>
                    <div className="glass-panel p-5 rounded-xl border border-brand-cyan/10">
                      <div className="flex justify-between font-mono text-[10px] opacity-60 mb-2">
                        <span>ESTIMATED THREAT IMPACT</span>
                        <span className={overallRisk > 30 ? "text-red-400" : ""}>{overallRisk}%</span>
                      </div>
                      <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400" style={{ width: `${overallRisk}%` }} />
                      </div>
                    </div>
                    <div className="glass-panel p-5 rounded-xl border border-brand-cyan/10">
                      <div className="flex justify-between font-mono text-[10px] opacity-60 mb-2">
                        <span>WORKSPACE RESOURCE SYNCHRONY</span>
                        <span>{overallSync}%</span>
                      </div>
                      <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-purple" style={{ width: `${overallSync}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* TAB: MULTI-AGENT SWARM                                  */}
              {/* ======================================================= */}
              {activeTab === 'wf' && (
                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-xs text-brand-cyan uppercase tracking-wider">COLLABORATIVE ECOSYSTEM DECK</span>
                    <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase leading-tight">MULTI-AGENT SWARM</h2>
                    <p className="text-sm text-on-surface-variant font-light mt-1">
                      See individual AGI units exchange tasks and process intelligence logs with database indexing vectors.
                    </p>
                  </div>

                  {/* Neural Graph Map visualizer */}
                  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden bg-[#0d1515]/20 min-h-[320px] flex items-center justify-center">
                    <div className="scan-line"></div>
                    <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
                      {/* Live canvas world visualization link is embedded dynamically */}
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6nzZcNuT0WCwKqTsbKyKIwAL2x1lJ4FfZkq-hfsJmx9QuzZHYAnNhTnZ0a6cmSRx-h6_ZvRFVGbiv8lkOZLC3IvhavlULWOMSg0JNRD-wn6FswqoS8N4tSohpNPb8_NCPm7tTDGVwMqztH1Uha1Rf_vj0bDHgeBT8FmmqQ_92Wxv04Cl5sk4e42dK6j8LLBkAddOXvSID0ozg-LRRwAq0XFzNmDZvliKHyYWA8dWtbeVMMc6hlj2u2aXPj9cK9bMtYxQDl7KQcnM" 
                        alt="Global high-tech world network grid mapping representation"
                        className="w-full h-full object-cover scale-105"
                      />
                    </div>
                    
                    <div className="relative z-10 w-full flex flex-col items-center">
                      {/* Pulsing Swarm visual links */}
                      <div className="relative w-72 h-44 flex items-center justify-center mt-4">
                        <div className="absolute top-2 left-6 w-12 h-12 rounded-full border border-brand-cyan flex items-center justify-center bg-[#0d1515] hover:scale-110 transition-transform cursor-pointer" onClick={() => setSelectedAgent("AETHER-01")}>
                          <Sparkles className="w-5 h-5 text-brand-cyan animate-pulse" />
                        </div>
                        <div className="absolute top-2 right-6 w-12 h-12 rounded-full border border-brand-purple flex items-center justify-center bg-[#0d1515] hover:scale-110 transition-transform cursor-pointer" onClick={() => setSelectedAgent("SYNAPSE-X")}>
                          <Terminal className="w-5 h-5 text-brand-purple" />
                        </div>
                        <div className="absolute bottom-2 right-6 w-12 h-12 rounded-full border border-brand-cyan flex items-center justify-center bg-[#0d1515] hover:scale-110 transition-transform cursor-pointer" onClick={() => setSelectedAgent("FLUX-CAP")}>
                          <Cpu className="w-5 h-5 text-brand-cyan" />
                        </div>
                        <div className="absolute bottom-2 left-6 w-12 h-12 rounded-full border border-red-500 flex items-center justify-center bg-[#0d1515] hover:scale-110 transition-transform cursor-pointer" onClick={() => setSelectedAgent("SENTINEL-9")}>
                          <ShieldAlert className="w-5 h-5 text-red-400" />
                        </div>

                        {/* Interactive connectors (SVGs drawing vectors) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10 bg-transparent">
                          <line x1="15%" y1="18%" x2="85%" y2="18%" stroke="rgba(0, 242, 255, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1="85%" y1="18%" x2="85%" y2="82%" stroke="rgba(0, 242, 255, 0.4)" strokeWidth="1" />
                          <line x1="85%" y1="82%" x2="15%" y2="82%" stroke="rgba(157, 5, 255, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1="15%" y1="82%" x2="15%" y2="18%" stroke="rgba(0, 242, 255, 0.4)" strokeWidth="1" />
                          <line x1="15%" y1="18%" x2="85%" y2="82%" stroke="rgba(157, 5, 255, 0.3)" strokeWidth="1.5" />
                          <line x1="85%" y1="18%" x2="15%" y2="82%" stroke="rgba(0, 242, 255, 0.3)" strokeWidth="1.5" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Agent specific operations log */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-5 rounded-xl border border-brand-cyan/15">
                      <h3 className="font-mono text-xs text-brand-cyan mb-4 uppercase">AGENT ACTIVITY // {selectedAgent}</h3>
                      <div className="p-3 bg-surface-container-lowest/80 border border-white/5 rounded font-mono text-[11px] leading-relaxed h-36 overflow-y-auto custom-scrollbar">
                        <div className="opacity-40 mb-1">:: MEMORY VECTOR STACK ACTIVE</div>
                        {selectedAgent === "AETHER-01" && (
                          <div className="space-y-1 text-on-surface-variant">
                            <p className="text-brand-cyan">[AETHER] Task group: Monitor multi-agent decision synchrony.</p>
                            <p>[AETHER] Rerouting general administrative quotas safely.</p>
                            <p>[AETHER] Consensus check score returns status 94.2% approved.</p>
                          </div>
                        )}
                        {selectedAgent === "SYNAPSE-X" && (
                          <div className="space-y-1 text-on-surface-variant">
                            <p className="text-brand-purple">[SYNAPSE] Schema updates active on Postgres endpoints.</p>
                            <p>[SYNAPSE] Caching vectors refreshed in Pinecone database index.</p>
                            <p>[SYNAPSE] Latency latency check validated at sub-10ms intervals.</p>
                          </div>
                        )}
                        {selectedAgent === "SENTINEL-9" && (
                          <div className="space-y-1 text-on-surface-variant">
                            <p className="text-red-400">[SENTINEL] Flagging compliance metrics for EU nodes.</p>
                            <p>[SENTINEL] Singapore server data monitored under sandbox rules.</p>
                            <p>[SENTINEL] Intercepted 1 unauthorized token prompt lookup attempt.</p>
                          </div>
                        )}
                        {selectedAgent === "FLUX-CAP" && (
                          <div className="space-y-1 text-on-surface-variant">
                            <p className="text-white">[FLUX] Auto-balancing cluster resource caps safely.</p>
                            <p>[FLUX] Operational execution timeline is running 1.1% faster.</p>
                            <p>[FLUX] Dispatching Webhook notification metrics to central registry.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat with Swarm container */}
                    <div className="glass-panel p-5 rounded-xl border border-brand-cyan/15 flex flex-col justify-between">
                      <h3 className="font-mono text-xs text-brand-cyan mb-3 uppercase">COGNITIVE SWARM INQUIRY</h3>
                      <div className="h-24 overflow-y-auto mb-3 font-mono text-[10px] space-y-1.5 pr-1.5 custom-scrollbar">
                        {swarmCommsLogs.map((lg, i) => (
                          <div key={i} className="text-on-surface-variant">
                            <span className="opacity-40 font-bold">&gt;&gt; </span>{lg}
                          </div>
                        ))}
                        {isSwarmThinking && (
                          <div className="text-brand-cyan animate-pulse">&gt;&gt; Swarm aligning neural paths for synthesis...</div>
                        )}
                      </div>
                      <form onSubmit={handleSwarmCommsSubmit} className="flex gap-2">
                        <input 
                          type="text" 
                          disabled={isSwarmThinking}
                          value={agentCommsInput}
                          onChange={(e) => setAgentCommsInput(e.target.value)}
                          placeholder="ASK SWARM: 'Why is Project Titan delayed?'"
                          className="bg-surface-container-lowest/80 border border-brand-cyan/20 text-xs text-brand-cyan rounded px-2.5 py-1.5 flex-grow focus:outline-none focus:border-brand-cyan font-mono"
                        />
                        <button 
                          type="submit"
                          disabled={isSwarmThinking || !agentCommsInput.trim()}
                          className="px-3 py-1.5 bg-brand-cyan text-black font-semibold text-xs rounded uppercase hover:scale-[1.02] transition-transform"
                        >
                          ASK
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* TAB: STRATEGIC SIMULATION                              */}
              {/* ======================================================= */}
              {activeTab === 'sim' && (
                <div className="space-y-6">
                  {/* Tab Title */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-4">
                    <div>
                      <span className="font-mono text-xs text-brand-cyan uppercase tracking-wider">PREVENTATIVE SIMULATOR MODULE v4</span>
                      <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase leading-tight">PREDICTIVE BUSINESS SIMULATION</h2>
                    </div>
                    {/* Live status banner */}
                    <div className="font-mono text-[10px] text-brand-cyan bg-[#0d1515]/80 px-3 py-1.5 rounded border border-brand-cyan/20 uppercase">
                      SYSTEM CORRELATION ACTIVE
                    </div>
                  </div>

                  {/* Main Grid: Visuals left, Controls right */}
                  <div className="grid grid-cols-12 gap-6">
                    {/* Left: Interactive SVGs Charts and metrics */}
                    <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
                      
                      {/* Big metric overview card */}
                      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col min-h-[300px] border border-brand-cyan/20 bg-[#0d1515]/20 justify-between">
                        <div className="scan-line"></div>
                        <div className="absolute inset-0 z-0 opacity-15 overflow-hidden">
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6nzZcNuT0WCwKqTsbKyKIwAL2x1lJ4FfZkq-hfsJmx9QuzZHYAnNhTnZ0a6cmSRx-h6_ZvRFVGbiv8lkOZLC3IvhavlULWOMSg0JNRD-wn6FswqoS8N4tSohpNPb8_NCPm7tTDGVwMqztH1Uha1Rf_vj0bDHgeBT8FmmqQ_92Wxv04Cl5sk4e42dK6j8LLBkAddOXvSID0ozg-LRRwAq0XFzNmDZvliKHyYWA8dWtbeVMMc6hlj2u2aXPj9cK9bMtYxQDl7KQcnM" 
                            alt="Surveillance world neural node connections tracking mapping"
                            className="w-full h-full object-cover scale-105"
                          />
                        </div>

                        {/* Top metric indicators */}
                        <div className="relative z-10 flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 font-mono text-[10px] text-brand-cyan uppercase tracking-wider">
                              <span className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" />
                              <span>LIVE_SCENARIO_PROJECTION</span>
                            </div>
                            <h3 className="font-display font-black text-white text-3xl sm:text-5xl text-glow-cyan">
                              {simResults.revGrowthPercent >= 0 ? "+" : ""}{simResults.revGrowthPercent}% REV
                            </h3>
                          </div>
                          
                          <div className="text-right font-mono text-[10px] opacity-60 uppercase">
                            Sampling: 500ms
                          </div>
                        </div>

                        {/* Middle: Grid overlay indices */}
                        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                          <div className="glass-panel p-3 rounded border-l-2 border-brand-cyan">
                            <span className="font-mono text-[9px] opacity-60 block">NODE CLUSTERING</span>
                            <span className="font-mono text-sm font-bold text-white uppercase">{(simResults.nodeClusteringOps / 1000000).toFixed(1)}M OPS</span>
                          </div>
                          <div className="glass-panel p-3 rounded border-l-2 border-brand-purple">
                            <span className="font-mono text-[9px] opacity-60 block">AI LATENCY</span>
                            <span className="font-mono text-sm font-bold text-white uppercase">{simResults.aiLatencyMs}ms</span>
                          </div>
                          <div className="glass-panel p-3 rounded border-l-2 border-brand-green">
                            <span className="font-mono text-[9px] opacity-60 block">TRUST RATIO</span>
                            <span className="font-mono text-sm font-bold text-white uppercase">{simResults.trustRatio}</span>
                          </div>
                          <div className="glass-panel p-3 rounded border-l-2 border-red-400">
                            <span className="font-mono text-[9px] opacity-60 block">RISK DELTA</span>
                            <span className={`font-mono text-sm font-bold uppercase ${simResults.riskDeltaPercent > 0 ? "text-red-400" : "text-brand-green"}`}>
                              {simResults.riskDeltaPercent > 0 ? "+" : ""}{simResults.riskDeltaPercent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Revenue trajectory SVG chart */}
                      <div className="glass-panel rounded-xl border border-brand-cyan/15 p-5 relative overflow-hidden bg-[#0d1515]/30">
                        <div className="font-mono text-[10px] text-brand-cyan uppercase tracking-wider mb-3">
                          Trajectory Revenue Modelling Loop // Multi-Year Simulation
                        </div>
                        <div className="h-28 flex items-end justify-between gap-1 w-full relative pt-4">
                          {/* Simulated SVG line linking */}
                          <svg className="absolute inset-0 w-full h-full bg-transparent pointer-events-none" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="chartGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#00f2ff" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Dynamically draw a continuous line between scaled points */}
                            <path 
                              d={`M 15 ${112 - (simResults.revenueForecast[0] || 0) * 0.7} 
                                 L 80 ${112 - (simResults.revenueForecast[1] || 0) * 0.7} 
                                 L 145 ${112 - (simResults.revenueForecast[2] || 0) * 0.7} 
                                 L 210 ${112 - (simResults.revenueForecast[3] || 0) * 0.7} 
                                 L 275 ${112 - (simResults.revenueForecast[4] || 0) * 0.7} 
                                 L 340 ${112 - (simResults.revenueForecast[5] || 0) * 0.7} 
                                 L 405 ${112 - (simResults.revenueForecast[6] || 0) * 0.7} 
                                 L 470 ${112 - (simResults.revenueForecast[7] || 0) * 0.7} 
                                 L 535 ${112 - (simResults.revenueForecast[8] || 0) * 0.7}`}
                              fill="none" 
                              stroke="#00f2ff" 
                              strokeWidth="2.5" 
                            />
                            {/* Fill Area with glow */}
                            <path 
                              d={`M 15 ${112 - (simResults.revenueForecast[0] || 0) * 0.7} 
                                 L 80 ${112 - (simResults.revenueForecast[1] || 0) * 0.7} 
                                 L 145 ${112 - (simResults.revenueForecast[2] || 0) * 0.7} 
                                 L 210 ${112 - (simResults.revenueForecast[3] || 0) * 0.7} 
                                 L 275 ${112 - (simResults.revenueForecast[4] || 0) * 0.7} 
                                 L 340 ${112 - (simResults.revenueForecast[5] || 0) * 0.7} 
                                 L 405 ${112 - (simResults.revenueForecast[6] || 0) * 0.7} 
                                 L 470 ${112 - (simResults.revenueForecast[7] || 0) * 0.7} 
                                 L 535 ${112 - (simResults.revenueForecast[8] || 0) * 0.7} 
                                 L 535 112 L 15 112 Z`}
                              fill="url(#chartGlow)"
                            />
                          </svg>

                          {/* Dynamic bar points */}
                          {simResults.revenueForecast.map((val, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center group relative z-10">
                              <div 
                                className="w-2.5 h-2.5 rounded-full bg-brand-cyan border border-black shadow-[0_0_8px_#00f2ff] opacity-80"
                                style={{ transform: `translateY(-${Math.max(0, val * 0.65)}px)` }}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between font-mono text-[9px] opacity-40 mt-3 pt-2 border-t border-white/5">
                          <span>Q1</span>
                          <span>Q2</span>
                          <span>Q3</span>
                          <span>Q4</span>
                          <span>MID-POINT</span>
                          <span>PROJECTION TERMINUS</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Scenario Selectors and Trajectory variables */}
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-6">

                      {/* AI Tactical Recommendations */}
                      <div className="glass-panel p-5 rounded-xl border border-brand-cyan/20 flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h3 className="font-mono text-xs text-white uppercase">AI RECOMMENDATIONS</h3>
                          <span className="px-2 py-0.5 bg-brand-cyan/15 border border-brand-cyan/40 text-[9px] text-brand-cyan rounded">CONFIDENCE: 98%</span>
                        </div>

                        <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar">
                          {simResults.recommendations.map((rec, i) => (
                            <div key={i} className="group border border-white/5 p-3 rounded bg-surface-container-low hover:border-brand-cyan/40 transition-colors">
                              <div className="flex justify-between font-mono text-[10px] text-brand-cyan/80 mb-1 font-bold">
                                <span>PATH {rec.path}</span>
                                <span>PROB: {rec.probability}</span>
                              </div>
                              <h4 className="font-display font-bold text-xs text-white mb-1">{rec.title}</h4>
                              <p className="text-[11px] text-on-surface-variant leading-relaxed font-light">{rec.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Core control card */}
                      <div className="glass-panel p-5 rounded-xl border border-brand-cyan/15 bg-surface-container-lowest/40">
                        <h4 className="font-mono text-xs text-brand-cyan uppercase tracking-wider mb-3">COGNITIVE CRITICAL CONTROL</h4>
                        <div className="space-y-4 font-mono text-xs">
                          {/* Year slider */}
                          <div>
                            <div className="flex justify-between text-[11px] opacity-60 mb-1">
                              <span>SIMULATION TARGET YEAR</span>
                              <span className="text-brand-cyan">YEAR: {yearSlider}</span>
                            </div>
                            <input 
                              type="range" 
                              min="2024" 
                              max="2050" 
                              value={yearSlider}
                              onChange={(e) => setYearSlider(Number(e.target.value))}
                              className="w-full h-1 bg-[#0d1515] accent-brand-cyan rounded cursor-pointer"
                            />
                            <div className="flex justify-between text-[9px] opacity-40 mt-1">
                              <span>2024</span>
                              <span>2050</span>
                            </div>
                          </div>
                          
                          {/* Demand trigger */}
                          <div>
                            <div className="flex justify-between text-[11px] opacity-60 mb-1">
                              <span>CLIENT DEMAND SURGE RATE</span>
                              <span className="text-brand-cyan">{demandSurgeSlider}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="100" 
                              max="500" 
                              value={demandSurgeSlider}
                              onChange={(e) => setDemandSurgeSlider(Number(e.target.value))}
                              className="w-full h-1 bg-[#0d1515] accent-brand-cyan rounded cursor-pointer"
                            />
                          </div>

                          {/* Replacement rate */}
                          <div>
                            <div className="flex justify-between text-[11px] opacity-60 mb-1">
                              <span>AUTO AGENT REPLACEMENT RATE</span>
                              <span className="text-brand-cyan">{aiReplacementSlider}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={aiReplacementSlider}
                              onChange={(e) => setAiReplacementSlider(Number(e.target.value))}
                              className="w-full h-1 bg-[#0d1515] accent-brand-cyan rounded cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Scenario Presets Buttons */}
                        <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                          <span className="font-mono text-[9px] opacity-40 block tracking-wider uppercase mb-1">PRESET TRIGGER EXPERIMENTS</span>
                          <div className="grid grid-cols-3 gap-2">
                            <button 
                              type="button"
                              onClick={() => triggerSimulationScenario("300% Demand Surge", 300, 40)}
                              className={`p-1 px-2 rounded font-mono text-[10px] uppercase text-left border ${selectedScenario === "300% Demand Surge" ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan" : "bg-neutral-900 border-white/10 text-on-surface-variant hover:bg-white/5"}`}
                            >
                              Demand Surge
                            </button>
                            <button 
                              type="button"
                              onClick={() => triggerSimulationScenario("40% AI Replacement", 100, 80)}
                              className={`p-1 px-2 rounded font-mono text-[10px] uppercase text-left border ${selectedScenario === "40% AI Replacement" ? "bg-brand-purple/20 border-brand-purple text-brand-purple" : "bg-neutral-900 border-white/10 text-on-surface-variant hover:bg-white/5"}`}
                            >
                              Work Shift
                            </button>
                            <button 
                              type="button"
                              onClick={() => triggerSimulationScenario("Systemic Market Crash Protocol", 120, 10)}
                              className={`p-1 px-2 rounded font-mono text-[10px] uppercase text-left border ${selectedScenario === "Systemic Market Crash Protocol" ? "bg-red-500/20 border-red-500 text-red-400" : "bg-neutral-900 border-white/10 text-on-surface-variant hover:bg-white/5"}`}
                            >
                              Market Crash
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* TAB: KNOWLEDGE DECK                                    */}
              {/* ======================================================= */}
              {activeTab === 'kb' && (
                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-xs text-brand-cyan uppercase tracking-wider">ENTERPRISE KNOWLEDGE CONTEXT</span>
                    <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase leading-tight">SEMANTIC KNOWLEDGE DECK</h2>
                    <p className="text-sm text-on-surface-variant font-light mt-1">
                      Query your corporate knowledge graphs, files, meeting vaults, and database schemas with semantic embedding filters.
                    </p>
                  </div>

                  {/* Search Query panel */}
                  <div className="grid grid-cols-12 gap-6">
                    {/* Index search query input */}
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                      <div className="glass-panel p-5 rounded-xl border border-brand-cyan/25 flex flex-col gap-4">
                        <form onSubmit={handleKbQuerySubmit} className="flex flex-col gap-3">
                          <label className="font-mono text-[10px] text-on-surface-variant uppercase">SEMANTIC KNOWLEDGE QUERY</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={kbQueryInput}
                              onChange={(e) => setKbQueryInput(e.target.value)}
                              placeholder="EMEA database latency audit..."
                              className="bg-surface-container-lowest/80 border-b border-brand-cyan/50 text-xs sm:text-sm text-brand-cyan placeholder:text-brand-cyan-dim/40 rounded px-2.5 py-3 w-full focus:outline-none focus:border-brand-cyan font-mono pr-8"
                            />
                            <Search className="w-4 h-4 text-brand-cyan absolute right-2.5 top-3" />
                          </div>
                          
                          <button 
                            type="submit"
                            disabled={isKbSearching || !kbQueryInput.trim()}
                            className="py-2.5 w-full bg-brand-cyan text-black font-semibold text-xs tracking-widest uppercase rounded hover:scale-[1.01] transition-transform shadow-[0_0_12px_rgba(0,242,255,0.25)]"
                          >
                            {isKbSearching ? "TRAVERSING INDEX..." : "EMBEDDING VECTOR CHECK"}
                          </button>
                        </form>

                        {/* Database registry lists */}
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                          <span className="font-mono text-[9px] opacity-40 block uppercase">Indexed Assets</span>
                          {indexedDatabases.map((db, i) => (
                            <div key={i} className="flex justify-between items-center bg-[#0d1515] p-2.5 rounded border border-white/5 font-mono text-[11px]">
                              <div>
                                <span className="text-glow-cyan text-white block">{db.name}</span>
                                <span className="opacity-40 text-[9px]">{db.size} matches</span>
                              </div>
                              <span className="text-[9px] bg-brand-cyan/15 border border-brand-cyan/40 text-brand-cyan px-2 py-0.5 rounded font-bold">{db.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Vector mapping graph results */}
                    <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
                      <div className="glass-panel p-5 rounded-xl border border-brand-cyan/20 flex flex-col min-h-[360px] justify-between">
                        <div className="font-mono text-[10px] text-brand-cyan uppercase tracking-wider border-b border-white/5 pb-2 mb-3">
                          Relational Context Mapping Graph
                        </div>

                        {/* Search result description text */}
                        <div className="p-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded font-sans text-xs sm:text-sm leading-relaxed text-glow-cyan">
                          <p>{kbQueryResults}</p>
                        </div>

                        {/* Reconstructed simple node map */}
                        <div className="relative font-mono text-xs h-40 flex items-center justify-center border border-white/5 rounded my-4 bg-zinc-950/40">
                          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00f2ff_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                          <div className="relative flex gap-12 items-center">
                            {knowledgeGraph.nodes.map((node, i) => (
                              <div key={node.id} className="relative z-10 p-2 border border-brand-cyan/40 bg-[#0d1515] rounded shadow-[0_0_12px_rgba(0,242,255,0.15)] flex flex-col items-center">
                                <span className="text-[10px] font-bold text-glow-cyan text-brand-cyan">{node.label}</span>
                                <span className="text-[8px] opacity-40 lowercase uppercase mt-1">({node.type})</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between font-mono text-[9px] opacity-40">
                          <span>Graph synchronization level: OPTIMAL</span>
                          <span>EMBEDDING DEPTH: 100% SECURE</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drag and Drop Pipeline Orchesatration builder */}
                  <div className="glass-panel rounded-2xl p-6 border border-brand-cyan/15 bg-gradient-to-r from-neutral-950 to-transparent mt-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                      <div>
                        <h3 className="font-display text-white text-lg sm:text-xl font-bold uppercase mb-1">
                          Enterprise Orchestrator Pipeline Tool
                        </h3>
                        <p className="text-xs text-on-surface-variant font-light">
                          Build live multi-step task loops for distributed agent orchestration pipelines.
                        </p>
                      </div>
                      
                      <button 
                        onClick={executeOrchestratorPipeline}
                        disabled={pipelineState === 'running'}
                        className="px-6 py-2.5 bg-brand-cyan text-black font-semibold text-xs rounded uppercase hover:scale-[1.02] flex items-center gap-2 tracking-widest cursor-pointer disabled:opacity-40"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Run Orchestration Grid</span>
                      </button>
                    </div>

                    {/* Step boxes pipeline */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10 mb-6 font-mono text-xs">
                      {pipelineSteps.map((step, idx) => {
                        const isPending = step.status === 'pending';
                        const isActive = step.status === 'active';
                        const isSuccess = step.status === 'success';

                        let borderCls = "border-white/10 bg-zinc-950/20 text-on-surface-variant";
                        if (isActive) borderCls = "border-brand-cyan bg-brand-cyan/10 text-brand-cyan animate-pulse glow-border-cyan";
                        if (isSuccess) borderCls = "border-brand-green bg-brand-green/10 text-brand-green";

                        return (
                          <div key={step.id} className={`p-4 rounded border flex flex-col gap-2 relative ${borderCls} transition-all`}>
                            {/* Step number */}
                            <span className="opacity-40 text-[9px]">STEP 0{idx + 1} // {step.type.toUpperCase()}</span>
                            <span className="font-bold text-xs">{step.label}</span>
                            
                            {/* Status label / indicators */}
                            <div className="flex items-center justify-between text-[10px] mt-2 border-t border-white/5 pt-1">
                              <span>STATUS:</span>
                              <span className="font-bold">
                                {isPending && "STANDBY"}
                                {isActive && "RUNNING"}
                                {isSuccess && "SUCCESS [OK]"}
                              </span>
                            </div>

                            {/* Token usage logs under success */}
                            {isSuccess && (
                              <div className="text-[9px] opacity-60 flex justify-between mt-1 pt-1 border-t border-white/5">
                                <span>Tokens: {step.tokenUsage}</span>
                                <span>Latency: {step.latency}</span>
                              </div>
                            )}

                            {/* Arrow right indicator for desk */}
                            {idx < 3 && (
                              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-brand-cyan/40">
                                <ChevronRight className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Console monitor read-out */}
                    <div className="p-3 bg-zinc-950/80 border border-white/5 rounded font-mono text-[10.5px] text-glow-cyan flex items-center gap-3">
                      <Terminal className="w-4 h-4 text-brand-cyan animate-pulse shrink-0" />
                      <span className="text-on-surface-variant text-brand-cyan">{activeLogStep}</span>
                    </div>

                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* TAB: SEMANTIC TIMELINE MEMORY                          */}
              {/* ======================================================= */}
              {activeTab === 'memory' && (
                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-xs text-brand-cyan uppercase tracking-wider font-light">CORPORATE MEMORY VAULT</span>
                    <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase leading-tight">SEMANTIC MEMORY DEEP SCAN</h2>
                    <p className="text-sm text-on-surface-variant font-light mt-1">
                      Retrieve historic milestones, architecture variations, Slack transcripts, files, and emergency overrides.
                    </p>
                  </div>

                  {/* Search query override bar */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={memorySearchText}
                      onChange={(e) => setMemorySearchText(e.target.value)}
                      placeholder="SEARCH MEMORY: e.g., 'Delayed Project Titan Specs' or 'Unauthorized attempts Frankfurt'..."
                      className="bg-[#05070a] border border-brand-cyan/20 text-sm text-brand-cyan placeholder:text-brand-cyan-dim/40 rounded px-4 py-3 flex-grow focus:outline-none focus:border-brand-cyan font-mono"
                    />
                    <button 
                      onClick={triggerMemorySearch}
                      disabled={isMemoryRecalling || !memorySearchText.trim()}
                      className="px-6 bg-brand-cyan text-black font-mono text-xs font-bold uppercase hover:scale-[1.02] flex items-center justify-center rounded cursor-pointer disabled:opacity-40"
                    >
                      Search
                    </button>
                  </div>

                  {/* Semantic vertical timeline container */}
                  <div className="glass-panel rounded-2xl p-6 border-b-2 border-brand-cyan/20 bg-[#0d1515]/20 font-sans relative">
                    <div className="absolute left-6 md:left-[52px] top-8 bottom-8 w-[1.5px] bg-gradient-to-b from-brand-cyan/40 via-brand-purple/20 to-transparent"></div>
                    
                    <div className="space-y-8">
                      {memoryTimeline.map((item, index) => {
                        const isIncident = item.category === 'Incident';
                        const isStrategic = item.category === 'Strategic';
                        const dotColor = isIncident ? "bg-red-400 border-red-500 shadow-[0_0_8px_#f87171]" :
                                         isStrategic ? "bg-brand-cyan border-brand-cyan-dim shadow-[0_0_8px_#00f2ff]" : "bg-brand-purple border-brand-purple shadow-[0_0_8px_#9d05ff]";

                        return (
                          <div key={item.id} className="relative z-10 flex gap-6 items-start pl-3 md:pl-10">
                            {/* Bullet Dot */}
                            <div className={`w-3.5 h-3.5 rounded-full border-2 ${dotColor} mt-2.5 shrink-0`} />
                            
                            {/* Card Item body */}
                            <div className="glass-panel p-5 rounded-xl border border-white/5 bg-zinc-950/40 relative flex-grow">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2 font-mono text-[10px]">
                                <span className="opacity-40">{item.time}</span>
                                <span className={`px-2 py-0.5 rounded shrink-0 w-max uppercase tracking-wider ${isIncident ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan"}`}>
                                  {item.category}
                                </span>
                              </div>
                              <h3 className="font-display font-bold text-white text-sm sm:text-base mb-1.5 uppercase tracking-wide">{item.event}</h3>
                              <p className="text-xs sm:text-sm text-on-surface-variant font-light leading-relaxed">{item.summary}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        )}

      </div>

      {/* Global Interactive High Contrast Footer deck */}
      <footer className="w-full bg-[#05070a]/85 border-t border-[#74f5ff]/10 backdrop-blur flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 z-40 relative font-mono text-[9.5px]">
        <div className="text-on-surface-variant tracking-wider uppercase">
          OMNISYNC NETWORK // DISTRIBUTED AI SAAS ENGINE // v4.2
        </div>
        <div className="hidden sm:flex gap-6 text-on-surface-variant">
          <a href="#" className="hover:text-brand-cyan transition-colors">METRICS</a>
          <a href="#" className="hover:text-brand-cyan transition-colors">LATENCY</a>
          <a href="#" className="hover:text-brand-cyan transition-colors">DRAWER_LOCK</a>
          <span className="text-brand-cyan animate-pulse">COGNITIVE_GRID_ACTIVE</span>
        </div>
      </footer>

      {/* ======================================================= */}
      {/* AUTHENTICATION PORTAL MODAL                             */}
      {/* ======================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="glass-panel max-w-md w-full rounded-2xl border-2 border-brand-cyan/30 bg-[#06090d] shadow-[0_0_40px_rgba(0,242,255,0.15)] overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex border-b border-white/5 font-mono text-xs font-bold">
              <button 
                onClick={() => {
                  setAuthFormTab('signin');
                  setAuthError("");
                  setAuthSuccessMsg("");
                }}
                className={`flex-1 py-4 text-center cursor-pointer transition-colors uppercase tracking-wider ${authFormTab === 'signin' ? 'bg-brand-cyan/10 text-brand-cyan border-b-2 border-brand-cyan' : 'text-zinc-500 hover:text-white'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  setAuthFormTab('signup');
                  setAuthError("");
                  setAuthSuccessMsg("");
                }}
                className={`flex-1 py-4 text-center cursor-pointer transition-colors uppercase tracking-wider ${authFormTab === 'signup' ? 'bg-brand-cyan/10 text-brand-cyan border-b-2 border-brand-cyan' : 'text-zinc-500 hover:text-white'}`}
              >
                Register Agent
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider text-center">
                {authFormTab === 'signin' ? 'Verify OMNISYNC Credentials' : 'Configure New Agent Desk'}
              </h3>
              
              {authFormTab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-brand-cyan-dim">Agent Call Sign (Full Name)</label>
                  <input 
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Dr. Alexis Synapse"
                    className="w-full bg-black/60 border border-brand-cyan/20 rounded px-3 py-2 text-sm text-brand-cyan placeholder:text-zinc-700 font-mono focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-brand-cyan-dim">Operational Email Address</label>
                <input 
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="agent@omnisync.ai"
                  className="w-full bg-black/60 border border-brand-cyan/20 rounded px-3 py-2 text-sm text-brand-cyan placeholder:text-zinc-700 font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-brand-cyan-dim">Security Passphrase</label>
                <input 
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/60 border border-brand-cyan/20 rounded px-3 py-2 text-sm text-[#74f5ff] placeholder:text-zinc-700 font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {authFormTab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-brand-cyan-dim">Authorization Class (Role clearance)</label>
                  <select 
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value as 'admin' | 'analyst' | 'viewer')}
                    className="w-full bg-black/80 border border-brand-cyan/20 rounded px-3 py-2 text-sm text-brand-cyan font-mono focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="admin">ADMINISTRATOR (Full Executive Overrides)</option>
                    <option value="analyst">ANALYST (Simulations & Knowledge Graphs)</option>
                    <option value="viewer">VIEWER (Observe Passive Telemetries)</option>
                  </select>
                  <span className="block text-[9px] text-[#74f5ff]/60 leading-relaxed font-mono mt-1">
                    *Admin allows boardroom overrules. Analyst runs simulated outcomes. Viewer is restricted to passive telemetry feed.
                  </span>
                </div>
              )}

              {authError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-2.5 text-xs text-red-400 font-mono leading-normal">
                  ERROR_CODE_0x04: {authError}
                </div>
              )}

              {authSuccessMsg && (
                <div className="bg-green-500/10 border border-green-500/30 rounded p-2.5 text-xs text-green-400 font-mono leading-normal">
                  HANDSHAKE_SECURE: {authSuccessMsg}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 py-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-mono text-zinc-400 text-xs uppercase font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="flex-1 py-2 rounded bg-brand-cyan text-black hover:bg-opacity-80 transition-colors font-mono text-xs uppercase font-bold cursor-pointer disabled:opacity-40"
                >
                  {isAuthSubmitting ? 'Authenticating...' : authFormTab === 'signin' ? 'Authenticate' : 'Instate Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* CLEARANCE CRITICAL WARNING ALERT                        */}
      {/* ======================================================= */}
      {authWarning && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="glass-panel max-w-md w-full rounded-2xl border-2 border-red-500/50 bg-[#0f0404] shadow-[0_0_40px_rgba(239,68,68,0.25)] p-6 space-y-4">
            <div className="flex justify-center">
              <div className="relative w-12 h-12 rounded-full bg-red-400/10 border border-red-500/40 flex items-center justify-center animate-pulse">
                <span className="text-red-500 font-bold text-2xl font-mono">!</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-display font-black text-xl text-red-400 uppercase tracking-wide">
                SECURITY VIOLATION DELTA
              </h3>
              <p className="text-[10px] font-mono text-red-400/60 uppercase">
                CRITICAL_ACCESS_POL_DENIED
              </p>
            </div>

            <p className="text-xs text-on-surface-variant text-center font-mono leading-relaxed bg-black/40 p-3 rounded border border-red-500/10">
              {authWarning}
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setAuthWarning(null);
                  setAuthFormTab('signin');
                  setShowAuthModal(true);
                }}
                className="w-full py-2.5 rounded bg-red-500 text-white hover:bg-red-600 font-mono text-xs uppercase font-bold cursor-pointer font-sans"
              >
                Escalate Clearance (Sign In)
              </button>
              <button 
                onClick={() => setAuthWarning(null)}
                className="w-full py-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 font-mono text-xs uppercase cursor-pointer"
              >
                Close Warning Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
