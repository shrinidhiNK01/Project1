import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Relational-simulated Users Database for Persistent Mock Session Control & Role Authorization
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'analyst' | 'viewer';
  name: string;
}

const users: User[] = [
  {
    id: "u1",
    email: "admin@omnisync.ai",
    passwordHash: "admin123",
    role: "admin",
    name: "Admin Overseer"
  },
  {
    id: "u2",
    email: "analyst@omnisync.ai",
    passwordHash: "analyst123",
    role: "analyst",
    name: "Strategic Analyst"
  }
];

// Authentication Endpoints
app.post("/api/auth/register", (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required registration parameters." });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = users.find(u => u.email === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ error: "Account with this email already exists." });
  }
  const newUser: User = {
    id: `u_${Date.now()}`,
    email: normalizedEmail,
    passwordHash: password,
    role: role || "viewer",
    name: name.trim()
  };
  users.push(newUser);
  console.log(`[AUTH] User register: ${normalizedEmail} successfully signed up with access privileges: ${newUser.role}`);
  res.json({
    success: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    },
    token: `omnisync_jwt_${newUser.id}_${Date.now()}`
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials. Email and password required." });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find(u => u.email === normalizedEmail && u.passwordHash === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials. Authentication check failed." });
  }
  console.log(`[AUTH] User login: ${normalizedEmail} successfully validated as ${user.role}`);
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token: `omnisync_jwt_${user.id}_${Date.now()}`
  });
});

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (err) {
        console.error("Failed to initialize Gemini client:", err);
      }
    }
  }
  return aiClient;
}

