"use client";

import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { PageHeader, Card, Badge } from "@/components/ui";
import { useMemo, useRef, useEffect, useCallback, useState } from "react";

const COLORS: Record<string, string> = {
  person: "#4f7cff", company: "#8b5cf6", mobile: "#10b981", address: "#f59e0b", vehicle: "#ef4444",
};

interface Node { id: number; x: number; y: number; vx: number; vy: number; name: string; category: string; }
interface Edge { source: number; target: number; }

export default function NetworkPage() {
  const { db } = useApp();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<Node | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ node: Node | null; offsetX: number; offsetY: number }>({ node: null, offsetX: 0, offsetY: 0 });

  const { nodes: initialNodes, edges } = useMemo(() => {
    const n: Node[] = db.entries.map((e, i) => {
      const angle = (2 * Math.PI * i) / db.entries.length;
      const r = Math.min(dimensions.w, dimensions.h) * 0.35;
      return {
        id: e.id, x: dimensions.w / 2 + r * Math.cos(angle), y: dimensions.h / 2 + r * Math.sin(angle),
        vx: 0, vy: 0, name: e.name, category: e.category,
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
    return { nodes: n, edges: ed };
  }, [db.entries, dimensions]);

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

    // Force simulation
    for (let i = 0; i < nodes.length; i++) {
      // Center gravity
      nodes[i].vx += (cx - nodes[i].x) * 0.001;
      nodes[i].vy += (cy - nodes[i].y) * 0.001;

      // Repulsion
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

    // Spring force for edges
    ed.forEach((e) => {
      const s = nodes.find((n) => n.id === e.source);
      const t = nodes.find((n) => n.id === e.target);
      if (!s || !t) return;
      const dx = t.x - s.x, dy = t.y - s.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist - 120) * 0.005;
      s.vx += dx / dist * force;
      s.vy += dy / dist * force;
      t.vx -= dx / dist * force;
      t.vy -= dy / dist * force;
    });

    // Update positions
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

    // Draw edges
    ed.forEach((e) => {
      const s = nodes.find((n) => n.id === e.source);
      const t = nodes.find((n) => n.id === e.target);
      if (!s || !t) return;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = hovered && (hovered.id === s.id || hovered.id === t.id) ? "rgba(79,124,255,0.5)" : "rgba(38,45,69,0.6)";
      ctx.lineWidth = hovered && (hovered.id === s.id || hovered.id === t.id) ? 2 : 1;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((n) => {
      const isHovered = hovered?.id === n.id;
      const isConnected = hovered && ed.some((e) => (e.source === hovered.id && e.target === n.id) || (e.target === hovered.id && e.source === n.id));
      const radius = isHovered ? 14 : isConnected ? 11 : 8;
      const color = COLORS[n.category] || "#4f7cff";

      // Glow
      if (isHovered || isConnected) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(")", ",0.15)").replace("rgb", "rgba").replace("#", "");
        const gradient = ctx.createRadialGradient(n.x, n.y, radius, n.x, n.y, radius + 8);
        gradient.addColorStop(0, color + "30");
        gradient.addColorStop(1, "transparent");
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
        ctx.fillStyle = "#eaedf3";
        ctx.textAlign = "center";
        ctx.fillText(n.name, n.x, n.y - radius - 8);
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

  return (
    <>
      <PageHeader title="Network Graph" description="Interactive entity relationship visualization. Drag nodes to rearrange. Double-click to view details." />
      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.entries(COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-2 text-[12px] text-text-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </div>
        ))}
      </div>
      <Card className="p-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={dimensions.w}
          height={dimensions.h}
          className="w-full bg-bg-2 rounded-xl"
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
          </div>
        </Card>
      )}
    </>
  );
}
