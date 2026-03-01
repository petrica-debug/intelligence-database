"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, GlassCard, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Globe, ArrowRight, Link2, Users, Building2, Radio } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

// Country ISO codes for map highlighting
const COUNTRY_ISO: Record<string, string> = {
  Romania: "642", Bulgaria: "100", Hungary: "348", "Czech Republic": "203",
};

// Map coordinates for markers and lines
const COUNTRY_COORDS: Record<string, [number, number]> = {
  Romania: [25.0, 46.0],
  Bulgaria: [25.5, 42.7],
  Hungary: [19.5, 47.2],
  "Czech Republic": [15.5, 49.8],
  International: [4.4, 50.8], // Brussels
};

const COUNTRY_FILL: Record<string, string> = {
  Romania: "#1e3a5f", Bulgaria: "#047857", Hungary: "#b91c1c",
  "Czech Republic": "#5b21b6", International: "#b45309",
};

const COUNTRY_META: Record<string, { flag: string; code: string }> = {
  Romania: { flag: "\u{1F1F7}\u{1F1F4}", code: "RO" },
  Bulgaria: { flag: "\u{1F1E7}\u{1F1EC}", code: "BG" },
  Hungary: { flag: "\u{1F1ED}\u{1F1FA}", code: "HU" },
  "Czech Republic": { flag: "\u{1F1E8}\u{1F1FF}", code: "CZ" },
  International: { flag: "\u{1F310}", code: "INT" },
};

const COUNTRIES = ["Romania", "Bulgaria", "Hungary", "Czech Republic", "International"];