// Simulated High-Tech fallback content for Boardroom debates
function getSimulatedDebate(scenario: string) {
  const normalized = scenario.toLowerCase();
  let debate = [];
  let confidenceScore = 94;
  let riskFactor = 12;
  let resourceSync = 78;
  let entropy = 0.0024;

  if (normalized.includes("demand") || normalized.includes("surge") || normalized.includes("300%")) {
    debate = [
      {
        agent: "AETHER-01" as const,
        text: "The 300% demand surge is our ultimate test. We must prioritize global scaling of our neural edge connectors immediately. AETHER instructs standard execution pathways to lock in Tier 1 nodes.",
        confidencePoints: 95,
        reasoningPath: "ROOT -> LATAM_NODE_SYNC -> EXPANSION"
      },
      {
        agent: "SYNAPSE-X" as const,
        text: "To support this traffic, Synapse recommends transitioning backend APIs to a decoupled, async queuing pattern. Utilizing Pinecone dual vector index allows sub-10ms knowledge retrievals continuously. Memory caches must be provisioned in Frankfurt and Singapore.",
        confidencePoints: 92,
        reasoningPath: "VEC_INDEX_DUAL -> DISTRIBUTED_REDUNDANCY"
      },
      {
        agent: "SENTINEL-9" as const,
        text: "Warning: Rapid scaling can create data leaks. The Singapore node has a projected compliance drift of 4.2% if we bypass standard security inspections. Sentinel-9 recommends running active continuous validation loops.",
        confidencePoints: 85,
        reasoningPath: "SECURITY_SANDBOX_V4 -> PROMPT_INTERCEPT"
      },
      {
        agent: "FLUX-CAP" as const,
        text: "Agreed on security, but we cannot afford latency. Flux-Cap is rerouting 32% of compute limits from HR services to active operations pipelines. Orchestration costs remain stabilized under $0.0012 per invocation loop.",
        confidencePoints: 89,
        reasoningPath: "COMPUTE_REALLOCATE -> RESOURCE_GRID_SYNC"
      }
    ];
    confidenceScore = 96;
    riskFactor = 18;
    resourceSync = 91;
  } else if (normalized.includes("replace") || normalized.includes("work") || normalized.includes("40%")) {
    debate = [
      {
        agent: "AETHER-01" as const,
        text: "Expanding AGI workers to 40% of standard administrative duties secures our market superiority. We are accelerating autonomous team deployments across all divisions.",
        confidencePoints: 96,
        reasoningPath: "ORGANIZATIONAL_RESTRUCTURE -> SYSTEMIC_AUTONOMY"
      },
      {
        agent: "FLUX-CAP" as const,
        text: "Our core workflow models have successfully mapped repetitive tasks. Under Flux-04, agent workspace pipelines can operate 24/7. HR risks are mitigated since personnel are upskilled into semantic policy auditors.",
        confidencePoints: 91,
        reasoningPath: "COGNITIVE_UPTIME -> MULTI_AGENT_COORDINATION"
      },
      {
        agent: "SENTINEL-9" as const,
        text: "Flagging structural vulnerabilities. Replacing human operators with prompt-responsive agents increases prompt injection risks. If an agent executes an unverified database command, our backup system will freeze.",
        confidencePoints: 88,
        reasoningPath: "INJECTION_DETECTION_V2 -> EXECUTION_QUARANTINE"
      },
      {
        agent: "SYNAPSE-X" as const,
        text: "We can prevent Sentinel's concerns by placing a schema-level validator. Drizzle-ORM models have strict constraints preventing unvetted drops or deletes. All updates require a state-consensus log from least 3 independent nodes.",
        confidencePoints: 94,
        reasoningPath: "SCHEMA_SANDBOX -> DRIZZLE_VALIDATOR"
      }
    ];
    confidenceScore = 92;
    riskFactor = 14;
    resourceSync = 87;
  } else if (normalized.includes("crash") || normalized.includes("market") || normalized.includes("crash protocol")) {
    debate = [
      {
        agent: "AETHER-01" as const,
        text: "A systemic market crash is unfolding. OMNISYNC AI must activate defensive posture 'Protocol Alpha'. Our priority flips from hyper-scale growth to asset-liquidity security.",
        confidencePoints: 94,
        reasoningPath: "COGNITIVE_SHIELD -> PORTFOLIO_PROTECT"
      },
      {
        agent: "SENTINEL-9" as const,
        text: "Sentinel-9 has initiated the hedge workflow. We have liquidated 80% of volatile digital compute investments. Main servers are on standby power to survive external grid threats.",
        confidencePoints: 98,
        reasoningPath: "STANDBY_STATE_LOCK -> CAPITAL_SHIELD"
      },
      {
        agent: "FLUX-CAP" as const,
        text: "Ops has locked all cloud expansion budgets. We are operating in lower compute clusters to save 62% on infrastructure expense. Global pipelines are limited to high-priority client triggers.",
        confidencePoints: 95,
        reasoningPath: "MINIMAL_BURST_MODE -> INFRA_TIGHTEN"
      },
      {
        agent: "SYNAPSE-X" as const,
        text: "Although compute is constrained, our semantic knowledge loops remain stable. By using lite models like gemini-3.1-flash-lite, we have lowered token usage cost while preserving 95.8% query precision.",
        confidencePoints: 90,
        reasoningPath: "LITE_MODEL_FALLBACK -> EFFICIENCY_MAX"
      }
    ];
    confidenceScore = 88;
    riskFactor = 41;
    resourceSync = 63;
  } else {
    // Custom topic boardroom debate
    debate = [
      {
        agent: "AETHER-01" as const,
        text: `Regarding "${scenario}" - OMNISYNC must align multi-agent parameters to capture immediate strategic output. We will orchestrate dynamic agents to validate targets.`,
        confidencePoints: 90,
        reasoningPath: "AUTO_TOPIC_INIT -> ALIGN_PROTOCOL"
      },
      {
        agent: "SYNAPSE-X" as const,
        text: "From an architecture standpoint, we can instantiate a dedicated LangGraph sub-graph to coordinate search data and semantic memories related to this question.",
        confidencePoints: 88,
        reasoningPath: "LANGGRAPH_DYNAMIC_ROUTE"
      },
      {
        agent: "SENTINEL-9" as const,
        text: "Risk evaluation: We must enforce strict credential parameters on any newly spawned agent routines, verifying that process isolation guidelines are active.",
        confidencePoints: 91,
        reasoningPath: "ISOLATION_VERIFICATION"
      },
      {
        agent: "FLUX-CAP" as const,
        text: "We can deploy these loops under our standard cluster limits. Operations can audit execution logs in 500ms intervals to optimize token pipelines.",
        confidencePoints: 87,
        reasoningPath: "REAL_TIME_ORCHESTRATION_LOG"
      }
    ];
    confidenceScore = 91;
    riskFactor = 15;
    resourceSync = 82;
  }

  return {
    debate,
    confidenceScore,
    riskFactor,
    resourceSync,
    inferencePowerTflops: 840,
    entropy,
    isSimulated: true
  };
}

