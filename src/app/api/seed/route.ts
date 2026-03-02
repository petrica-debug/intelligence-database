import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSeedData } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { authorization } = Object.fromEntries(request.headers);
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey || authorization !== `Bearer ${serviceKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );

    const seed = getSeedData();

    const { count } = await supabase.from("entries").select("*", { count: "exact", head: true });
    if (count && count > 0) {
      return NextResponse.json({ message: "Database already seeded", count });
    }

    const entries = seed.entries.map((e) => ({
      id: e.id,
      category: e.category,
      name: e.name,
      context: e.context,
      narrative: e.narrative,
      created_by: e.createdBy,
      created_at: e.createdAt,
      country: e.country || null,
      tags: e.tags || [],
      sensitivity: e.sensitivity || "standard",
    }));

    const { error: entryError } = await supabase.from("entries").insert(entries);
    if (entryError) return NextResponse.json({ error: `Entries: ${entryError.message}` }, { status: 500 });

    const linkSet = new Set<string>();
    const links: { entry_a: number; entry_b: number }[] = [];
    for (const entry of seed.entries) {
      for (const targetId of entry.linkedTo) {
        const a = Math.min(entry.id, targetId);
        const b = Math.max(entry.id, targetId);
        const key = `${a}-${b}`;
        if (!linkSet.has(key)) {
          linkSet.add(key);
          links.push({ entry_a: a, entry_b: b });
        }
      }
    }
    if (links.length > 0) {
      const { error: linkError } = await supabase.from("entry_links").insert(links);
      if (linkError) return NextResponse.json({ error: `Links: ${linkError.message}` }, { status: 500 });
    }

    const reports = seed.reports.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      date: r.date,
      location: r.location || null,
      attendees: r.attendees,
      external_attendees: r.externalAttendees,
      sections: r.sections,
      tags: r.tags,
      linked_entities: r.linkedEntities,
      created_by: r.createdBy,
      created_at: r.createdAt,
      overall_sensitivity: r.overallSensitivity,
      status: r.status,
    }));
    if (reports.length > 0) {
      const { error: reportError } = await supabase.from("reports").insert(reports);
      if (reportError) return NextResponse.json({ error: `Reports: ${reportError.message}` }, { status: 500 });
    }

    const connections = seed.inferredConnections.map((c) => ({
      id: c.id,
      entity_a: c.entityA,
      entity_b: c.entityB,
      confidence: c.confidence,
      reason: c.reason,
      category: c.category,
      evidence: c.evidence,
      created_at: c.createdAt,
      status: c.status,
    }));
    if (connections.length > 0) {
      const { error: connError } = await supabase.from("inferred_connections").insert(connections);
      if (connError) return NextResponse.json({ error: `Connections: ${connError.message}` }, { status: 500 });
    }

    const validations = seed.pendingValidations.map((v) => ({
      id: v.id,
      entry_id: v.entryId,
      target_name: v.targetName,
      suggested_link: v.suggestedLink,
      suggested_link_id: v.suggestedLinkId,
      submitted_by: v.submittedBy,
      submitted_at: v.submittedAt,
      reason: v.reason,
      resolved: v.resolved || false,
      approved: v.approved || null,
    }));
    if (validations.length > 0) {
      const { error: valError } = await supabase.from("pending_validations").insert(validations);
      if (valError) return NextResponse.json({ error: `Validations: ${valError.message}` }, { status: 500 });
    }

    const signals = seed.signals.map((s) => ({
      entity_id: s.entityId,
      entity_name: s.entityName,
      set_by: s.setBy,
      set_at: s.setAt,
    }));
    if (signals.length > 0) {
      const { error: sigError } = await supabase.from("signals").insert(signals);
      if (sigError) return NextResponse.json({ error: `Signals: ${sigError.message}` }, { status: 500 });
    }

    const logs = seed.logs.map((l) => ({
      ts: l.ts,
      username: l.user,
      action: l.action,
      detail: l.detail,
    }));
    if (logs.length > 0) {
      const { error: logError } = await supabase.from("logs").insert(logs);
      if (logError) return NextResponse.json({ error: `Logs: ${logError.message}` }, { status: 500 });
    }

    const notifications = seed.notifications.map((n) => ({
      message: n.message,
      for_user: n.forUser,
      ts: n.ts,
      read: n.read,
    }));
    if (notifications.length > 0) {
      const { error: notifError } = await supabase.from("notifications").insert(notifications);
      if (notifError) return NextResponse.json({ error: `Notifications: ${notifError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      seeded: {
        entries: entries.length,
        links: links.length,
        reports: reports.length,
        connections: connections.length,
        validations: validations.length,
        signals: signals.length,
        logs: logs.length,
        notifications: notifications.length,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
