"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { PageHeader, Card, Badge, Button, Input, useToast } from "@/components/ui";
import { RotateCcw, Search } from "lucide-react";

export default function ReverseSearchPage() {
  const { db, currentUser, updateDb } = useApp();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  if (currentUser?.role !== "admin") return <Card><p className="text-red text-center py-8">Access denied. Admin only.</p></Card>;

  const results = searched ? db.logs.filter((l) => l.detail.toLowerCase().includes(query.toLowerCase())) : [];
  const userMap = new Map<string, typeof results>();
  results.forEach((r) => { const arr = userMap.get(r.user) || []; arr.push(r); userMap.set(r.user, arr); });

  const handleSearch = () => {
    if (!query.trim()) return;
    updateDb((d) => { d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: "REVERSE_SEARCH", detail: `Reverse search: "${query}"` }); });
    setSearched(true);
    toast("Reverse search completed.", "success");
  };

  return (
    <>
      <PageHeader title="Reverse Search" description="Find which users have ever searched for or accessed a specific entity" />
      <Card className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <RotateCcw size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3" />
            <input type="text" placeholder="Enter name, number, or keyword..." value={query}
              onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-2 border border-border rounded-lg text-text text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-text-3" />
          </div>
          <Button onClick={handleSearch}><Search size={14} /> Search</Button>
        </div>
      </Card>
      {searched && (
        <div className="animate-fade-in">
          <p className="text-sm text-text-2 mb-4">{results.length} records across {userMap.size} user(s)</p>
          {results.length === 0 ? <Card><p className="text-text-3 text-center py-8">No activity found.</p></Card> : (
            Array.from(userMap.entries()).map(([user, logs]) => (
              <Card key={user} className="mb-4">
                <h3 className="text-[15px] font-semibold mb-3">User: {user} <span className="text-text-3 font-normal">({logs.length} actions)</span></h3>
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border">{["Time","Action","Detail"].map((h) => <th key={h} className="text-left text-[11px] font-medium text-text-3 uppercase tracking-wider pb-3 pr-4">{h}</th>)}</tr></thead>
                <tbody>{logs.map((l, i) => (
                  <tr key={i} className="border-b border-border/50"><td className="py-2 pr-4 text-[12px] text-text-3 whitespace-nowrap">{formatDate(l.ts)}</td><td className="py-2 pr-4"><Badge variant="info">{l.action}</Badge></td><td className="py-2 text-[13px] text-text-2">{l.detail}</td></tr>
                ))}</tbody></table></div>
              </Card>
            ))
          )}
        </div>
      )}
    </>
  );
}
