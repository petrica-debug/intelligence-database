"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Badge, Button, Input, Select, useToast } from "@/components/ui";
import { UserPlus, Shield, Ban } from "lucide-react";
import type { AccessLevel, ClearanceLevel } from "@/types";
import { CLEARANCE_LABELS } from "@/types";

export default function UsersPage() {
  const { db, currentUser, updateDb } = useApp();
  const { toast } = useToast();
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newAccess, setNewAccess] = useState<AccessLevel>("basic");
  const [newClearance, setNewClearance] = useState<ClearanceLevel>(1);
  const [newFullName, setNewFullName] = useState("");
  const [newDept, setNewDept] = useState("Field Operations");

  if (currentUser?.role !== "admin") return <Card><p className="text-red text-center py-8">Access denied. Admin only.</p></Card>;

  const addUser = () => {
    if (!newUser.trim() || !newPass.trim()) { toast("Fill in username and password.", "warning"); return; }
    if (db.users.some((u) => u.username === newUser.trim())) { toast("Username exists.", "error"); return; }
    updateDb((d) => {
      d.users.push({
        username: newUser.trim(),
        password: newPass.trim(),
        role: "user",
        access: newAccess,
        clearance: newClearance,
        active: true,
        fullName: newFullName.trim() || newUser.trim(),
        department: newDept,
      });
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: "USER_CREATE", detail: `Created user: ${newUser.trim()} (L${newClearance}, ${newAccess})` });
    });
    setNewUser(""); setNewPass(""); setNewAccess("basic"); setNewClearance(1); setNewFullName(""); setNewDept("Field Operations");
    toast("User created.", "success");
  };

  const toggleActive = (username: string) => {
    if (username === "admin") return;
    updateDb((d) => {
      const user = d.users.find((u) => u.username === username);
      if (!user) return;
      user.active = !user.active;
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: user.active ? "USER_ENABLE" : "USER_DISABLE", detail: `${user.active ? "Enabled" : "Disabled"}: ${username}` });
    });
    toast("User status updated.", "info");
  };

  const changeAccess = (username: string, access: AccessLevel) => {
    updateDb((d) => {
      const user = d.users.find((u) => u.username === username);
      if (!user) return;
      user.access = access;
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: "ACCESS_CHANGE", detail: `Changed ${username} to ${access}` });
    });
    toast("Access level updated.", "success");
  };

  const changeClearance = (username: string, clearance: ClearanceLevel) => {
    updateDb((d) => {
      const user = d.users.find((u) => u.username === username);
      if (!user) return;
      user.clearance = clearance;
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: "CLEARANCE_CHANGE", detail: `Changed ${username} clearance to L${clearance} (${CLEARANCE_LABELS[clearance]})` });
    });
    toast("Clearance level updated.", "success");
  };

  return (
    <>
      <PageHeader title="User Management" description="Manage users, access levels, clearance, and account status" />
      <Card className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-text-2 uppercase tracking-wider">Add New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end mb-3">
          <Input label="Username" value={newUser} onChange={(e) => setNewUser(e.target.value)} placeholder="username" />
          <Input label="Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="password" />
          <Input label="Full Name" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="Display name" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <Select label="Access" value={newAccess} onChange={(e) => setNewAccess(e.target.value as AccessLevel)} options={[{ value: "basic", label: "Basic" }, { value: "full", label: "Full" }]} />
          <Select label="Clearance" value={String(newClearance)} onChange={(e) => setNewClearance(Number(e.target.value) as ClearanceLevel)}
            options={([1, 2, 3, 4, 5] as ClearanceLevel[]).map((c) => ({ value: String(c), label: `L${c} — ${CLEARANCE_LABELS[c]}` }))} />
          <Select label="Department" value={newDept} onChange={(e) => setNewDept(e.target.value)}
            options={[
              { value: "Field Operations", label: "Field Operations" },
              { value: "Intelligence", label: "Intelligence" },
              { value: "Executive", label: "Executive" },
              { value: "Research", label: "Research" },
            ]} />
          <Button onClick={addUser}><UserPlus size={14} /> Add User</Button>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold mb-4 text-text-2 uppercase tracking-wider">Users ({db.users.length})</h3>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border">{["User","Role","Access","Clearance","Dept","Status","Actions"].map((h) => <th key={h} className="text-left text-[11px] font-medium text-text-3 uppercase tracking-wider pb-3 pr-4">{h}</th>)}</tr></thead>
        <tbody>{db.users.map((u) => (
          <tr key={u.username} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
            <td className="py-3 pr-4"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-[11px] font-bold">{u.username[0].toUpperCase()}</div><div><span className="text-[13px] font-medium block">{u.fullName || u.username}</span><span className="text-[10px] text-text-3">{u.username}</span></div></div></td>
            <td className="py-3 pr-4"><Badge variant={u.role === "admin" ? "info" : "default"}>{u.role}</Badge></td>
            <td className="py-3 pr-4">{u.role === "admin" ? <Badge variant="approved">full</Badge> : (
              <select value={u.access} onChange={(e) => changeAccess(u.username, e.target.value as AccessLevel)}
                className="bg-surface-2 border border-border rounded-md text-text text-[12px] px-2 py-1 outline-none cursor-pointer">
                <option value="basic">Basic</option><option value="full">Full</option>
              </select>
            )}</td>
            <td className="py-3 pr-4">{u.role === "admin" ? <Badge variant="info">L5</Badge> : (
              <select value={String(u.clearance ?? 1)} onChange={(e) => changeClearance(u.username, Number(e.target.value) as ClearanceLevel)}
                className="bg-surface-2 border border-border rounded-md text-text text-[12px] px-2 py-1 outline-none cursor-pointer">
                {([1, 2, 3, 4, 5] as ClearanceLevel[]).map((c) => <option key={c} value={String(c)}>L{c}</option>)}
              </select>
            )}</td>
            <td className="py-3 pr-4 text-[12px] text-text-2">{u.department || "—"}</td>
            <td className="py-3 pr-4"><Badge variant={u.active ? "approved" : "rejected"}>{u.active ? "Active" : "Disabled"}</Badge></td>
            <td className="py-3">{u.username !== "admin" && (
              <Button size="sm" variant={u.active ? "danger" : "success"} onClick={() => toggleActive(u.username)}>
                {u.active ? <><Ban size={12} /> Disable</> : <><Shield size={12} /> Enable</>}
              </Button>
            )}</td>
          </tr>
        ))}</tbody></table></div>
      </Card>
    </>
  );
}