// Simulated fallback content for scenarios
function getSimulatedSimulation(scenario: string) {
  const normalized = scenario.toLowerCase();
  let revGrowthPercent = 142.8;
  let nodeClusteringOps = 8200000;
  let aiLatencyMs = 14;
  let trustRatio = 0.9982;
  let riskDeltaPercent = -0.04;
  let revenueForecast = [42, 48, 55, 78, 62, 59, 81, 95, 110];
  let recommendations = [
    {
      path: "ALPHA" as const,
      title: "Southeast Asian Node Migration",
      probability: 0.84,
      description: "Execute automated expansion into Southeast Asian data nodes to mitigate impending European latency spikes. ROI projected at 12.4% within 48 hours."
    },
    {
      path: "BETA" as const,
      title: "Upshift Administrative Overhead",
      probability: 0.61,
      description: "Transition 40% of administrative overhead to GenAI-04 agents. Resource reallocation estimated to save $14M in recurring costs per simulation cycle."
    },
    {
      path: "GAMMA" as const,
      title: "Activate Capital Hedge Protocol",
      probability: 0.32,
      description: "Activate protective hedge protocols for Tier-1 markets. Defensive posturing suggested by 18% variance in market volatility signals."
    }
  ];

  if (normalized.includes("demand") || normalized.includes("surge") || normalized.includes("300%")) {
    revGrowthPercent = 312.4;
    nodeClusteringOps = 14500000;
    aiLatencyMs = 28;
    trustRatio = 0.9891;
    riskDeltaPercent = 1.15;
    revenueForecast = [45, 60, 95, 140, 185, 220, 260, 298, 312];
    recommendations[0] = {
      path: "ALPHA" as const,
      title: "Incorporate Elastic Compute Grid",
      probability: 0.95,
      description: "Trigger cloud auto-scaling on primary databases. Distribute processing loads across US-East-01 and EU-West-04 nodes immediately."
    };
  } else if (normalized.includes("replace") || normalized.includes("work") || normalized.includes("40%")) {
    revGrowthPercent = 89.2;
    nodeClusteringOps = 6400000;
    aiLatencyMs = 11;
    trustRatio = 0.9994;
    riskDeltaPercent = -1.45;
    revenueForecast = [30, 42, 45, 65, 70, 72, 85, 88, 89];
    recommendations[1] = {
      path: "BETA" as const,
      title: "Deploy LLM Workspace Pipeline v4",
      probability: 0.89,
      description: "Automate core data entries, content parsing, and scheduling with 24/7 worker loops. Recovers roughly 8,500 hours/week of labor resource."
    };
  } else if (normalized.includes("crash") || normalized.includes("market")) {
    revGrowthPercent = -34.5;
    nodeClusteringOps = 4900000;
    aiLatencyMs = 12;
    trustRatio = 0.9650;
    riskDeltaPercent = 4.80;
    revenueForecast = [80, 75, 70, 52, 48, 42, 38, 35, -34];
    recommendations[2] = {
      path: "GAMMA" as const,
      title: "Trigger Protocol Alpha Standby",
      probability: 0.98,
      description: "Minimize cluster power consumption. Disconnect speculative API crawlers and protect server reserves from cloud spike overruns."
    };
  }

  return {
    revGrowthPercent,
    nodeClusteringOps,
    aiLatencyMs,
    trustRatio,
    riskDeltaPercent,
    revenueForecast,
    recommendations,
    timelineSimulationYear: 2028,
    isSimulated: true
  };
}

