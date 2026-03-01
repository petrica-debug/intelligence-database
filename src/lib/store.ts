import type { Database } from "@/types";

const STORAGE_KEY = "inteldb_data";

const seedData: () => Database = () => ({
  users: [
    {
      username: "admin",
      password: "admin",
      role: "admin",
      access: "full",
      active: true,
    },
    {
      username: "analyst1",
      password: "analyst1",
      role: "user",
      access: "full",
      active: true,
    },
    {
      username: "agent1",
      password: "agent1",
      role: "user",
      access: "basic",
      active: true,
    },
  ],
  entries: [
    {
      id: 1,
      category: "person",
      name: "Andrei Popescu",
      context: "confirmed",
      narrative:
        "Known associate of cross-border smuggling network. Frequently travels between Bucharest and Istanbul. Uses multiple identities. Last seen at Hotel Intercontinental, Bucharest.",
      createdBy: "analyst1",
      createdAt: "2026-02-25T10:30:00",
      linkedTo: [3, 5, 7],
    },
    {
      id: 2,
      category: "company",
      name: "Black Sea Trading SRL",
      context: "likely",
      narrative:
        "Front company suspected of money laundering operations. Registered in Constanta, Romania. Director is Maria Ionescu. Annual turnover does not match declared activities.",
      createdBy: "analyst1",
      createdAt: "2026-02-24T14:15:00",
      linkedTo: [4, 6],
    },
    {
      id: 3,
      category: "mobile",
      name: "+40 712 345 678",
      context: "confirmed",
      narrative:
        'Primary phone used by Andrei Popescu. Registered under alias "Alexandru Marin". Active in Bucharest, Constanta, and Istanbul areas.',
      createdBy: "agent1",
      createdAt: "2026-02-23T09:00:00",
      linkedTo: [1],
    },
    {
      id: 4,
      category: "person",
      name: "Maria Ionescu",
      context: "likely",
      narrative:
        "Director of Black Sea Trading SRL. Possible financial coordinator. Maintains accounts in multiple banks. Residence: Str. Victoriei 45, Constanta.",
      createdBy: "analyst1",
      createdAt: "2026-02-22T16:45:00",
      linkedTo: [2, 6, 8],
    },
    {
      id: 5,
      category: "vehicle",
      name: "B-123-ABC",
      context: "confirmed",
      narrative:
        "Black BMW X5 registered to Andrei Popescu. Frequently spotted at border crossings. GPS tracker placed on 2026-02-15.",
      createdBy: "agent1",
      createdAt: "2026-02-21T11:20:00",
      linkedTo: [1],
    },
    {
      id: 6,
      category: "address",
      name: "Str. Victoriei 45, Constanta",
      context: "confirmed",
      narrative:
        "Residential address of Maria Ionescu. Also used as informal meeting point for Black Sea Trading associates. Surveillance established since January 2026.",
      createdBy: "analyst1",
      createdAt: "2026-02-20T08:30:00",
      linkedTo: [2, 4],
    },
    {
      id: 7,
      category: "address",
      name: "Hotel Intercontinental, Bucharest",
      context: "rumor",
      narrative:
        "Reported meeting location. Source indicates weekly meetings on Thursdays. Unconfirmed - based on single source testimony.",
      createdBy: "agent1",
      createdAt: "2026-02-19T13:00:00",
      linkedTo: [1],
    },
    {
      id: 8,
      category: "mobile",
      name: "+40 721 999 888",
      context: "likely",
      narrative:
        "Phone number associated with Maria Ionescu. Used for business communications related to Black Sea Trading SRL.",
      createdBy: "analyst1",
      createdAt: "2026-02-18T10:00:00",
      linkedTo: [4],
    },
    {
      id: 9,
      category: "person",
      name: "Viktor Petrov",
      context: "rumor",
      narrative:
        "Bulgarian national, rumored to be the international connection for the smuggling network. Possibly based in Varna. No photograph available.",
      createdBy: "agent1",
      createdAt: "2026-02-17T15:30:00",
      linkedTo: [],
    },
    {
      id: 10,
      category: "vehicle",
      name: "CT-99-XYZ",
      context: "likely",
      narrative:
        "White Mercedes Sprinter van. Seen at Black Sea Trading warehouse. Possibly used for transport of goods. Registered to a shell company in Constanta.",
      createdBy: "analyst1",
      createdAt: "2026-02-16T12:00:00",
      linkedTo: [2],
    },
  ],
  pendingValidations: [
    {
      id: 1,
      entryId: 9,
      targetName: "Viktor Petrov",
      suggestedLink: "Black Sea Trading SRL",
      suggestedLinkId: 2,
      submittedBy: "agent1",
      submittedAt: "2026-02-17T15:35:00",
      reason: "Mentioned in same intelligence stream",
    },
  ],
  logs: [
    {
      ts: "2026-02-28T16:30:00",
      user: "analyst1",
      action: "SEARCH",
      detail: 'Searched for "Andrei Popescu"',
    },
    {
      ts: "2026-02-28T15:00:00",
      user: "agent1",
      action: "SEARCH",
      detail: 'Searched for "Black Sea Trading"',
    },
    {
      ts: "2026-02-28T14:20:00",
      user: "analyst1",
      action: "VIEW",
      detail: "Viewed full record: Maria Ionescu",
    },
    {
      ts: "2026-02-27T10:00:00",
      user: "agent1",
      action: "ENTRY",
      detail: "Created new entry: Viktor Petrov",
    },
    {
      ts: "2026-02-27T09:00:00",
      user: "analyst1",
      action: "LINK",
      detail: "Linked Maria Ionescu ↔ Black Sea Trading SRL",
    },
    {
      ts: "2026-02-26T11:30:00",
      user: "agent1",
      action: "ACCESS_REQ",
      detail: "Requested full access to: Andrei Popescu",
    },
    {
      ts: "2026-02-25T10:30:00",
      user: "analyst1",
      action: "ENTRY",
      detail: "Created new entry: Andrei Popescu",
    },
  ],
  signals: [
    {
      entityId: 1,
      entityName: "Andrei Popescu",
      setBy: "admin",
      setAt: "2026-02-20T09:00:00",
    },
    {
      entityId: 9,
      entityName: "Viktor Petrov",
      setBy: "admin",
      setAt: "2026-02-22T11:00:00",
    },
  ],
  notifications: [],
  nextId: 11,
});

function loadFromStorage(): Database | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Database;
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(db: Database) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // ignore
  }
}

export function getInitialDb(): Database {
  const stored = loadFromStorage();
  if (stored) return stored;
  const seeded = seedData();
  saveToStorage(seeded);
  return seeded;
}

export function getSeedData(): Database {
  return seedData();
}

export function persistDb(db: Database) {
  saveToStorage(db);
}
