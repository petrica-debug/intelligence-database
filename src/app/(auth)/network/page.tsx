"use client";

import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { PageHeader, Card, Badge } from "@/components/ui";
import { useMemo, useRef, useEffect, useCallback, useState } from "react";

const COLORS: Record<string, string> = {
  person: "#1e3a5f", company: "#5b21b6", mobile: "#047857", address: "#b45309", vehicle: "#b91c1c",
};

const INFER_COLORS: Record<string, string> = {
  "shared-location": "#047857",
  "co-attendance": "#1e3a5f",
  "organizational": "#5b21b6",
  "social-proximity": "#b45309",
  "pattern-match": "#b91c1c",
  "behavioral": "#0891b2",
};

interface Node { id: number; x: number; y: number; vx: number; vy: number; name: string; category: string; hasSignal: boolean; }
interface Edge { source: number; target: number; inferred?: boolean; confidence?: number; inferCategory?: string; }

export default function NetworkPage() {
  const { db } = useApp();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<Node | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const [showInferred, setShowInferred] = useState(true);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ node: Node | null; offsetX: number; offsetY: number }>({ node: null, offsetX: 0, offsetY: 0 });

  const signalIds = useMemo(() => new Set(db.signals.map(s => s.entityId)), [db.signals]);

  const { nodes: initialNodes, edges } = useMemo(() => {
    const n: Node[] = db.entries.map((e, i) => {
      const angle = (2 * Math.PI * i) / db.entries.length;
      const r = Math.min(dimensions.w, dimensions.h) * 0.35;
      return {
        id: e.id, x: dimensions.w / 2 + r * Math.cos(angle), y: dimensions.h / 2 + r * Math.sin(angle),
        vx: 0, vy: 0, name: e.name, category: e.category, hasSignal: signalIds.has(e.id),
      };
    });
    const edgeSet = new Set<string>();
    const ed: Edge[] = [];
    db.entries.forEach((e) => {
      e.linkedTo.forEach((lid) => {
        const key = [Math.min(e.id, lid), Math.max(e.id, lid)].join("-");
        if (!edgeSet.has(key)) { edgeSet.add(key); ed.push({ source: e.id, target: lid }); }
      });
    });
    // Add inferred connections as dashed edges
    if (showInferred) {
      db.inferredConnections.filter(ic => ic.status !== "dismissed").forEach((ic) => {
        const key = [Math.min(ic.entityA, ic.entityB), Math.max(ic.entityA, ic.entityB)].join("-");
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          ed.push({ source: ic.entityA, target: ic.entityB, inferred: true, confidence: ic.confidence, inferCategory: ic.category });
        }
      });
    }
    return { nodes: n, edges: ed };
  }, [db.entries, db.inferredConnections, dimensions, signalIds, showInferred]);

  useEffect(() => {
    nodesRef.current = initialNodes.map((n) => ({ ...n }));
    edgesRef.current = edges;
  }, [initialNodes, edges]);

  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) setDimensions({ w: container.clientWidth, h: Math.max(500, container.clientHeight) });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const ed = edgesRef.current;
    const cx = dimensions.w / 2, cy = dimensions.h / 2;

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].vx += (cx - nodes[i].x) * 0.001;
      nodes[i].vy += (cy - nodes[i].y) * 0.001;

      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = 800 / (dist * dist);
        nodes[i].vx -= dx / dist * force;
        nodes[i].vy -= dy / dist * force;
        nodes[j].vx += dx / dist * force;
        nodes[j].vy += dy / dist * force;
      }
    }

    ed.forEach((e) => {
      const s = nodes.find((n) => n.id === e.source);
      const t = nodes.find((n) => n.id === e.target);
      if (!s || !t) return;
      const dx = t.x - s.x, dy = t.y - s.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const idealDist = e.inferred ? 160 : 120;
      const force = (dist - idealDist) * (e.inferred ? 0.003 : 0.005);
      s.vx += dx / dist * force;
      s.vy += dy / dist * force;
      t.vx -= dx / dist * force;
      t.vy -= dy / dist * force;
    });

    nodes.forEach((n) => {
      if (dragRef.current.node?.id === n.id) return;
      n.vx *= 0.85; n.vy *= 0.85;
      n.x += n.vx; n.y += n.vy;
      n.x = Math.max(30, Math.min(dimensions.w - 30, n.x));
      n.y = Math.max(30, Math.min(dimensions.h - 30, n.y));
    });
  }, [dimensions]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const nodes = nodesRef.current;
    const ed = edgesRef.current;

    ctx.clearRect(0, 0, dimensions.w, dimensions.h);

    // Fill background
    ctx.fillStyle = "#f5f7fa";
    ctx.fillRect(0, 0, dimensions.w, dimensions.h);

    // Draw edges
    ed.forEach((e) => {
      const s = nodes.find((n) => n.id === e.source);
      const t = nodes.find((n) => n.id === e.target);
      if (!s || !t) return;
      const isHighlighted = hovered && (hovered.id === s.id || hovered.id === t.id);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);

      if (e.inferred) {
        // Dashed line for inferred connections
        ctx.setLineDash([6, 4]);
        const inferColor = INFER_COLORS[e.inferCategory || ""] || "#0891b2";
        ctx.strokeStyle = isHighlighted ? inferColor + "cc" : inferColor + "50";
        ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = isHighlighted ? "rgba(30,58,95,0.5)" : "rgba(208,217,230,0.8)";
        ctx.lineWidth = isHighlighted ? 2 : 1;
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw confidence label on inferred edges when hovered
      if (e.inferred && isHighlighted && e.confidence) {
        const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2;
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.fillStyle = INFER_COLORS[e.inferCategory || ""] || "#0891b2";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.round(e.confidence)}%`, mx, my - 4);
      }
    });

    // Draw nodes
    nodes.forEach((n) => {
      const isHovered = hovered?.id === n.id;
      const isConnected = hovered && ed.some((e) => (e.source === hovered.id && e.target === n.id) || (e.target === hovered.id && e.source === n.id));
      const radius = isHovered ? 14 : isConnected ? 11 : 8;
      const color = COLORS[n.category] || "#1e3a5f";

      // Signal glow (pulsing amber ring)
      if (n.hasSignal) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = "#f59e0b80";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 10, 0, Math.PI * 2);
        ctx.strokeStyle = "#f59e0b30";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Hover/connection glow
      if (isHovered || isConnected) {
        const gradient = ctx.createRadialGradient(n.x, n.y, radius, n.x, n.y, radius + 8);
        gradient.addColorStop(0, color + "30");
        gradient.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? color : color + "cc";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      if (isHovered || isConnected) {
        ctx.font = `${isHovered ? "bold 12px" : "11px"} Inter, sans-serif`;
        ctx.fillStyle = "#0f1b2d";
        ctx.textAlign = "center";
        ctx.fillText(n.name, n.x, n.y - radius - (n.hasSignal ? 14 : 8));
      }
    });
  }, [dimensions, hovered]);

  useEffect(() => {
    const loop = () => {
      simulate();
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [simulate, draw]);

  const getNodeAt = (x: number, y: number): Node | null => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const dx = nodes[i].x - x, dy = nodes[i].y - y;
      if (Math.sqrt(dx * dx + dy * dy) < 14) return nodes[i];
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (dragRef.current.node) {
      dragRef.current.node.x = x;
      dragRef.current.node.y = y;
      dragRef.current.node.vx = 0;
      dragRef.current.node.vy = 0;
      return;
    }
    const node = getNodeAt(x, y);
    setHovered(node);
    if (canvasRef.current) canvasRef.current.style.cursor = node ? "pointer" : "default";
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const node = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
    if (node) dragRef.current = { node, offsetX: 0, offsetY: 0 };
  };

  const handleMouseUp = () => { dragRef.current = { node: null, offsetX: 0, offsetY: 0 }; };

  const handleDblClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const node = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
    if (node) router.push(`/entry/${node.id}`);
  };

  const inferredCount = db.inferredConnections.filter(ic => ic.status !== "dismissed").length;

  return (
    <>
      <PageHeader title="Network Graph" description="Interactive entity relationship visualization. Drag nodes to rearrange. Double-click to view details." />
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-4 flex-wrap">
          {Object.entries(COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-2 text-[12px] text-text-2">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </div>
          ))}
          <div className="flex items-center gap-2 text-[12px] text-amber">
            <div className="w-3 h-3 rounded-full border-2 border-amber bg-amber/20" />
            Signal Watch
          </div>
        </div>
        <button
          onClick={() => setShowInferred(!showInferred)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
            showInferred
              ? "bg-accent/8 text-accent border-accent/20"
              : "bg-surface-2 text-text-3 border-border"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" /></svg>
          {showInferred ? `Inferred (${inferredCount})` : "Show Inferred"}
        </button>
      </div>
      <Card className="p-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={dimensions.w}
          height={dimensions.h}
          className="w-full rounded-xl"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDblClick}
        />
      </Card>
      {hovered && (
        <Card className="mt-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[hovered.category] }} />
            <span className="font-semibold">{hovered.name}</span>
            <Badge variant={hovered.category as never}>{hovered.category}</Badge>
            {hovered.hasSignal && (
              <span className="px-1.5 py-0.5 rounded bg-amber/10 text-amber text-[8px] font-bold animate-pulse-glow">SIGNAL</span>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