// Simulated fallback content for memory vault searches
function getSimulatedMemory(query: string) {
  const norm = query.toLowerCase();
  
  let findings = `Semantic retrieval scan completed for query "${query}". Found 4 matching neural nodes connected through corporate history graph database index.`;
  let nodes = [
    { id: "1", label: "Project Titan Specs", type: "document" as const },
    { id: "2", label: "Team B Migration Thread", type: "email" as const },
    { id: "3", label: "Frankfurt API Logs", type: "server" as const },
    { id: "4", label: "Operational Risk Review", type: "meeting" as const }
  ];
  let links = [
    { source: "1", target: "2", type: "dependency_of" },
    { source: "2", target: "3", type: "caused_bottleneck" },
    { source: "3", target: "4", type: "flagged_in" }
  ];
  let timeline = [
    {
      id: "ev1",
      time: "2026-01-15T10:30:00Z",
      event: "Project Titan Launch",
      category: "Strategic" as const,
      summary: "Strategic roadmap configured. AI CEO approved dynamic development tracks."
    },
    {
      id: "ev2",
      time: "2026-03-04T16:45:12Z",
      event: "Frankfurt Cluster Migration",
      category: "Architecture" as const,
      summary: "CTO team migrated main database schemas to relational PostgreSQL cluster in Europe."
    },
    {
      id: "ev3",
      time: "2026-05-18T14:12:00Z",
      event: "Frankfurt Node Latency Spike",
      category: "Incident" as const,
      summary: "European database replication suffered a 180ms delay queue. Triggered automated fallback caches."
    },
    {
      id: "ev4",
      time: "2026-06-02T09:00:00Z",
      event: "Executive Boardroom Resolution",
      category: "Strategic" as const,
      summary: "Board approved elastic cache routing to mitigate further replication lag."
    }
  ];

  if (norm.includes("titan") || norm.includes("delay")) {
    findings = "Analysis of Project Titan delivery delay: Found database migration dependencies. API routes from Team B experienced schema mismatches with existing cloud connectors causing 68% delivery risk.";
  } else if (norm.includes("unauthorized") || norm.includes("cyber") || norm.includes("incident") || norm.includes("risk")) {
    findings = "Security timeline scan: 1 incident found under Frankfurt Node. Prompt validation sandbox flagged recursive query injections at 04:12 UTC. Intercepted by Protocol Alpha securely.";
    timeline[2] = {
      id: "ev3",
      time: "2026-05-18T04:12:00Z",
      event: "Malicious Prompt Query Blocked",
      category: "Incident" as const,
      summary: "Security sandboxing flagged and blocked 12 unauthorized automated vector lookup attempts."
    };
  }

  return {
    findings,
    nodes,
    links,
    timeline,
    isSimulated: true
  };
}

