import type { Database } from "@/types";

const STORAGE_KEY = "rfe_db_v2";

const seedData: () => Database = () => ({
  users: [
    { username: "admin", password: "admin", role: "admin", access: "full", active: true },
    { username: "analyst1", password: "analyst1", role: "user", access: "full", active: true },
    { username: "analyst2", password: "analyst2", role: "user", access: "full", active: true },
    { username: "fieldops1", password: "fieldops1", role: "user", access: "basic", active: true },
    { username: "fieldops2", password: "fieldops2", role: "user", access: "basic", active: true },
  ],
  entries: [
    // ── PERSONS: Romania ──
    { id: 1, category: "person", name: "Valeriu Nicolae", context: "confirmed", country: "Romania", tags: ["advocacy", "education", "policy", "leadership"],
      narrative: "Founder of Policy Center for Roma and Minorities. Prominent Roma educator and public intellectual. Author of multiple publications on Roma inclusion and anti-discrimination policy. Ran as independent candidate in Romanian elections. Key voice in European Roma policy discourse. Active collaborator with OSF Roma Initiatives and EU institutions. Regular speaker at European Parliament hearings on Roma rights. Maintains extensive network across Romania and Brussels.",
      createdBy: "analyst1", createdAt: "2026-01-15T09:00:00", linkedTo: [21, 25, 28] },
    { id: 2, category: "person", name: "Nicoleta Bitu", context: "confirmed", country: "Romania", tags: ["women-rights", "policy", "leadership"],
      narrative: "Former Executive Director of Romani CRISS. Leading Roma women's rights advocate. Instrumental in shaping Romania's national Roma inclusion strategy. Board member of Roma Foundations for Europe. Active in OSCE and Council of Europe advisory bodies. Published research on intersectionality of Roma women's discrimination. Coordinates with European Network of Roma Women.",
      createdBy: "analyst1", createdAt: "2026-01-14T14:30:00", linkedTo: [21, 26, 30] },
    { id: 3, category: "person", name: "Marian Mandache", context: "confirmed", country: "Romania", tags: ["legal", "advocacy", "leadership"],
      narrative: "Executive Director of Romani CRISS (Roma Center for Social Intervention and Studies). Leads strategic litigation on Roma rights cases in Romanian courts and ECHR. Key contact for international organizations monitoring Roma rights in Romania. Coordinated documentation of forced evictions in Bucharest and Cluj-Napoca. Maintains communication with Council of Europe Commissioner for Human Rights.",
      createdBy: "analyst1", createdAt: "2026-01-13T11:00:00", linkedTo: [21, 30, 37] },
    { id: 4, category: "person", name: "Ciprian Necula", context: "confirmed", country: "Romania", tags: ["youth", "education", "research"],
      narrative: "Roma civic activist and PhD researcher focused on Roma youth empowerment. Coordinator of multiple Roma youth programs in Romania. Collaborates with Roma Education Fund on scholarship initiatives. Active media commentator on Roma issues in Romanian press. Connected to Romani CRISS and Policy Center for Roma and Minorities.",
      createdBy: "analyst2", createdAt: "2026-01-12T16:00:00", linkedTo: [21, 25, 27] },
    { id: 5, category: "person", name: "Iulius Rostas", context: "confirmed", country: "Romania", tags: ["research", "education", "policy"],
      narrative: "Roma academic and policy researcher, formerly at Central European University. Published extensively on Roma political participation and education. Advisor to Roma Education Fund. Key figure in academic analysis of Roma inclusion policies across Central and Eastern Europe. Connected to European Roma Rights Centre research programs.",
      createdBy: "analyst1", createdAt: "2026-01-10T10:00:00", linkedTo: [27, 28] },

    // ── PERSONS: Bulgaria ──
    { id: 6, category: "person", name: "Deyan Kolev", context: "confirmed", country: "Bulgaria", tags: ["education", "advocacy", "leadership"],
      narrative: "Chairman of Center Amalipe, Veliko Tarnovo. Leading figure in Roma education reform in Bulgaria. Developed integrated education model adopted by Bulgarian Ministry of Education. Board member of Roma Foundations for Europe. Advocate for desegregation of Roma schools. Coordinates network of 280 schools across Bulgaria implementing intercultural education.",
      createdBy: "analyst1", createdAt: "2026-01-09T09:30:00", linkedTo: [22, 26, 31] },
    { id: 7, category: "person", name: "Rumyan Russinov", context: "confirmed", country: "Bulgaria", tags: ["policy", "advocacy", "leadership"],
      narrative: "Senior Roma policy advisor, formerly with Open Society Foundations. Key architect of Decade of Roma Inclusion initiative. Extensive experience in Roma integration policy at EU level. Connected to multiple Roma civil society organizations across the Balkans. Currently advises on EU Roma Strategic Framework implementation in Bulgaria.",
      createdBy: "analyst2", createdAt: "2026-01-08T14:00:00", linkedTo: [25, 22, 28] },
    { id: 8, category: "person", name: "Daniela Mihaylova", context: "confirmed", country: "Bulgaria", tags: ["education", "youth", "advocacy"],
      narrative: "Executive Director of Trust for Social Achievement in Bulgaria. Focus on early childhood education and community development in Roma neighborhoods. Collaborates with Center Amalipe on education initiatives. Connected to Open Society Foundations education programs. Implements community-based approaches in Plovdiv and Sofia.",
      createdBy: "analyst1", createdAt: "2026-01-07T11:30:00", linkedTo: [22, 25] },

    // ── PERSONS: Hungary ──
    { id: 9, category: "person", name: "Aladár Horváth", context: "confirmed", country: "Hungary", tags: ["civil-rights", "advocacy", "leadership"],
      narrative: "Founder of Roma Civil Rights Foundation and Roma Parliament in Hungary. Pioneering Roma civil rights leader since 1990s. Led campaigns against segregation in Hungarian schools. Vocal critic of anti-Roma policies. Maintains network of Roma civil society organizations across Hungary. Regularly engages with European Parliament on minority rights.",
      createdBy: "analyst1", createdAt: "2026-01-06T10:00:00", linkedTo: [23, 32] },
    { id: 10, category: "person", name: "Tibor Derdák", context: "confirmed", country: "Hungary", tags: ["education", "leadership"],
      narrative: "Founder and Director of Dr. Ambedkar School in Sajókaza, Hungary. Pioneered alternative education model for Roma students. Named school after Indian anti-caste activist B.R. Ambedkar. Recognized internationally for innovative approach to Roma education. Connected to Roma Education Fund and Open Society Education programs.",
      createdBy: "analyst2", createdAt: "2026-01-05T15:30:00", linkedTo: [24, 27] },
    { id: 11, category: "person", name: "Jenő Setét", context: "confirmed", country: "Hungary", tags: ["media", "advocacy", "youth"],
      narrative: "Roma journalist and media activist based in Budapest. Documents Roma communities and discrimination cases through investigative journalism. Active in Roma media training programs. Connected to Roma Civil Rights Foundation. Contributes to European Roma media network. Advocates for Roma representation in mainstream Hungarian media.",
      createdBy: "analyst1", createdAt: "2026-01-04T09:00:00", linkedTo: [23, 9] },
    { id: 12, category: "person", name: "Ágnes Daróczi", context: "confirmed", country: "Hungary", tags: ["culture", "media", "leadership"],
      narrative: "Prominent Roma cultural figure and media professional in Hungary. Pioneer of Roma cultural programs on Hungarian television. Founded Romani cultural organization. Advisor on Roma cultural heritage preservation. Connected to European Roma Institute for Arts and Culture. Long-standing advocate for Roma cultural recognition.",
      createdBy: "analyst2", createdAt: "2026-01-03T14:00:00", linkedTo: [23, 27] },

    // ── PERSONS: Czech Republic ──
    { id: 13, category: "person", name: "Čeněk Růžička", context: "confirmed", country: "Czech Republic", tags: ["holocaust", "advocacy", "legal"],
      narrative: "Chairman of Committee for the Redress of the Roma Holocaust. Leads campaign for recognition and memorialization of Roma victims at Lety concentration camp site. Successfully advocated for removal of pig farm built on former camp grounds. Key figure in Roma Holocaust remembrance across Europe. Engages with Czech government on historical justice.",
      createdBy: "analyst1", createdAt: "2026-01-02T10:00:00", linkedTo: [28] },
    { id: 14, category: "person", name: "Karel Holomek", context: "confirmed", country: "Czech Republic", tags: ["media", "advocacy", "leadership"],
      narrative: "Veteran Roma journalist and activist based in Brno. Founded Roma newspaper Romano Hangos. Long-standing figure in Czech Roma civil society since 1989. Former member of Czech Government Council for Roma Affairs. Connected to European Roma media initiatives. Advocate for Roma political participation in Czech Republic.",
      createdBy: "analyst2", createdAt: "2026-01-01T11:00:00", linkedTo: [] },
    { id: 15, category: "person", name: "Ivan Veselý", context: "confirmed", country: "Czech Republic", tags: ["advocacy", "culture", "leadership"],
      narrative: "Founder and Director of Dženo Association in Prague. Focus on Roma community empowerment and cultural preservation. Coordinates Roma integration projects in Czech Republic. Connected to Open Society Foundations programs. Active in European Roma civil society network. Advocates for inclusive policies at municipal level in Prague.",
      createdBy: "analyst1", createdAt: "2025-12-30T09:00:00", linkedTo: [29, 33] },

    // ── PERSONS: International / OSF / RFE ──
    { id: 16, category: "person", name: "Zeljko Jovanovic", context: "confirmed", country: "International", tags: ["policy", "leadership", "strategy"],
      narrative: "Director of Open Society Roma Initiatives Office, the largest private funder of Roma inclusion efforts globally. Serbian-Roma background. Architect of OSF's Roma strategy across Europe. Key liaison between Roma civil society and EU institutions. Board member of Roma Foundations for Europe. Instrumental in shaping EU Roma Strategic Framework 2020-2030. One of the most influential Roma policy figures in Europe.",
      createdBy: "admin", createdAt: "2025-12-28T10:00:00", linkedTo: [25, 26, 34, 39] },
    { id: 17, category: "person", name: "Bernard Rorke", context: "confirmed", country: "International", tags: ["policy", "research", "advocacy"],
      narrative: "Policy and Advocacy Director at ERGO Network. Formerly with Open Society Foundations Roma Initiatives. Expert on EU Roma policy implementation. Published extensively on Roma inclusion monitoring. Key contributor to shadow reporting on Roma rights to European Commission. Connected to Roma civil society organizations across all EU member states.",
      createdBy: "analyst1", createdAt: "2025-12-27T14:00:00", linkedTo: [25, 28] },
    { id: 18, category: "person", name: "Margareta Matache", context: "confirmed", country: "International", tags: ["research", "policy", "women-rights"],
      narrative: "Director of Roma Program at Harvard FXB Center for Health and Human Rights. Leading academic voice on Roma rights globally. Former director of Romani CRISS in Romania. Research focus on antigypsyism and structural racism against Roma. Advisor to multiple international organizations. Connected to European Roma Rights Centre and OSF programs. Published in leading human rights journals.",
      createdBy: "analyst1", createdAt: "2025-12-26T11:00:00", linkedTo: [21, 28, 26] },
    { id: 19, category: "person", name: "Elena Stanescu", context: "confirmed", country: "International", tags: ["leadership", "policy", "strategy"],
      narrative: "Executive Director of Roma Foundations for Europe (Brussels). Romanian-Roma background. Former policy advisor at European Commission DG Justice. Coordinates RFE's pan-European advocacy strategy. Maintains relationships with Roma civil society leaders across Romania, Bulgaria, Hungary, and Czech Republic. Oversees grant-making portfolio supporting grassroots Roma organizations.",
      createdBy: "admin", createdAt: "2025-12-25T09:00:00", linkedTo: [26, 35, 2, 6, 16] },
    { id: 20, category: "person", name: "Dezideriu Gergely", context: "confirmed", country: "International", tags: ["legal", "advocacy", "leadership"],
      narrative: "Executive Director of European Roma Rights Centre (ERRC). Leads strategic litigation on Roma rights cases before European Court of Human Rights. Oversees ERRC's monitoring and documentation of Roma rights violations across Europe. Connected to Open Society Foundations and Roma Foundations for Europe. Key figure in European anti-discrimination legal framework for Roma.",
      createdBy: "analyst1", createdAt: "2025-12-24T10:00:00", linkedTo: [28, 25, 26] },

    // ── ORGANIZATIONS ──
    { id: 21, category: "company", name: "Romani CRISS", context: "confirmed", country: "Romania", tags: ["legal", "advocacy", "monitoring"],
      narrative: "Roma Center for Social Intervention and Studies. Founded 1991, Bucharest. Romania's leading Roma rights organization. Focus: strategic litigation, rights monitoring, policy advocacy. Documented forced evictions, school segregation, police abuse. Key partner of EU FRA and Council of Europe. Staff: ~25. Annual budget: ~€800K. Connected to European Roma civil society network.",
      createdBy: "admin", createdAt: "2025-12-22T09:00:00", linkedTo: [2, 3, 4, 30, 37] },
    { id: 22, category: "company", name: "Center Amalipe", context: "confirmed", country: "Bulgaria", tags: ["education", "advocacy", "community"],
      narrative: "Center for Interethnic Dialogue and Tolerance Amalipe. Founded 2002, Veliko Tarnovo, Bulgaria. Largest Roma organization in Bulgaria. Focus: integrated education, community development, civic participation. Network of 280+ partner schools. Developed intercultural education curriculum adopted nationally. Staff: ~40. Key partner of Bulgarian Ministry of Education.",
      createdBy: "admin", createdAt: "2025-12-21T09:00:00", linkedTo: [6, 7, 8, 31, 38] },
    { id: 23, category: "company", name: "Roma Civil Rights Foundation", context: "confirmed", country: "Hungary", tags: ["civil-rights", "legal", "advocacy"],
      narrative: "Founded by Aladár Horváth in Budapest. Focus on Roma civil rights, desegregation campaigns, legal advocacy. Documents discrimination cases in Hungary. Runs community empowerment programs. Connected to Hungarian Helsinki Committee and European Roma Rights Centre. Active in advocacy against anti-Roma rhetoric in Hungarian politics.",
      createdBy: "admin", createdAt: "2025-12-20T09:00:00", linkedTo: [9, 11, 12, 32] },
    { id: 24, category: "company", name: "Dr. Ambedkar School", context: "confirmed", country: "Hungary", tags: ["education", "youth"],
      narrative: "Alternative secondary school in Sajókaza, Hungary. Founded by Tibor Derdák. Named after Indian anti-caste leader B.R. Ambedkar. Provides quality education to Roma students from disadvantaged backgrounds. Recognized by Roma Education Fund and UNESCO. Graduates have high university admission rates. Model for Roma education initiatives across Central Europe.",
      createdBy: "analyst2", createdAt: "2025-12-19T09:00:00", linkedTo: [10, 27] },
    { id: 25, category: "company", name: "Open Society Roma Initiatives Office", context: "confirmed", country: "International", tags: ["policy", "funding", "strategy"],
      narrative: "Part of Open Society Foundations. Largest private funder of Roma inclusion globally. Based in Budapest/Berlin. Directed by Zeljko Jovanovic. Annual grantmaking: ~€15M. Funds Roma civil society across 12+ countries. Key architect of Decade of Roma Inclusion. Supports advocacy, education, health, and housing programs. Connected to all major Roma organizations in Europe.",
      createdBy: "admin", createdAt: "2025-12-18T09:00:00", linkedTo: [16, 17, 7, 34, 39] },
    { id: 26, category: "company", name: "Roma Foundations for Europe", context: "confirmed", country: "International", tags: ["policy", "strategy", "coordination"],
      narrative: "Pan-European Roma advocacy network. Headquarters: Brussels. Executive Director: Elena Stanescu. Board includes Nicoleta Bitu, Deyan Kolev, Zeljko Jovanovic. Focus: EU-level policy advocacy, coordination of national Roma platforms, grant-making to grassroots organizations. Key partner of European Commission DG Justice. Annual budget: ~€5M. Staff: 18 across 6 offices.",
      createdBy: "admin", createdAt: "2025-12-17T09:00:00", linkedTo: [19, 2, 6, 16, 20, 35] },
    { id: 27, category: "company", name: "Roma Education Fund", context: "confirmed", country: "International", tags: ["education", "funding", "youth"],
      narrative: "International foundation supporting Roma education. Based in Budapest. Provides scholarships, supports school desegregation, funds tutoring programs. Operates in 16 countries. Has supported over 100,000 Roma students. Connected to Roma Foundations for Europe, Open Society Foundations, and World Bank. Key implementing partner for EU Roma education initiatives.",
      createdBy: "analyst1", createdAt: "2025-12-16T09:00:00", linkedTo: [5, 10, 12, 24, 25] },
    { id: 28, category: "company", name: "European Roma Rights Centre", context: "confirmed", country: "International", tags: ["legal", "monitoring", "advocacy"],
      narrative: "ERRC. Founded 1996, Budapest. Now based in Brussels. Leading Roma rights litigation organization. Strategic litigation before ECHR on school segregation, forced sterilization, police violence. Publishes annual Roma rights monitoring reports. Staff: ~30. Connected to all major Roma organizations. Key partner of Council of Europe and EU FRA.",
      createdBy: "admin", createdAt: "2025-12-15T09:00:00", linkedTo: [5, 7, 13, 17, 18, 20] },
    { id: 29, category: "company", name: "Dženo Association", context: "confirmed", country: "Czech Republic", tags: ["culture", "advocacy", "community"],
      narrative: "Roma civil society organization in Prague. Founded by Ivan Veselý. Focus: Roma community empowerment, cultural preservation, integration projects. Operates community center in Prague. Connected to Open Society Foundations and Czech government Roma coordination body. Implements EU-funded projects on Roma inclusion in Czech Republic.",
      createdBy: "analyst2", createdAt: "2025-12-14T09:00:00", linkedTo: [15, 33] },
    { id: 30, category: "company", name: "Policy Center for Roma and Minorities", context: "confirmed", country: "Romania", tags: ["policy", "research", "advocacy"],
      narrative: "Think tank founded by Valeriu Nicolae in Bucharest. Focus: evidence-based policy advocacy for Roma inclusion. Publishes policy briefs, conducts research on Roma education and employment. Connected to European Policy Centre and Open Society Foundations. Collaborates with Romani CRISS on joint advocacy campaigns. Engages Romanian government on National Roma Strategy.",
      createdBy: "analyst1", createdAt: "2025-12-13T09:00:00", linkedTo: [1, 2, 21] },

    // ── ADDRESSES ──
    { id: 31, category: "address", name: "Center Amalipe, 2 Marno Pole, Veliko Tarnovo 5000, Bulgaria", context: "confirmed", country: "Bulgaria", tags: ["office", "headquarters"],
      narrative: "Headquarters of Center Amalipe. Two-story office building in central Veliko Tarnovo. Houses program offices, training center, and community meeting space. Primary contact point for Center Amalipe's network of partner schools.",
      createdBy: "analyst1", createdAt: "2025-12-12T09:00:00", linkedTo: [6, 22] },
    { id: 32, category: "address", name: "Roma Civil Rights Foundation, Dohány u. 76, Budapest 1074, Hungary", context: "confirmed", country: "Hungary", tags: ["office", "headquarters"],
      narrative: "Office of Roma Civil Rights Foundation in Budapest's 7th district. Meeting point for Roma civil society leaders in Hungary. Location for community organizing and legal consultations.",
      createdBy: "analyst2", createdAt: "2025-12-11T09:00:00", linkedTo: [9, 23] },
    { id: 33, category: "address", name: "Dženo Association, Prokopova 4, Prague 3, 130 00, Czech Republic", context: "confirmed", country: "Czech Republic", tags: ["office", "community-center"],
      narrative: "Office and community center of Dženo Association in Prague 3. Houses Roma cultural programs, integration services, and community events. Meeting point for Czech Roma civil society.",
      createdBy: "analyst1", createdAt: "2025-12-10T09:00:00", linkedTo: [15, 29] },
    { id: 34, category: "address", name: "OSF Roma Initiatives, Október 6. u. 12, Budapest 1051, Hungary", context: "confirmed", country: "International", tags: ["office", "headquarters"],
      narrative: "Budapest office of Open Society Roma Initiatives. Central hub for Roma program coordination. Hosts meetings with Roma civil society leaders from across Europe. Houses program and grants management teams.",
      createdBy: "admin", createdAt: "2025-12-09T09:00:00", linkedTo: [16, 25] },
    { id: 35, category: "address", name: "Roma Foundations for Europe, Rue de Trèves 45, Brussels 1040, Belgium", context: "confirmed", country: "International", tags: ["office", "headquarters"],
      narrative: "Brussels headquarters of Roma Foundations for Europe. Located in EU quarter near European Parliament. Houses executive office, EU policy team, and grants administration. Key location for EU-level Roma advocacy meetings.",
      createdBy: "admin", createdAt: "2025-12-08T09:00:00", linkedTo: [19, 26] },
    { id: 36, category: "address", name: "Romani CRISS, Str. Buzești 19, Bucharest 011011, Romania", context: "confirmed", country: "Romania", tags: ["office", "headquarters"],
      narrative: "Headquarters of Romani CRISS in central Bucharest. Office space for legal team, monitoring staff, and administration. Contact point for Roma rights documentation in Romania.",
      createdBy: "analyst1", createdAt: "2025-12-07T09:00:00", linkedTo: [3, 21] },

    // ── MOBILE NUMBERS ──
    { id: 37, category: "mobile", name: "+40 726 148 392", context: "confirmed", country: "Romania", tags: ["primary-contact"],
      narrative: "Primary organizational contact for Romani CRISS Bucharest office. Used for coordination with partner organizations and media inquiries.",
      createdBy: "analyst1", createdAt: "2025-12-06T09:00:00", linkedTo: [3, 21] },
    { id: 38, category: "mobile", name: "+359 889 421 057", context: "confirmed", country: "Bulgaria", tags: ["primary-contact"],
      narrative: "Contact number for Center Amalipe coordination. Used for school network communications and program coordination across Bulgaria.",
      createdBy: "analyst2", createdAt: "2025-12-05T09:00:00", linkedTo: [6, 22] },
    { id: 39, category: "mobile", name: "+36 30 912 4478", context: "confirmed", country: "International", tags: ["primary-contact"],
      narrative: "OSF Roma Initiatives Office Budapest contact. Used by director's office for high-level coordination with Roma civil society leaders.",
      createdBy: "admin", createdAt: "2025-12-04T09:00:00", linkedTo: [16, 25] },
    { id: 40, category: "mobile", name: "+420 608 731 265", context: "confirmed", country: "Czech Republic", tags: ["primary-contact"],
      narrative: "Dženo Association Prague office line. Primary contact for Czech Roma community programs and integration services.",
      createdBy: "analyst1", createdAt: "2025-12-03T09:00:00", linkedTo: [15, 29] },
    { id: 41, category: "mobile", name: "+32 2 234 6891", context: "confirmed", country: "International", tags: ["primary-contact"],
      narrative: "Roma Foundations for Europe Brussels headquarters main line. Used for EU institutional communications and partner coordination.",
      createdBy: "admin", createdAt: "2025-12-02T09:00:00", linkedTo: [19, 26] },

    // ── VEHICLES ──
    { id: 42, category: "vehicle", name: "B-492-RFE", context: "confirmed", country: "Romania", tags: ["organizational"],
      narrative: "Romani CRISS field operations vehicle. Used for monitoring missions, community visits, and documentation trips across Romania. Registered to organization in Bucharest.",
      createdBy: "fieldops1", createdAt: "2025-12-01T09:00:00", linkedTo: [21, 36] },
    { id: 43, category: "vehicle", name: "VT-8831-CA", context: "confirmed", country: "Bulgaria", tags: ["organizational"],
      narrative: "Center Amalipe field vehicle. Used for visits to partner schools across Bulgaria's network of 280+ schools. Registered in Veliko Tarnovo.",
      createdBy: "fieldops2", createdAt: "2025-11-30T09:00:00", linkedTo: [22, 31] },
    { id: 44, category: "vehicle", name: "RFE-EU-001", context: "confirmed", country: "International", tags: ["organizational"],
      narrative: "Roma Foundations for Europe Brussels office vehicle. Used for EU institutional meetings and travel between Brussels and Strasbourg for European Parliament sessions.",
      createdBy: "admin", createdAt: "2025-11-29T09:00:00", linkedTo: [26, 35] },
  ],
  pendingValidations: [
    { id: 1, entryId: 14, targetName: "Karel Holomek", suggestedLink: "Dženo Association", suggestedLinkId: 29, submittedBy: "analyst2", submittedAt: "2026-02-20T10:00:00", reason: "Both active in Czech Roma civil society - possible collaboration" },
    { id: 2, entryId: 8, targetName: "Daniela Mihaylova", suggestedLink: "Roma Foundations for Europe", suggestedLinkId: 26, submittedBy: "analyst1", submittedAt: "2026-02-18T14:00:00", reason: "Attended RFE annual conference as speaker - potential board candidate" },
    { id: 3, entryId: 11, targetName: "Jenő Setét", suggestedLink: "Open Society Roma Initiatives Office", suggestedLinkId: 25, submittedBy: "analyst2", submittedAt: "2026-02-15T11:00:00", reason: "Received OSF media grant for Roma journalism project" },
  ],
  logs: [
    { ts: "2026-02-28T16:30:00", user: "analyst1", action: "SEARCH", detail: "Searched for \"Zeljko Jovanovic\" | Reason: Mapping OSF Roma leadership network" },
    { ts: "2026-02-28T15:00:00", user: "analyst2", action: "SEARCH", detail: "Searched for \"Center Amalipe\" | Reason: Bulgaria education program review" },
    { ts: "2026-02-28T14:20:00", user: "analyst1", action: "VIEW", detail: "Viewed full record: Roma Foundations for Europe" },
    { ts: "2026-02-28T12:00:00", user: "fieldops1", action: "ENTRY", detail: "Created new entry: B-492-RFE (vehicle)" },
    { ts: "2026-02-27T16:00:00", user: "analyst2", action: "LINK", detail: "Linked Deyan Kolev ↔ Roma Foundations for Europe" },
    { ts: "2026-02-27T14:30:00", user: "analyst1", action: "SEARCH", detail: "Searched for \"European Roma Rights Centre\" | Reason: Litigation case review" },
    { ts: "2026-02-27T10:00:00", user: "analyst1", action: "ENTRY", detail: "Created new entry: Elena Stanescu (person)" },
    { ts: "2026-02-26T15:00:00", user: "analyst2", action: "VIEW", detail: "Viewed full record: Valeriu Nicolae" },
    { ts: "2026-02-26T11:30:00", user: "fieldops1", action: "ACCESS_REQ", detail: "Requested full access to: Zeljko Jovanovic" },
    { ts: "2026-02-26T09:00:00", user: "analyst1", action: "ENTRY", detail: "Created new entry: Margareta Matache (person)" },
    { ts: "2026-02-25T16:00:00", user: "analyst2", action: "SEARCH", detail: "Searched for \"Roma Education Fund\" | Reason: Scholarship program analysis" },
    { ts: "2026-02-25T14:00:00", user: "admin", action: "SIGNAL_SET", detail: "Set signal: Roma Foundations for Europe" },
    { ts: "2026-02-25T10:30:00", user: "analyst1", action: "LINK", detail: "Linked Nicoleta Bitu ↔ Roma Foundations for Europe" },
    { ts: "2026-02-24T15:00:00", user: "analyst2", action: "VIEW", detail: "Viewed full record: Aladár Horváth" },
    { ts: "2026-02-24T10:00:00", user: "analyst1", action: "ENTRY", detail: "Created new entry: Dezideriu Gergely (person)" },
    { ts: "2026-02-23T14:00:00", user: "admin", action: "VALIDATE_APPROVE", detail: "Approved: Rumyan Russinov → Center Amalipe" },
    { ts: "2026-02-23T11:00:00", user: "fieldops2", action: "ENTRY", detail: "Created new entry: VT-8831-CA (vehicle)" },
    { ts: "2026-02-22T16:00:00", user: "analyst1", action: "SEARCH", detail: "Searched for \"Romani CRISS\" | Reason: Romania partner mapping" },
    { ts: "2026-02-22T10:00:00", user: "analyst2", action: "ENTRY", detail: "Created new entry: Ágnes Daróczi (person)" },
    { ts: "2026-02-21T14:00:00", user: "analyst1", action: "VIEW", detail: "Viewed full record: Ivan Veselý" },
    { ts: "2026-02-20T09:00:00", user: "admin", action: "USER_CREATE", detail: "Created user: fieldops2 (basic)" },
  ],
  signals: [
    { entityId: 26, entityName: "Roma Foundations for Europe", setBy: "admin", setAt: "2026-02-25T14:00:00" },
    { entityId: 16, entityName: "Zeljko Jovanovic", setBy: "admin", setAt: "2026-02-20T09:00:00" },
    { entityId: 19, entityName: "Elena Stanescu", setBy: "admin", setAt: "2026-02-18T10:00:00" },
  ],
  notifications: [
    { message: "Validation request: Karel Holomek → Dženo Association", forUser: "admin", ts: "2026-02-20T10:00:00", read: false },
    { message: "Validation request: Daniela Mihaylova → Roma Foundations for Europe", forUser: "admin", ts: "2026-02-18T14:00:00", read: false },
    { message: "Access request from fieldops1 for \"Zeljko Jovanovic\"", forUser: "admin", ts: "2026-02-26T11:30:00", read: false },
  ],
  nextId: 45,
});

function loadFromStorage(): Database | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Database;
  } catch { /* ignore */ }
  return null;
}

function saveToStorage(db: Database) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch { /* ignore */ }
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