export default function GeoPage() {
  const { db } = useApp();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const countryStats = useMemo(() => COUNTRIES.map((c) => {
    const entries = db.entries.filter((e) => e.country === c);
    return {
      country: c,
      total: entries.length,
      persons: entries.filter((e) => e.category === "person").length,
      orgs: entries.filter((e) => e.category === "company").length,
      links: entries.reduce((s, e) => s + e.linkedTo.length, 0),
      signals: db.signals.filter((s) => entries.some((e) => e.id === s.entityId)).length,
      entries,
    };
  }), [db.entries, db.signals]);

  // Cross-border connections for map lines
  const crossBorder = useMemo(() => {
    const connections = db.entries.flatMap((e) =>
      e.linkedTo.map((lid) => {
        const linked = db.entries.find((x) => x.id === lid);
        if (!linked || !e.country || !linked.country || e.country === linked.country) return null;
        return { from: e.country, to: linked.country, fromName: e.name, toName: linked.name };
      }).filter(Boolean)
    );

    const unique = new Map<string, { from: string; to: string; count: number; pairs: string[] }>();
    connections.forEach((c) => {
      if (!c) return;
      const key = [c.from, c.to].sort().join("-");
      const existing = unique.get(key) || { from: c.from, to: c.to, count: 0, pairs: [] };
      existing.count++;
      const pair = `${c.fromName} \u2194 ${c.toName}`;
      if (!existing.pairs.includes(pair)) existing.pairs.push(pair);
      unique.set(key, existing);
    });
    return unique;
  }, [db.entries]);

  const selectedData = selected ? countryStats.find((c) => c.country === selected) : null;

  return (
    <>
      <PageHeader title="Geographic Intelligence" description="Interactive map with cross-border network analysis" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Map Panel */}
        <div className="xl:col-span-2 rounded-2xl border border-border/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-accent" />
              <h3 className="text-[12px] font-semibold text-text-2 uppercase tracking-wider">European Network Map</h3>
            </div>
            <div className="flex items-center gap-3">
              {COUNTRIES.filter(c => c !== "International").map((c) => (
                <div key={c} className="flex items-center gap-1.5 text-[10px] text-text-3 font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COUNTRY_FILL[c] }} />
                  {COUNTRY_META[c].code}
                </div>
              ))}
            </div>
          </div>
          <div className="relative" style={{ background: "linear-gradient(180deg, #f0f4f8 0%, #e4ebf3 100%)" }}>
            <ComposableMap
              projection="geoAzimuthalEqualArea"
              projectionConfig={{
                rotate: [-20, -52, 0],
                scale: 900,
                center: [0, 0],
              }}
              width={700}
              height={440}
              style={{ width: "100%", height: "auto" }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const isoNum = geo.id;
                    const countryName = Object.keys(COUNTRY_ISO).find(
                      (k) => COUNTRY_ISO[k] === isoNum
                    );
                    const isHighlighted = !!countryName;
                    const isSelected = selected === countryName;
                    const isHovered = hoveredCountry === countryName;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => {
                          if (countryName) {
                            setSelected(selected === countryName ? null : countryName);
                          }
                        }}
                        onMouseEnter={() => countryName && setHoveredCountry(countryName)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        style={{
                          default: {
                            fill: isSelected
                              ? COUNTRY_FILL[countryName!]
                              : isHighlighted
                              ? `${COUNTRY_FILL[countryName!]}88`
                              : "#dce4ef",
                            stroke: isHighlighted ? COUNTRY_FILL[countryName!] : "#c5cdd8",
                            strokeWidth: isHighlighted ? 1.2 : 0.4,
                            outline: "none",
                            cursor: isHighlighted ? "pointer" : "default",
                            transition: "fill 0.2s",
                          },
                          hover: {
                            fill: isHighlighted
                              ? COUNTRY_FILL[countryName!]
                              : "#d0d9e6",
                            stroke: isHighlighted ? COUNTRY_FILL[countryName!] : "#b8c4d4",
                            strokeWidth: isHighlighted ? 1.5 : 0.5,
                            outline: "none",
                            cursor: isHighlighted ? "pointer" : "default",
                          },
                          pressed: {
                            fill: isHighlighted
                              ? COUNTRY_FILL[countryName!]
                              : "#c5cdd8",
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Connection lines between countries */}
              {Array.from(crossBorder.values()).map((conn, i) => {
                const fromCoords = COUNTRY_COORDS[conn.from];
                const toCoords = COUNTRY_COORDS[conn.to];
                if (!fromCoords || !toCoords) return null;
                const opacity = Math.min(0.7, 0.15 + conn.count * 0.03);
                const width = Math.min(3, 0.8 + conn.count * 0.1);
                return (
                  <Line
                    key={i}
                    from={fromCoords}
                    to={toCoords}
                    stroke="#b45309"
                    strokeWidth={width}
                    strokeLinecap="round"
                    strokeOpacity={opacity}
                    strokeDasharray="4 2"
                  />
                );
              })}

              {/* Country markers with entity counts */}
              {countryStats.filter(cs => COUNTRY_COORDS[cs.country]).map((cs) => {
                const coords = COUNTRY_COORDS[cs.country];
                const isSelected = selected === cs.country;
                const isInt = cs.country === "International";
                const r = Math.max(14, Math.min(26, 10 + cs.total * 1.2));
                return (
                  <Marker
                    key={cs.country}
                    coordinates={coords}
                    onClick={() => setSelected(selected === cs.country ? null : cs.country)}
                  >
                    {/* Pulse ring for selected */}
                    {isSelected && (
                      <circle r={r + 6} fill="none" stroke={COUNTRY_FILL[cs.country]} strokeWidth={2} opacity={0.3}>
                        <animate attributeName="r" from={r + 4} to={r + 14} dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from={0.4} to={0} dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      r={r}
                      fill={COUNTRY_FILL[cs.country]}
                      stroke="#fff"
                      strokeWidth={2.5}
                      style={{ cursor: "pointer", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                      opacity={isSelected ? 1 : 0.9}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: r > 18 ? "12px" : "10px",
                        fontWeight: 700,
                        fill: "#fff",
                        pointerEvents: "none",
                      }}
                    >
                      {cs.total}
                    </text>
                    {/* Country label below marker */}
                    <text
                      y={r + 14}
                      textAnchor="middle"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "9px",
                        fontWeight: 600,
                        fill: "#3e5068",
                        pointerEvents: "none",
                      }}
                    >
                      {isInt ? "Brussels/Int'l" : cs.country}
                    </text>
                  </Marker>
                );
              })}
            </ComposableMap>

            {/* Hover tooltip */}
            {hoveredCountry && !selected && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl border border-border/60 p-3 shadow-lg animate-fade-in pointer-events-none">
                <div className="text-[12px] font-bold text-text mb-1">
                  {COUNTRY_META[hoveredCountry]?.flag} {hoveredCountry}
                </div>
                {(() => {
                  const stats = countryStats.find(c => c.country === hoveredCountry);
                  if (!stats) return null;
                  return (
                    <div className="text-[10px] text-text-3 space-y-0.5">
                      <div>{stats.total} entities</div>
                      <div>{stats.persons} persons &middot; {stats.orgs} orgs</div>
                      <div>{stats.links} links</div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Country Details */}
        <div className="space-y-3">
          {/* Country list */}
          {countryStats.map((cs) => {
            const meta = COUNTRY_META[cs.country];
            const isSelected = selected === cs.country;
            return (
              <div
                key={cs.country}
                onClick={() => setSelected(isSelected ? null : cs.country)}
                className={cn(
                  "rounded-2xl border p-4 cursor-pointer transition-all duration-200",
                  isSelected
                    ? "bg-accent text-white border-accent shadow-lg shadow-accent/15"
                    : "bg-white border-border/60 hover:border-border hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meta.flag}</span>
                    <span className={cn("text-[13px] font-semibold", isSelected ? "text-white" : "text-text")}>{cs.country}</span>
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                    isSelected ? "bg-white/20 text-white" : "bg-surface-2 text-text-3"
                  )}>{meta.code}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className={cn("text-2xl font-bold", !isSelected && "text-text")}>{cs.total}</div>
                  <div className={cn("text-[10px] text-right space-y-0.5", isSelected ? "text-white/60" : "text-text-3")}>
                    <div className="flex items-center gap-1 justify-end"><Users size={9} /> {cs.persons} persons</div>
                    <div className="flex items-center gap-1 justify-end"><Building2 size={9} /> {cs.orgs} orgs</div>
                    <div className="flex items-center gap-1 justify-end"><Link2 size={9} /> {cs.links} links</div>
                  </div>
                </div>
                {cs.signals > 0 && (
                  <div className={cn("text-[10px] mt-2 font-semibold flex items-center gap-1",
                    isSelected ? "text-white" : "text-amber"
                  )}>
                    <Radio size={9} className="animate-pulse-glow" /> {cs.signals} active signal{cs.signals > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Border Connections */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-amber" />
          <h3 className="text-[12px] font-semibold text-text-2 uppercase tracking-wider flex items-center gap-2">
            <Globe size={14} /> Cross-Border Connections ({crossBorder.size})
          </h3>
        </div>
        {crossBorder.size === 0 ? (
          <p className="text-text-3 text-sm text-center py-4">No cross-border connections detected.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {Array.from(crossBorder.values()).map((conn, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-surface-2/30 p-3 hover:bg-surface-2/60 transition-all duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{COUNTRY_META[conn.from]?.flag}</span>
                  <div className="flex-1 h-px bg-border relative">
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center">
                      <span className="bg-white px-2 text-[10px] text-amber font-bold">{conn.count} link{conn.count > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <span className="text-lg">{COUNTRY_META[conn.to]?.flag}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {conn.pairs.slice(0, 3).map((p, j) => (
                    <span key={j} className="text-[10px] text-text-2 bg-surface-3 px-2 py-0.5 rounded-md">{p}</span>
                  ))}
                  {conn.pairs.length > 3 && (
                    <span className="text-[10px] text-text-3 font-medium">+{conn.pairs.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Selected Country Drill-Down */}
      {selectedData && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full" style={{ background: COUNTRY_FILL[selectedData.country] }} />
            <h3 className="text-[16px] font-bold flex items-center gap-2">
              <span className="text-xl">{COUNTRY_META[selectedData.country]?.flag}</span>
              {selectedData.country} \u2014 {selectedData.total} Entities
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedData.entries.map((entry) => (
              <GlassCard
                key={entry.id}
                className="cursor-pointer hover:border-accent/40 py-3"
                onClick={() => router.push(`/entry/${entry.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Badge variant={entry.category as never}>{entry.category}</Badge>
                    <span className="text-[13px] font-semibold">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.context as never}>{entry.context}</Badge>
                    <span className="text-[10px] text-text-3 flex items-center gap-1">
                      <Link2 size={9} /> {entry.linkedTo.length}
                    </span>
                    <ArrowRight size={12} className="text-text-3" />
                  </div>
                </div>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 ml-[72px]">
                    {entry.tags.map((t) => (
                      <span key={t} className="text-[9px] text-text-3 bg-surface-3 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