// Backend api routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// BOARDROOM ROLEPLAY DEBATE VIA GEMINI
app.post("/api/gemini/boardroom", async (req, res) => {
  const { scenario, topic } = req.body;
  const currentScenario = topic || scenario || "General Strategy Update";
  
  const client = getGeminiClient();
  if (!client) {
    console.log("No Gemini API key or configuration found. Serving simulated high-fidelity debate.");
    return res.json(getSimulatedDebate(currentScenario));
  }

  try {
    const prompt = `
      You are mimicking a high-tech corporate management simulation that operates on a network of 4 advanced specialized AIs:
      1. AETHER-01 (CEO): Visionary agent focused on hyper-scale strategic enterprise expansions. Set confidencePoints to be very high.
      2. SYNAPSE-X (CTO): Highly technical. Mentions API gateways, PostgreSQL clusters, LangGraph networks, vector DB databases, latency ms, caching, and database schemas.
      3. SENTINEL-9 (Risk Mitigation): Cautious, evaluates potential breaches, latency spikes, resource overruns, and database lockouts.
      4. FLUX-CAP (Operations Director): Worried about process optimization, resource limits, auto-scaling grids, computational costs, and token consumption rates.

      Develop a futuristic live strategic debate between these four personas regarding the business scenario: "${currentScenario}".
      Each agent should make 1 logically robust turn that moves the reasoning path forward.
      Represent your findings in high-fidelity computer language.

      You MUST respond STRICTLY with a valid JSON object matching the following TypeScript schema:
      {
        "debate": Array<{
          "agent": "AETHER-01" | "SYNAPSE-X" | "SENTINEL-9" | "FLUX-CAP",
          "text": string,
          "confidencePoints": number,
          "reasoningPath": string
        }>,
        "confidenceScore": number, // Overall debate confidence score (e.g. 92)
        "riskFactor": number, // Overall risk score from 0 to 100
        "resourceSync": number, // Overall synchronization % from 0 to 100
        "inferencePowerTflops": number, // Total current computing output (e.g., 840)
        "entropy": number // e.g. 0.0024
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are OMNISYNC AI, a state-of-the-art enterprise multi-agent management brain. Speak strategically and technically. You must output valid, parsing JSON strictly matching the requested structure.",
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ ...parsed, isSimulated: false });
  } catch (err: any) {
    console.error("Gemini boardroom generation failed, returning fallback:", err);
    res.json(getSimulatedDebate(currentScenario));
  }
});

// SCENARIO SIMULATION VIA GEMINI
app.post("/api/gemini/simulate-event", async (req, res) => {
  const { scenario } = req.body;
  const currentScenario = scenario || "300% Demand Surge";

  const client = getGeminiClient();
  if (!client) {
    console.log("No Gemini API key or configuration found. Serving simulated simulation statistics.");
    return res.json(getSimulatedSimulation(currentScenario));
  }

  try {
    const prompt = `
      Simulate a futuristic company trajectory under this scenario: "${currentScenario}".
      Produce high-tech enterprise metrics, 3 strategic recommendation pathways, and a revenue trajectory.
      
      You MUST respond STRICTLY with a valid JSON object matching the following TypeScript schema:
      {
        "revGrowthPercent": number, // E.g., positive or negative percentage of revenue impact (e.g. 142.8 or -35.2)
        "nodeClusteringOps": number, // Operations per second on our computer matrix (e.g., 8200000)
        "aiLatencyMs": number, // e.g., 14
        "trustRatio": number, // Decimal confidence value between 0.9000 and 0.9999
        "riskDeltaPercent": number, // Deviation delta on operational security risks (e.g. -0.04 or 4.5)
        "revenueForecast": Array<number>, // Exact array of precisely 9 decimal/integer values tracking monthly revenue trend simulation
        "recommendations": Array<{
          "path": "ALPHA" | "BETA" | "GAMMA",
          "title": string, // Actionable business headline
          "probability": number, // e.g., 0.84
          "description": string // Comprehensive explanation of this specific strategy
        }>,
        "timelineSimulationYear": number // e.g. 2028
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are the OMNISYNC Strategic Simulation Core. Calculate logical impacts and strategic path resolutions in clean, valid JSON format matching the schema exactly.",
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ ...parsed, isSimulated: false });
  } catch (err: any) {
    console.error("Gemini simulate failed, returning fallback:", err);
    res.json(getSimulatedSimulation(currentScenario));
  }
});

// MEMORY RETRIEVAL SEARCH VIA GEMINI
app.post("/api/gemini/memory-recall", async (req, res) => {
  const { query } = req.body;
  const searchQuery = query || "Titan specs";

  const client = getGeminiClient();
  if (!client) {
    console.log("No Gemini API key or configuration found. Serving simulated memory database timeline.");
    return res.json(getSimulatedMemory(searchQuery));
  }

  try {
    const prompt = `
      You are searching the semantic corporate archives of OMNISYNC AI for references matching: "${searchQuery}".
      Reconstruct corporate decisions, meetings, logs, or system incidents into a structured history map graph.
      
      You MUST respond STRICTLY with a valid JSON object matching the following TypeScript schema:
      {
        "findings": string, // Dynamic summary of the semantic search conclusions (e.g. \"Why is Project Titan delayed? ... \")
        "nodes": Array<{
          "id": string,
          "label": string,
          "type": "agent" | "document" | "db" | "meeting" | "server" | "email" | "task"
        }>,
        "links": Array<{
          "source": string, // source ID (e.g. \"1\")
          "target": string, // target ID (e.g. \"2\")
          "type": string // Relationship description (e.g. \"dependency_of\")
        }>,
        "timeline": Array<{
          "id": string,
          "time": string, // Standard ISO format or string time
          "event": string, // Actionable title of historical marker
          "category": "Strategic" | "Architecture" | "Risk" | "Operations" | "Incident",
          "summary": string // Summary description of what occurred
        }>
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are the OMNISYNC Semantic Memory indexing engine. Scan vector records and assemble relational history paths in clean, valid JSON matching the schema.",
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ ...parsed, isSimulated: false });
  } catch (err: any) {
    console.error("Gemini memory retrieval failed, returning fallback:", err);
    res.json(getSimulatedMemory(searchQuery));
  }
});

// Configure http server, WebSocket system, and static serving
async function startServer() {
  const server = http.createServer(app);

  // WebSocket Server Setup
  const wss = new WebSocketServer({ noServer: true });
  const activeClients = new Set<WebSocket>();

  server.on("upgrade", (request, sNode, head) => {
    const { pathname } = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
    if (pathname === "/ws" || pathname === "/") {
      wss.handleUpgrade(request, sNode, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      sNode.destroy();
    }
  });

  wss.on("connection", (ws) => {
    activeClients.add(ws);
    console.log(`[WEBSOCKET] Client connected. Active clients: ${activeClients.size}`);

    // Send server details handshake
    ws.send(JSON.stringify({
      type: "handshake",
      systemTime: new Date().toISOString(),
      activeNodes: 1248,
      status: "SYNCED"
    }));

    // Periodically push synthetic server telemetry to clients to simulate real-time operations
    const telemetryInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "telemetry",
          frequencyKhz: Number((4800 + Math.random() * 200).toFixed(2)),
          gpuTemp: Number((54 + Math.random() * 8).toFixed(1)),
          latencyMs: Math.floor(10 + Math.random() * 15)
        }));
      }
    }, 4000);

    ws.on("message", (msg) => {
      try {
        const payload = JSON.parse(msg.toString());
        if (payload.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", time: payload.time }));
        } else if (payload.type === "chat_broadcast") {
          // Broadcast to all active sockets
          const responsePayload = JSON.stringify({
            type: "chat_receive",
            agent: payload.agent || "ANONYMOUS",
            text: payload.text,
            timestamp: new Date().toLocaleTimeString().substring(0, 5)
          });
          for (const client of activeClients) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(responsePayload);
            }
          }
        }
      } catch (err) {
        console.error("Failed to parse socket packet:", err);
      }
    });

    ws.on("close", () => {
      activeClients.delete(ws);
      clearInterval(telemetryInterval);
      console.log(`[WEBSOCKET] Client disconnected. Remaining: ${activeClients.size}`);
    });
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Development Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Configuring Production Static Asset Serving Layer...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`OMNISYNC AI operating systems running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
