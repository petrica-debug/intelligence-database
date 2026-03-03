import type { Database } from "@/types";

const STORAGE_KEY = "rfe_db_v6";

const seedData: () => Database = () => ({
  users: [
    { username: "admin", password: "admin", role: "admin", access: "full", clearance: 5, active: true, fullName: "Director Operations", department: "Executive" },
    { username: "analyst1", password: "analyst1", role: "user", access: "full", clearance: 4, active: true, fullName: "Senior Analyst", department: "Intelligence" },
    { username: "analyst2", password: "analyst2", role: "user", access: "full", clearance: 3, active: true, fullName: "Analyst", department: "Intelligence" },
    { username: "fieldops1", password: "fieldops1", role: "user", access: "basic", clearance: 2, active: true, fullName: "Field Officer", department: "Field Operations" },
    { username: "fieldops2", password: "fieldops2", role: "user", access: "basic", clearance: 1, active: true, fullName: "Field Operative", department: "Field Operations" },
  ],
  entries: [
    // ── PERSONS: Region Alpha ──
    { id: 1, category: "person", name: "ACTOR-001", context: "confirmed", country: "Region Alpha", tags: ["advocacy", "education", "policy", "leadership"],
      narrative: "Founder of a regional policy center. Prominent educator and public intellectual. Author of multiple publications on social inclusion and anti-discrimination policy. Key voice in regional policy discourse. Active collaborator with international foundations and institutions. Regular speaker at parliamentary hearings. Maintains extensive network across the region and Brussels.",
      createdBy: "analyst1", createdAt: "2026-01-15T09:00:00", linkedTo: [21, 25, 28] },
    { id: 2, category: "person", name: "ACTOR-002", context: "confirmed", country: "Region Alpha", tags: ["women-rights", "policy", "leadership"],
      narrative: "Former executive director of a civil rights organization. Leading women's rights advocate. Instrumental in shaping the national inclusion strategy. Board member of the European Advocacy Foundation. Active in OSCE and Council of Europe advisory bodies. Published research on intersectional discrimination.",
      createdBy: "analyst1", createdAt: "2026-01-14T14:30:00", linkedTo: [21, 26, 30] },
    { id: 3, category: "person", name: "ACTOR-003", context: "confirmed", country: "Region Alpha", tags: ["legal", "advocacy", "leadership"],
      narrative: "Executive director of a civil rights monitoring organization. Leads strategic litigation on rights cases in national courts and ECHR. Key contact for international organizations. Coordinated documentation of forced evictions. Maintains communication with Council of Europe Commissioner for Human Rights.",
      createdBy: "analyst1", createdAt: "2026-01-13T11:00:00", linkedTo: [21, 30, 37] },
    { id: 4, category: "person", name: "ACTOR-004", context: "confirmed", country: "Region Alpha", tags: ["youth", "education", "research"],
      narrative: "Civic activist and PhD researcher focused on youth empowerment. Coordinator of multiple youth programs. Collaborates with education fund on scholarship initiatives. Active media commentator on social issues. Connected to civil rights organizations and policy centers.",
      createdBy: "analyst2", createdAt: "2026-01-12T16:00:00", linkedTo: [21, 25, 27] },
    { id: 5, category: "person", name: "ACTOR-005", context: "confirmed", country: "Region Alpha", tags: ["research", "education", "policy"],
      narrative: "Academic and policy researcher, formerly at a major European university. Published extensively on political participation and education. Advisor to an education fund. Key figure in academic analysis of inclusion policies across Central and Eastern Europe.",
      createdBy: "analyst1", createdAt: "2026-01-10T10:00:00", linkedTo: [27, 28] },

    // ── PERSONS: Region Beta ──
    { id: 6, category: "person", name: "ACTOR-006", context: "confirmed", country: "Region Beta", tags: ["education", "advocacy", "leadership"],
      narrative: "Chairman of a regional education center. Leading figure in education reform. Developed integrated education model adopted by the national ministry. Board member of the European Advocacy Foundation. Coordinates a network of 280 schools implementing intercultural education.",
      createdBy: "analyst1", createdAt: "2026-01-09T09:30:00", linkedTo: [22, 26, 31] },
    { id: 7, category: "person", name: "ACTOR-007", context: "confirmed", country: "Region Beta", tags: ["policy", "advocacy", "leadership"],
      narrative: "Senior policy advisor, formerly with an international foundation. Key architect of a decade-long inclusion initiative. Extensive experience in integration policy at EU level. Connected to multiple civil society organizations across the Balkans.",
      createdBy: "analyst2", createdAt: "2026-01-08T14:00:00", linkedTo: [25, 22, 28] },
    { id: 8, category: "person", name: "ACTOR-008", context: "confirmed", country: "Region Beta", tags: ["education", "youth", "advocacy"],
      narrative: "Executive director of a social achievement trust. Focus on early childhood education and community development. Collaborates with regional education centers. Connected to international foundation education programs.",
      createdBy: "analyst1", createdAt: "2026-01-07T11:30:00", linkedTo: [22, 25] },

    // ── PERSONS: Region Gamma ──
    { id: 9, category: "person", name: "ACTOR-009", context: "confirmed", country: "Region Gamma", tags: ["civil-rights", "advocacy", "leadership"],
      narrative: "Founder of a civil rights foundation and parliamentary advocacy group. Pioneering civil rights leader since the 1990s. Led campaigns against segregation in schools. Maintains network of civil society organizations. Regularly engages with European Parliament on minority rights.",
      createdBy: "analyst1", createdAt: "2026-01-06T10:00:00", linkedTo: [23, 32] },
    { id: 10, category: "person", name: "ACTOR-010", context: "confirmed", country: "Region Gamma", tags: ["education", "leadership"],
      narrative: "Founder and director of an alternative school. Pioneered an education model for disadvantaged students. Recognized internationally for innovative approach. Connected to education fund and international foundation programs.",
      createdBy: "analyst2", createdAt: "2026-01-05T15:30:00", linkedTo: [24, 27] },
    { id: 11, category: "person", name: "ACTOR-011", context: "confirmed", country: "Region Gamma", tags: ["media", "advocacy", "youth"],
      narrative: "Journalist and media activist based in the capital. Documents communities and discrimination cases through investigative journalism. Active in media training programs. Connected to civil rights foundation. Contributes to a European media network.",
      createdBy: "analyst1", createdAt: "2026-01-04T09:00:00", linkedTo: [23, 9] },
    { id: 12, category: "person", name: "ACTOR-012", context: "confirmed", country: "Region Gamma", tags: ["culture", "media", "leadership"],
      narrative: "Prominent cultural figure and media professional. Pioneer of cultural programs on national television. Founded a cultural organization. Advisor on cultural heritage preservation. Connected to the European Institute for Arts and Culture.",
      createdBy: "analyst2", createdAt: "2026-01-03T14:00:00", linkedTo: [23, 27] },

    // ── PERSONS: Region Delta ──
    { id: 13, category: "person", name: "ACTOR-013", context: "confirmed", country: "Region Delta", tags: ["holocaust", "advocacy", "legal"],
      narrative: "Chairman of a committee for historical redress. Leads campaign for recognition and memorialization of victims. Successfully advocated for removal of inappropriate structures built on former memorial grounds. Key figure in remembrance across Europe.",
      createdBy: "analyst1", createdAt: "2026-01-02T10:00:00", linkedTo: [28] },
    { id: 14, category: "person", name: "ACTOR-014", context: "confirmed", country: "Region Delta", tags: ["media", "advocacy", "leadership"],
      narrative: "Veteran journalist and activist. Founded a community newspaper. Long-standing figure in civil society since 1989. Former member of government advisory council. Connected to European media initiatives.",
      createdBy: "analyst2", createdAt: "2026-01-01T11:00:00", linkedTo: [] },
    { id: 15, category: "person", name: "ACTOR-015", context: "confirmed", country: "Region Delta", tags: ["advocacy", "culture", "leadership"],
      narrative: "Founder and director of a community association. Focus on community empowerment and cultural preservation. Coordinates integration projects. Connected to international foundation programs. Active in European civil society network.",
      createdBy: "analyst1", createdAt: "2025-12-30T09:00:00", linkedTo: [29, 33] },

    // ── PERSONS: International ──
    { id: 16, category: "person", name: "ACTOR-016", context: "confirmed", country: "International", tags: ["policy", "leadership", "strategy"],
      narrative: "Director of an international initiatives office, the largest private funder of inclusion efforts globally. Architect of the foundation's strategy across Europe. Key liaison between civil society and EU institutions. Chair of the European Advocacy Foundation. Instrumental in shaping the EU Strategic Framework 2020-2030.",
      createdBy: "admin", createdAt: "2025-12-28T10:00:00", linkedTo: [25, 26, 34, 39] },
    { id: 17, category: "person", name: "ACTOR-017", context: "confirmed", country: "International", tags: ["policy", "research", "advocacy"],
      narrative: "Policy and advocacy director at a European network. Formerly with an international foundation. Expert on EU policy implementation. Published extensively on inclusion monitoring. Key contributor to shadow reporting to the European Commission.",
      createdBy: "analyst1", createdAt: "2025-12-27T14:00:00", linkedTo: [25, 28] },
    { id: 18, category: "person", name: "ACTOR-018", context: "confirmed", country: "International", tags: ["research", "policy", "women-rights"],
      narrative: "Director of a program at a major US university center for health and human rights. Leading academic voice on rights globally. Former director of a civil rights organization. Research focus on structural racism. Advisor to multiple international organizations.",
      createdBy: "analyst1", createdAt: "2025-12-26T11:00:00", linkedTo: [21, 28, 26] },
    { id: 19, category: "person", name: "ACTOR-019", context: "confirmed", country: "International", tags: ["leadership", "policy", "strategy"],
      narrative: "Executive director of the European Advocacy Foundation (Brussels). Former policy advisor at European Commission DG Justice. Coordinates pan-European advocacy strategy. Maintains relationships with civil society leaders across multiple countries. Oversees grant-making portfolio supporting grassroots organizations.",
      createdBy: "admin", createdAt: "2025-12-25T09:00:00", linkedTo: [26, 35, 2, 6, 16] },
    { id: 20, category: "person", name: "ACTOR-020", context: "confirmed", country: "International", tags: ["legal", "advocacy", "leadership"],
      narrative: "Executive director of a European rights centre. Leads strategic litigation on rights cases before ECHR. Oversees monitoring and documentation of rights violations across Europe. Connected to international foundations and advocacy networks.",
      createdBy: "analyst1", createdAt: "2025-12-24T10:00:00", linkedTo: [28, 25, 26] },

    // ── ORGANIZATIONS ──
    { id: 21, category: "company", name: "Civil Rights Monitoring Group", context: "confirmed", country: "Region Alpha", tags: ["legal", "advocacy", "monitoring"],
      narrative: "Center for social intervention and studies. Founded 1991. Region Alpha's leading rights organization. Focus: strategic litigation, rights monitoring, policy advocacy. Documented forced evictions, school segregation, police abuse. Key partner of EU FRA and Council of Europe. Staff: ~25. Annual budget: ~€800K.",
      createdBy: "admin", createdAt: "2025-12-22T09:00:00", linkedTo: [2, 3, 4, 30, 37] },
    { id: 22, category: "company", name: "Regional Education Center", context: "confirmed", country: "Region Beta", tags: ["education", "advocacy", "community"],
      narrative: "Center for interethnic dialogue and tolerance. Founded 2002. Largest community organization in Region Beta. Focus: integrated education, community development, civic participation. Network of 280+ partner schools. Staff: ~40. Key partner of the national Ministry of Education.",
      createdBy: "admin", createdAt: "2025-12-21T09:00:00", linkedTo: [6, 7, 8, 31, 38] },
    { id: 23, category: "company", name: "Civil Rights Foundation", context: "confirmed", country: "Region Gamma", tags: ["civil-rights", "legal", "advocacy"],
      narrative: "Founded in the capital. Focus on civil rights, desegregation campaigns, legal advocacy. Documents discrimination cases. Runs community empowerment programs. Connected to human rights committees and European rights centres.",
      createdBy: "admin", createdAt: "2025-12-20T09:00:00", linkedTo: [9, 11, 12, 32] },
    { id: 24, category: "company", name: "Alternative Education Academy", context: "confirmed", country: "Region Gamma", tags: ["education", "youth"],
      narrative: "Alternative secondary school. Provides quality education to students from disadvantaged backgrounds. Recognized by education fund and UNESCO. Graduates have high university admission rates. Model for education initiatives across Central Europe.",
      createdBy: "analyst2", createdAt: "2025-12-19T09:00:00", linkedTo: [10, 27] },
    { id: 25, category: "company", name: "International Initiatives Office", context: "confirmed", country: "International", tags: ["policy", "funding", "strategy"],
      narrative: "Part of a major international foundation. Largest private funder of inclusion globally. Annual grantmaking: ~€15M. Funds civil society across 12+ countries. Key architect of a decade-long inclusion initiative. Supports advocacy, education, health, and housing programs.",
      createdBy: "admin", createdAt: "2025-12-18T09:00:00", linkedTo: [16, 17, 7, 34, 39] },
    { id: 26, category: "company", name: "European Advocacy Foundation", context: "confirmed", country: "International", tags: ["policy", "strategy", "coordination"],
      narrative: "Pan-European advocacy network. Headquarters in Brussels. Focus: EU-level policy advocacy, coordination of national platforms, grant-making to grassroots organizations. Key partner of European Commission DG Justice. Annual budget: ~€5M. Staff: 18 across 6 offices.",
      createdBy: "admin", createdAt: "2025-12-17T09:00:00", linkedTo: [19, 2, 6, 16, 20, 35, 73, 74] },
    { id: 27, category: "company", name: "Education Fund International", context: "confirmed", country: "International", tags: ["education", "funding", "youth"],
      narrative: "International foundation supporting education. Based in Central Europe. Provides scholarships, supports school desegregation, funds tutoring programs. Operates in 16 countries. Has supported over 100,000 students. Connected to major foundations and the World Bank.",
      createdBy: "analyst1", createdAt: "2025-12-16T09:00:00", linkedTo: [5, 10, 12, 24, 25] },
    { id: 28, category: "company", name: "European Rights Centre", context: "confirmed", country: "International", tags: ["legal", "monitoring", "advocacy"],
      narrative: "Founded 1996. Leading rights litigation organization. Strategic litigation before ECHR on school segregation, forced sterilization, police violence. Publishes annual rights monitoring reports. Staff: ~30. Key partner of Council of Europe and EU FRA.",
      createdBy: "admin", createdAt: "2025-12-15T09:00:00", linkedTo: [5, 7, 13, 17, 18, 20] },
    { id: 29, category: "company", name: "Community Empowerment Association", context: "confirmed", country: "Region Delta", tags: ["culture", "advocacy", "community"],
      narrative: "Civil society organization in the capital. Focus: community empowerment, cultural preservation, integration projects. Operates a community center. Connected to international foundation programs. Implements EU-funded projects on inclusion.",
      createdBy: "analyst2", createdAt: "2025-12-14T09:00:00", linkedTo: [15, 33] },
    { id: 30, category: "company", name: "Policy Research Center", context: "confirmed", country: "Region Alpha", tags: ["policy", "research", "advocacy"],
      narrative: "Think tank. Focus: evidence-based policy advocacy for inclusion. Publishes policy briefs, conducts research on education and employment. Connected to European Policy Centre and international foundations. Engages government on national strategy.",
      createdBy: "analyst1", createdAt: "2025-12-13T09:00:00", linkedTo: [1, 2, 21] },

    // ── ADDRESSES ──
    { id: 31, category: "address", name: "Education Center HQ, 2 Central Square, Region Beta", context: "confirmed", country: "Region Beta", tags: ["office", "headquarters"],
      narrative: "Headquarters of the Regional Education Center. Two-story office building in the city center. Houses program offices, training center, and community meeting space.",
      createdBy: "analyst1", createdAt: "2025-12-12T09:00:00", linkedTo: [6, 22] },
    { id: 32, category: "address", name: "Civil Rights Foundation, 76 Liberty St, Region Gamma", context: "confirmed", country: "Region Gamma", tags: ["office", "headquarters"],
      narrative: "Office of the Civil Rights Foundation. Meeting point for civil society leaders. Location for community organizing and legal consultations.",
      createdBy: "analyst2", createdAt: "2025-12-11T09:00:00", linkedTo: [9, 23] },
    { id: 33, category: "address", name: "Community Association, 4 Heritage Lane, Region Delta", context: "confirmed", country: "Region Delta", tags: ["office", "community-center"],
      narrative: "Office and community center. Houses cultural programs, integration services, and community events. Meeting point for civil society.",
      createdBy: "analyst1", createdAt: "2025-12-10T09:00:00", linkedTo: [15, 29] },
    { id: 34, category: "address", name: "Initiatives Office, 12 October St, Region Gamma", context: "confirmed", country: "International", tags: ["office", "headquarters"],
      narrative: "Central European office of the International Initiatives Office. Central hub for program coordination. Hosts meetings with civil society leaders from across Europe.",
      createdBy: "admin", createdAt: "2025-12-09T09:00:00", linkedTo: [16, 25] },
    { id: 35, category: "address", name: "44 Garden Avenue, Brussels, Belgium", context: "confirmed", country: "Belgium", tags: ["office", "headquarters", "shared-address"],
      narrative: "Shared Brussels headquarters of the European Advocacy Foundation and Enterprise Development Initiative. Houses executive office, EU policy team, grants administration, and entrepreneurship programs coordination.",
      createdBy: "admin", createdAt: "2025-12-08T09:00:00", linkedTo: [19, 26, 45, 73, 74] },
    { id: 36, category: "address", name: "Civil Rights Group, 19 Central Blvd, Region Alpha", context: "confirmed", country: "Region Alpha", tags: ["office", "headquarters"],
      narrative: "Headquarters of the Civil Rights Monitoring Group. Office space for legal team, monitoring staff, and administration.",
      createdBy: "analyst1", createdAt: "2025-12-07T09:00:00", linkedTo: [3, 21] },

    // ── MOBILE NUMBERS ──
    { id: 37, category: "mobile", name: "+00 700 100 001", context: "confirmed", country: "Region Alpha", tags: ["primary-contact"],
      narrative: "Primary organizational contact for the Civil Rights Monitoring Group. Used for coordination with partner organizations and media inquiries.",
      createdBy: "analyst1", createdAt: "2025-12-06T09:00:00", linkedTo: [3, 21] },
    { id: 38, category: "mobile", name: "+00 700 200 002", context: "confirmed", country: "Region Beta", tags: ["primary-contact"],
      narrative: "Contact number for the Regional Education Center coordination. Used for school network communications and program coordination.",
      createdBy: "analyst2", createdAt: "2025-12-05T09:00:00", linkedTo: [6, 22] },
    { id: 39, category: "mobile", name: "+00 700 300 003", context: "confirmed", country: "International", tags: ["primary-contact"],
      narrative: "International Initiatives Office contact. Used by director's office for high-level coordination with civil society leaders.",
      createdBy: "admin", createdAt: "2025-12-04T09:00:00", linkedTo: [16, 25] },
    { id: 40, category: "mobile", name: "+00 700 400 004", context: "confirmed", country: "Region Delta", tags: ["primary-contact"],
      narrative: "Community Empowerment Association office line. Primary contact for community programs and integration services.",
      createdBy: "analyst1", createdAt: "2025-12-03T09:00:00", linkedTo: [15, 29] },
    { id: 41, category: "mobile", name: "+00 700 500 005", context: "confirmed", country: "International", tags: ["primary-contact"],
      narrative: "European Advocacy Foundation Brussels headquarters main line. Used for EU institutional communications and partner coordination.",
      createdBy: "admin", createdAt: "2025-12-02T09:00:00", linkedTo: [19, 26] },

    // ── VEHICLES ──
    { id: 42, category: "vehicle", name: "RA-492-OPS", context: "confirmed", country: "Region Alpha", tags: ["organizational"],
      narrative: "Civil Rights Monitoring Group field operations vehicle. Used for monitoring missions, community visits, and documentation trips.",
      createdBy: "fieldops1", createdAt: "2025-12-01T09:00:00", linkedTo: [21, 36] },
    { id: 43, category: "vehicle", name: "RB-831-EDU", context: "confirmed", country: "Region Beta", tags: ["organizational"],
      narrative: "Regional Education Center field vehicle. Used for visits to partner schools across the network of 280+ schools.",
      createdBy: "fieldops2", createdAt: "2025-11-30T09:00:00", linkedTo: [22, 31] },
    { id: 44, category: "vehicle", name: "EU-BRU-001", context: "confirmed", country: "International", tags: ["organizational"],
      narrative: "European Advocacy Foundation Brussels office vehicle. Used for EU institutional meetings and travel between Brussels and Strasbourg.",
      createdBy: "admin", createdAt: "2025-11-29T09:00:00", linkedTo: [26, 35] },

    // ── ADDITIONAL ORGANIZATIONS ──
    { id: 45, category: "company", name: "Enterprise Development Initiative", context: "confirmed", country: "Belgium", tags: ["entrepreneurship", "funding", "youth", "economic-empowerment"],
      narrative: "Entrepreneurship development initiative. Registered in Brussels (shared address with European Advocacy Foundation). Connected to international foundation ecosystem. Provides mentoring, seed funding, and business training for community-led startups. Operates in 5 countries. Annual grantmaking: ~€2M.",
      createdBy: "admin", createdAt: "2025-11-28T09:00:00", linkedTo: [25, 26, 27, 51, 35, 73, 74] },
    { id: 46, category: "company", name: "Democracy Platform", context: "confirmed", country: "International", tags: ["democracy", "political-participation", "advocacy"],
      narrative: "Platform promoting political participation and civic engagement across Europe. Supports candidates in local and national elections. Provides training on democratic processes and political leadership development.",
      createdBy: "admin", createdAt: "2025-11-27T09:00:00", linkedTo: [26, 25, 48] },
    { id: 47, category: "company", name: "European Institute for Arts and Culture", context: "confirmed", country: "International", tags: ["culture", "arts", "heritage"],
      narrative: "Founded 2017, based in Berlin. Joint initiative of Council of Europe, international foundations, and community leaders. Promotes arts, culture, and history. Counters discrimination through cultural production. Organizes exhibitions, film screenings, publications.",
      createdBy: "admin", createdAt: "2025-11-26T09:00:00", linkedTo: [55, 56, 57, 58, 12, 62, 64, 67, 70] },
    { id: 48, category: "company", name: "Council of Europe Community Rights Team", context: "confirmed", country: "International", tags: ["policy", "monitoring", "human-rights"],
      narrative: "Dedicated team within Council of Europe Secretariat. Implements strategic action plan for community inclusion. Coordinates with ECRI, Commissioner for Human Rights, and Congress of Local Authorities. Monitors rights across 46 member states.",
      createdBy: "admin", createdAt: "2025-11-25T09:00:00", linkedTo: [59, 60, 64, 68, 71, 28] },
    { id: 49, category: "company", name: "European Commission DG Justice Policy Unit", context: "confirmed", country: "International", tags: ["policy", "EU", "strategy"],
      narrative: "Unit within DG Justice responsible for the EU Strategic Framework 2020-2030. Coordinates national strategic frameworks across EU member states. Monitors implementation of Council Recommendation on equality, inclusion and participation.",
      createdBy: "admin", createdAt: "2025-11-24T09:00:00", linkedTo: [63, 66, 26, 28] },
    { id: 50, category: "company", name: "World Bank Inclusion Initiative", context: "confirmed", country: "International", tags: ["development", "research", "funding"],
      narrative: "World Bank program supporting inclusion in Central and Eastern Europe. Provides technical assistance, research, and project financing. Works with governments on education, employment, housing, and health programs.",
      createdBy: "admin", createdAt: "2025-11-23T09:00:00", linkedTo: [66, 27, 25] },

    // ── PERSONS: Education Fund ──
    { id: 51, category: "person", name: "ACTOR-021", context: "confirmed", country: "Region Alpha", tags: ["leadership", "education", "funding"],
      narrative: "Former executive director of the Education Fund International. Built the fund into a major international education organization. Oversaw scholarship programs supporting over 100,000 students across 16 countries. Connected to the European Advocacy Foundation board.",
      createdBy: "analyst1", createdAt: "2025-11-22T09:00:00", linkedTo: [27, 45, 26, 25] },
    { id: 52, category: "person", name: "ACTOR-022", context: "confirmed", country: "International", tags: ["education", "program-management", "youth"],
      narrative: "Program director at the Education Fund International. Manages country programs in the Western Balkans. Expertise in education access and quality improvement. Coordinates with local organizations on scholarship distribution.",
      createdBy: "analyst2", createdAt: "2025-11-21T09:00:00", linkedTo: [27, 25, 45] },
    { id: 53, category: "person", name: "ACTOR-023", context: "confirmed", country: "Region Alpha", tags: ["research", "education", "data"],
      narrative: "Research director formerly at the Education Fund International. Sociologist specializing in quantitative research on education outcomes. Published key studies on school segregation and educational attainment gaps.",
      createdBy: "analyst1", createdAt: "2025-11-20T09:00:00", linkedTo: [27, 21, 30] },
    { id: 54, category: "person", name: "ACTOR-024", context: "confirmed", country: "Region Gamma", tags: ["education", "communications", "advocacy"],
      narrative: "Former communications and external relations officer at the Education Fund International. Professional with experience in educational advocacy and institutional communications.",
      createdBy: "analyst2", createdAt: "2025-11-19T09:00:00", linkedTo: [27, 25, 72] },

    // ── PERSONS: Arts & Culture ──
    { id: 55, category: "person", name: "ACTOR-025", context: "confirmed", country: "Region Gamma", tags: ["culture", "arts", "leadership"],
      narrative: "Executive director and co-founder of the European Institute for Arts and Culture. Art historian and curator. First community curator at a major international biennale. PhD in art history. Pioneered recognition of contemporary community art in mainstream European cultural institutions.",
      createdBy: "analyst1", createdAt: "2025-11-18T09:00:00", linkedTo: [47, 25, 48] },
    { id: 56, category: "person", name: "ACTOR-026", context: "confirmed", country: "International", tags: ["culture", "research", "advocacy"],
      narrative: "Deputy director of the European Institute for Arts and Culture. Academic researcher and cultural activist. PhD research on cultural production and identity politics. Former fellow at the European University Institute.",
      createdBy: "analyst1", createdAt: "2025-11-17T09:00:00", linkedTo: [47, 26] },
    { id: 57, category: "person", name: "ACTOR-027", context: "confirmed", country: "International", tags: ["arts", "culture", "heritage"],
      narrative: "Artist and academic based in the UK. Connected to the Institute as board advisor. PhD from a top art college. Work explores visual culture, flag design, and identity markers. Exhibited internationally.",
      createdBy: "analyst2", createdAt: "2025-11-16T09:00:00", linkedTo: [47] },
    { id: 58, category: "person", name: "ACTOR-028", context: "confirmed", country: "International", tags: ["research", "culture", "women-rights"],
      narrative: "Professor of Women's and Gender Studies at a major US university. Scholar connected to the Institute advisory network. Research on women's rights, transnational identity, and globalization. Board member of the European Rights Centre.",
      createdBy: "analyst1", createdAt: "2025-11-15T09:00:00", linkedTo: [47, 28] },

    // ── PERSONS: Council of Europe ──
    { id: 59, category: "person", name: "ACTOR-029", context: "confirmed", country: "International", tags: ["policy", "human-rights", "leadership"],
      narrative: "Special representative of the Secretary General of the Council of Europe for community issues. Human rights lawyer. Coordinates the Community Rights Team. Oversees implementation of the strategic action plan for inclusion.",
      createdBy: "admin", createdAt: "2025-11-14T09:00:00", linkedTo: [48, 26, 28] },
    { id: 60, category: "person", name: "ACTOR-030", context: "confirmed", country: "International", tags: ["policy", "leadership", "advocacy"],
      narrative: "President of the European Community Forum at the Council of Europe. Pioneering community leader in Nordic countries. Advocates for inclusion in EU and CoE policy frameworks. Connected to the European Advocacy Foundation board.",
      createdBy: "admin", createdAt: "2025-11-13T09:00:00", linkedTo: [48, 26] },

    // ── PERSONS: EU Parliament ──
    { id: 61, category: "person", name: "ACTOR-031", context: "confirmed", country: "International", tags: ["political-participation", "human-rights", "leadership"],
      narrative: "Former Member of European Parliament (2014-2019). First community woman elected to EP from a Nordic country. Served on Civil Liberties (LIBE) committee. Championed rights, anti-discrimination legislation, and refugee rights.",
      createdBy: "analyst1", createdAt: "2025-11-12T09:00:00", linkedTo: [47, 48] },
    { id: 62, category: "person", name: "ACTOR-032", context: "confirmed", country: "International", tags: ["political-participation", "culture", "leadership"],
      narrative: "Member of European Parliament (Greens/EFA). Professional musician and politician. Serves on Culture and Education (CULT) committee. Advocates for cultural recognition and anti-discrimination. Connected to the Institute for Arts and Culture.",
      createdBy: "analyst1", createdAt: "2025-11-11T09:00:00", linkedTo: [47, 48, 64] },
    { id: 63, category: "person", name: "ACTOR-033", context: "confirmed", country: "Region Gamma", tags: ["political-participation", "policy", "leadership"],
      narrative: "Vice-President of the European Parliament. Social anthropologist by training. Served multiple terms as MEP. Key contact between European institutions and civil society. Connected to DG Justice policy processes.",
      createdBy: "analyst1", createdAt: "2025-11-10T09:00:00", linkedTo: [49, 27] },

    // ── PERSONS: Other Key Figures ──
    { id: 64, category: "person", name: "ACTOR-034", context: "confirmed", country: "International", tags: ["civil-rights", "holocaust", "leadership"],
      narrative: "Chairman of the Central Council of a minority community. Leading civil rights figure since 1980s. Instrumental in achieving official recognition of the community genocide. Established a documentation and cultural centre. Key figure in Holocaust remembrance.",
      createdBy: "admin", createdAt: "2025-11-09T09:00:00", linkedTo: [48, 47, 62] },
    { id: 65, category: "person", name: "ACTOR-035", context: "confirmed", country: "International", tags: ["research", "linguistics", "advocacy"],
      narrative: "Professor Emeritus at a major US university. Pioneer of community studies as academic discipline. Author of foundational texts. Former representative to the United Nations. Expert on community language and history.",
      createdBy: "analyst2", createdAt: "2025-11-08T09:00:00", linkedTo: [28] },
    { id: 66, category: "person", name: "ACTOR-036", context: "confirmed", country: "International", tags: ["policy", "research", "development"],
      narrative: "Senior inclusion advisor, formerly with UNDP. Key author of human development reports. Expert on socioeconomic data and indicators. Currently advises European Commission DG Justice on strategic framework implementation.",
      createdBy: "admin", createdAt: "2025-11-07T09:00:00", linkedTo: [49, 50, 25] },
    { id: 67, category: "person", name: "ACTOR-037", context: "confirmed", country: "Region Beta", tags: ["research", "linguistics", "education"],
      narrative: "Academic and psycholinguist. Professor at a European university. Expert on language acquisition and bilingual education. Author of over 200 publications on education and language. Advocate for language preservation.",
      createdBy: "analyst2", createdAt: "2025-11-06T09:00:00", linkedTo: [22, 47] },
    { id: 68, category: "person", name: "ACTOR-038", context: "confirmed", country: "International", tags: ["research", "policy", "advocacy"],
      narrative: "Professor Emeritus of community studies at a UK university. Leading scholar. Extensive publication record on history, politics, and identity. Connected to Council of Europe research programs and the European Rights Centre.",
      createdBy: "analyst2", createdAt: "2025-11-05T09:00:00", linkedTo: [28, 48] },
    { id: 69, category: "person", name: "ACTOR-039", context: "confirmed", country: "International", tags: ["political-participation", "legal", "leadership"],
      narrative: "Politician and lawyer. First community member of national parliament and first community MEP. Founded a national advocacy union. Pioneering figure in political representation. Legal advocate for rights at European level.",
      createdBy: "analyst1", createdAt: "2025-11-04T09:00:00", linkedTo: [26] },

    // ── ADDITIONAL ADDRESSES ──
    { id: 70, category: "address", name: "Institute for Arts, 7 Cultural Blvd, Berlin, Germany", context: "confirmed", country: "International", tags: ["office", "headquarters"],
      narrative: "Headquarters of the European Institute for Arts and Culture in central Berlin. Houses exhibition space, office facilities, and cultural event venue.",
      createdBy: "admin", createdAt: "2025-11-03T09:00:00", linkedTo: [47, 55] },
    { id: 71, category: "address", name: "Council of Europe, Avenue de l'Europe, Strasbourg, France", context: "confirmed", country: "International", tags: ["institutional", "headquarters"],
      narrative: "Headquarters of the Council of Europe. Houses the Community Rights Team. Location of forum meetings and policy coordination.",
      createdBy: "admin", createdAt: "2025-11-02T09:00:00", linkedTo: [48, 59] },
    { id: 72, category: "address", name: "Education Fund HQ, 46 Ring Road, Region Gamma", context: "confirmed", country: "Region Gamma", tags: ["office", "headquarters"],
      narrative: "Headquarters of the Education Fund International. Central office for managing scholarship programs across 16 countries.",
      createdBy: "analyst1", createdAt: "2025-11-01T09:00:00", linkedTo: [27, 51, 54] },

    // ── KEY PERSONS: Brussels ──
    { id: 73, category: "person", name: "ACTOR-040", context: "confirmed", country: "Belgium", tags: ["entrepreneurship", "leadership", "community-development"],
      narrative: "Board member of the Enterprise Development Initiative. Based at the shared Brussels headquarters. Active in economic empowerment initiatives. Connected to the European Advocacy Foundation network. Engaged in Brussels-based advocacy and community organizing.",
      createdBy: "admin", createdAt: "2025-10-30T09:00:00", linkedTo: [45, 26, 35] },
    { id: 74, category: "person", name: "ACTOR-041", context: "confirmed", country: "Belgium", tags: ["leadership", "policy", "strategy", "entrepreneurship"],
      narrative: "Vice-President of the European Advocacy Foundation. Also active within the Enterprise Development Initiative at the shared Brussels headquarters. Extensive experience in European policy coordination. Key bridge between policy work and entrepreneurship programs.",
      createdBy: "admin", createdAt: "2025-10-29T09:00:00", linkedTo: [26, 45, 16, 19, 35] },

    // ── EXPANDED EUROPEAN NETWORK ──
    { id: 75, category: "person", name: "ACTOR-042", context: "confirmed", country: "Region Epsilon", tags: ["legal", "political-participation", "leadership"],
      narrative: "Lawyer and former member of national congress. First community woman to serve in national parliament. Legal advisor to a major national foundation. Expert on anti-discrimination law. Connected to the European Advocacy Foundation.",
      createdBy: "analyst1", createdAt: "2025-10-28T09:00:00", linkedTo: [26, 87] },
    { id: 76, category: "person", name: "ACTOR-043", context: "confirmed", country: "Region Zeta", tags: ["policy", "leadership", "strategy"],
      narrative: "Former government plenipotentiary for community affairs. Pioneering policy maker in Central Europe. Led development of a national integration strategy. Advisor to the Education Fund and international foundations.",
      createdBy: "analyst1", createdAt: "2025-10-27T09:00:00", linkedTo: [27, 26, 25] },
    { id: 77, category: "person", name: "ACTOR-044", context: "confirmed", country: "Region Eta", tags: ["advocacy", "community-development", "leadership"],
      narrative: "Executive director of a community center. Leading civil society figure in the Western Balkans. Coordinator of civic initiatives. Connected to the European Rights Centre through joint monitoring programs. Advocates for inclusion in EU accession processes.",
      createdBy: "analyst2", createdAt: "2025-10-26T09:00:00", linkedTo: [28, 81] },
    { id: 78, category: "person", name: "ACTOR-045", context: "confirmed", country: "Region Theta", tags: ["political-participation", "advocacy", "culture"],
      narrative: "Politician and activist. Former member of national parliament representing community interests. Advocate for political representation in the Western Balkans. Active in cross-border civil society coordination.",
      createdBy: "analyst2", createdAt: "2025-10-25T09:00:00", linkedTo: [27, 48] },
    { id: 79, category: "person", name: "ACTOR-046", context: "confirmed", country: "Region Iota", tags: ["civil-rights", "holocaust", "education"],
      narrative: "Chairperson of a regional civil rights association. Prominent voice in memorial culture. Active in education programs about historical persecution. Engages with national government on recognition policies.",
      createdBy: "analyst1", createdAt: "2025-10-24T09:00:00", linkedTo: [64, 47] },
    { id: 80, category: "person", name: "ACTOR-047", context: "confirmed", country: "Region Kappa", tags: ["research", "legal", "advocacy"],
      narrative: "Researcher and legal advocate. Author of a groundbreaking study on designated community sites. Campaigns against discriminatory municipal policies. Connected to the European Rights Centre through litigation cases. Emerging voice in national rights discourse.",
      createdBy: "analyst2", createdAt: "2025-10-23T09:00:00", linkedTo: [28] },
    { id: 81, category: "person", name: "ACTOR-048", context: "confirmed", country: "Region Eta", tags: ["policy", "development", "research"],
      narrative: "Team leader of an integration action team at a regional cooperation council. Oversees implementation of integration commitments. Connected to OSCE and Council of Europe programs. Expert on socioeconomic indicators in the Western Balkans.",
      createdBy: "admin", createdAt: "2025-10-22T09:00:00", linkedTo: [48, 77, 50] },
    { id: 82, category: "person", name: "ACTOR-049", context: "likely", country: "Region Epsilon", tags: ["education", "youth", "community-development"],
      narrative: "Education specialist. Connected to a national foundation's education programs. Works on school retention and university access initiatives for youth. Likely connected to the Education Fund through pan-European scholarship coordination.",
      createdBy: "analyst2", createdAt: "2025-10-21T09:00:00", linkedTo: [87, 27] },
    { id: 83, category: "person", name: "ACTOR-050", context: "confirmed", country: "International", tags: ["advocacy", "history", "civil-rights"],
      narrative: "Veteran rights activist. Co-founded the first World Congress in 1971. Key figure in establishing the international political movement. Historical figure in the movement for self-determination.",
      createdBy: "analyst1", createdAt: "2025-10-20T09:00:00", linkedTo: [65] },
    { id: 84, category: "person", name: "ACTOR-051", context: "confirmed", country: "Region Alpha", tags: ["leadership", "policy", "memorial"],
      narrative: "Pioneering sociologist and human rights defender (1946-2013). Former OSCE Contact Point for community issues. Founded a major civil rights organization. Instrumental in bringing rights to international attention. Legacy continues to shape European policy. Memorial events held annually.",
      createdBy: "admin", createdAt: "2025-10-19T09:00:00", linkedTo: [21, 28, 25] },
    { id: 85, category: "person", name: "ACTOR-052", context: "likely", country: "Region Iota", tags: ["media", "culture", "advocacy"],
      narrative: "Media professional. Produces documentary content on communities across Europe. Likely involved in Institute media programs. Connected to national media network. Reported collaboration with European media platforms.",
      createdBy: "analyst2", createdAt: "2025-10-18T09:00:00", linkedTo: [47, 64] },
    { id: 86, category: "person", name: "ACTOR-053", context: "confirmed", country: "International", tags: ["women-rights", "advocacy", "research"],
      narrative: "Women's rights advocate. Former program officer at the International Initiatives Office. Expert on intersectional discrimination. Published research on women's access to healthcare and education. Active in UN mechanisms on minority women's rights.",
      createdBy: "analyst1", createdAt: "2025-10-17T09:00:00", linkedTo: [25, 21, 28, 2] },

    // ── ADDITIONAL ORGANIZATIONS ──
    { id: 87, category: "company", name: "National Inclusion Foundation", context: "confirmed", country: "Region Epsilon", tags: ["education", "employment", "advocacy"],
      narrative: "Region Epsilon's largest inclusion organization. Founded 1982. Programs: employment access, education promotion, health mediation. Operates in 14 regions and 6 EU countries. Staff: 600+. Annual budget: ~€20M. Key partner of the national government.",
      createdBy: "admin", createdAt: "2025-10-16T09:00:00", linkedTo: [75, 82, 26, 91] },
    { id: 88, category: "company", name: "OSCE Contact Point for Community Issues", context: "confirmed", country: "International", tags: ["policy", "monitoring", "human-rights"],
      narrative: "Established within OSCE Office for Democratic Institutions and Human Rights. Mandated to promote community rights across 57 participating States. Focus: combating discrimination, improving political participation.",
      createdBy: "admin", createdAt: "2025-10-15T09:00:00", linkedTo: [84, 48, 49, 77] },
    { id: 89, category: "company", name: "International Youth Network", context: "confirmed", country: "International", tags: ["youth", "volunteering", "education"],
      narrative: "International network of youth organizations promoting voluntary service and intercultural learning. Based in Brussels and Central Europe. Runs European Voluntary Service programs. Facilitates youth exchanges across 12 European countries.",
      createdBy: "analyst1", createdAt: "2025-10-14T09:00:00", linkedTo: [27, 47, 26] },
    { id: 90, category: "company", name: "Traveller & Community Centre", context: "confirmed", country: "International", tags: ["advocacy", "community-development", "research"],
      narrative: "Dublin-based organization working with Traveller and migrant communities. Research center producing data on health, education, and accommodation. Connected to Council of Europe. Partner of the European Rights Centre.",
      createdBy: "analyst2", createdAt: "2025-10-13T09:00:00", linkedTo: [28, 48] },
    { id: 91, category: "company", name: "Regional Civil Rights Association", context: "confirmed", country: "Region Iota", tags: ["civil-rights", "holocaust", "advocacy"],
      narrative: "Regional civil rights organization. Focus: memorial culture, anti-discrimination advocacy, education programs. Maintains a memorial site. Connected to the Central Council. Engages with regional government on inclusion policies.",
      createdBy: "analyst1", createdAt: "2025-10-12T09:00:00", linkedTo: [79, 64] },

    // ── ADDITIONAL ADDRESSES ──
    { id: 92, category: "address", name: "National Inclusion Foundation HQ, Region Epsilon", context: "confirmed", country: "Region Epsilon", tags: ["office", "headquarters"],
      narrative: "National headquarters of the National Inclusion Foundation. Houses central program coordination, research department, and administration.",
      createdBy: "analyst1", createdAt: "2025-10-11T09:00:00", linkedTo: [87, 75] },
    { id: 93, category: "address", name: "OSCE/ODIHR, 10 Diplomatic Row, Warsaw, Poland", context: "confirmed", country: "International", tags: ["institutional", "headquarters"],
      narrative: "Office for Democratic Institutions and Human Rights of OSCE. Houses the Contact Point for Community Issues.",
      createdBy: "admin", createdAt: "2025-10-10T09:00:00", linkedTo: [88] },

    // ── ADDITIONAL MOBILE NUMBERS ──
    { id: 94, category: "mobile", name: "+00 700 600 006", context: "confirmed", country: "Region Epsilon", tags: ["primary-contact"],
      narrative: "National Inclusion Foundation headquarters main line. Used for program coordination and institutional communications.",
      createdBy: "analyst1", createdAt: "2025-10-09T09:00:00", linkedTo: [87, 92] },
    { id: 95, category: "mobile", name: "+00 700 700 007", context: "confirmed", country: "Belgium", tags: ["primary-contact"],
      narrative: "Enterprise Development Initiative Brussels office line. Shared premises with the European Advocacy Foundation. Used for entrepreneurship program coordination.",
      createdBy: "admin", createdAt: "2025-10-08T09:00:00", linkedTo: [45, 35] },

    // ── ADDITIONAL VEHICLES ──
    { id: 96, category: "vehicle", name: "BRU-EAF-001", context: "confirmed", country: "Belgium", tags: ["organizational"],
      narrative: "European Advocacy Foundation Brussels pool vehicle. Used for travel to EU institutions and Strasbourg European Parliament sessions.",
      createdBy: "admin", createdAt: "2025-10-07T09:00:00", linkedTo: [26, 35] },

    // ── INTELLIGENCE ENTRIES: Varying reliability ──
    { id: 97, category: "person", name: "ACTOR-054", context: "rumor", country: "Region Beta", tags: ["funding", "community-development"],
      narrative: "Reported community organizer. Unverified claims of involvement in EU-funded community development projects. Possibly connected to the Regional Education Center network. Requires further verification.",
      createdBy: "fieldops2", createdAt: "2025-10-06T09:00:00", linkedTo: [22] },
    { id: 98, category: "person", name: "ACTOR-055", context: "rumor", country: "Region Beta", tags: ["education", "youth"],
      narrative: "Reported participant in Education Fund scholarship program. Unverified involvement in youth advocacy. Possibly connected to the Regional Education Center network. Initial field report pending corroboration.",
      createdBy: "fieldops2", createdAt: "2025-10-05T09:00:00", linkedTo: [27] },
    { id: 99, category: "person", name: "ACTOR-056", context: "likely", country: "Region Zeta", tags: ["community-development", "advocacy"],
      narrative: "Community leader. Likely involved in local inclusion initiatives and municipal coordination. Reported connections to the Education Fund through regional scholarship programs. Emerging figure in civil society.",
      createdBy: "analyst2", createdAt: "2025-10-04T09:00:00", linkedTo: [27, 76] },
    { id: 100, category: "person", name: "ACTOR-057", context: "likely", country: "Region Eta", tags: ["women-rights", "legal", "advocacy"],
      narrative: "Likely women's rights advocate. Reported involvement in legal aid programs for women facing discrimination. Possibly connected to community center and monitoring programs. Profile emerging through civil society mapping.",
      createdBy: "analyst2", createdAt: "2025-10-03T09:00:00", linkedTo: [77, 28] },
    { id: 101, category: "company", name: "Community Active Network", context: "likely", country: "International", tags: ["advocacy", "community-development"],
      narrative: "Emerging civil society organization reportedly based in the Western Balkans. Likely focused on inclusion in national strategy. Reported connections to regional cooperation programs. Requires verification of organizational structure.",
      createdBy: "analyst2", createdAt: "2025-10-02T09:00:00", linkedTo: [81] },
    { id: 102, category: "mobile", name: "+00 700 800 008", context: "rumor", country: "Region Beta", tags: ["field-contact"],
      narrative: "Unverified contact number reportedly associated with community organizing. Flagged in field operations report. Requires verification before operational use.",
      createdBy: "fieldops2", createdAt: "2025-10-01T09:00:00", linkedTo: [97] },
  ],
  pendingValidations: [
    { id: 1, entryId: 14, targetName: "ACTOR-014", suggestedLink: "Community Empowerment Association", suggestedLinkId: 29, submittedBy: "analyst2", submittedAt: "2026-02-20T10:00:00", reason: "Both active in Region Delta civil society - possible collaboration" },
    { id: 2, entryId: 8, targetName: "ACTOR-008", suggestedLink: "European Advocacy Foundation", suggestedLinkId: 26, submittedBy: "analyst1", submittedAt: "2026-02-18T14:00:00", reason: "Attended annual conference as speaker - potential board candidate" },
    { id: 3, entryId: 11, targetName: "ACTOR-011", suggestedLink: "International Initiatives Office", suggestedLinkId: 25, submittedBy: "analyst2", submittedAt: "2026-02-15T11:00:00", reason: "Received media grant for journalism project" },
  ],
  logs: [
    { ts: "2026-02-28T16:30:00", user: "analyst1", action: "SEARCH", detail: "Searched for \"ACTOR-016\" | Reason: Mapping leadership network" },
    { ts: "2026-02-28T15:00:00", user: "analyst2", action: "SEARCH", detail: "Searched for \"Regional Education Center\" | Reason: Education program review" },
    { ts: "2026-02-28T14:20:00", user: "analyst1", action: "VIEW", detail: "Viewed full record: European Advocacy Foundation" },
    { ts: "2026-02-28T12:00:00", user: "fieldops1", action: "ENTRY", detail: "Created new entry: RA-492-OPS (vehicle)" },
    { ts: "2026-02-27T16:00:00", user: "analyst2", action: "LINK", detail: "Linked ACTOR-006 ↔ European Advocacy Foundation" },
    { ts: "2026-02-27T14:30:00", user: "analyst1", action: "SEARCH", detail: "Searched for \"European Rights Centre\" | Reason: Litigation case review" },
    { ts: "2026-02-27T10:00:00", user: "analyst1", action: "ENTRY", detail: "Created new entry: ACTOR-019 (person)" },
    { ts: "2026-02-26T15:00:00", user: "analyst2", action: "VIEW", detail: "Viewed full record: ACTOR-001" },
    { ts: "2026-02-26T11:30:00", user: "fieldops1", action: "ACCESS_REQ", detail: "Requested full access to: ACTOR-016" },
    { ts: "2026-02-26T09:00:00", user: "analyst1", action: "ENTRY", detail: "Created new entry: ACTOR-018 (person)" },
    { ts: "2026-02-25T16:00:00", user: "analyst2", action: "SEARCH", detail: "Searched for \"Education Fund International\" | Reason: Scholarship program analysis" },
    { ts: "2026-02-25T14:00:00", user: "admin", action: "SIGNAL_SET", detail: "Set signal: European Advocacy Foundation" },
    { ts: "2026-02-25T10:30:00", user: "analyst1", action: "LINK", detail: "Linked ACTOR-002 ↔ European Advocacy Foundation" },
    { ts: "2026-02-24T15:00:00", user: "analyst2", action: "VIEW", detail: "Viewed full record: ACTOR-009" },
    { ts: "2026-02-24T10:00:00", user: "analyst1", action: "ENTRY", detail: "Created new entry: ACTOR-020 (person)" },
    { ts: "2026-02-23T14:00:00", user: "admin", action: "VALIDATE_APPROVE", detail: "Approved: ACTOR-007 → Regional Education Center" },
    { ts: "2026-02-23T11:00:00", user: "fieldops2", action: "ENTRY", detail: "Created new entry: RB-831-EDU (vehicle)" },
    { ts: "2026-02-22T16:00:00", user: "analyst1", action: "SEARCH", detail: "Searched for \"Civil Rights Monitoring Group\" | Reason: Partner mapping" },
    { ts: "2026-02-22T10:00:00", user: "analyst2", action: "ENTRY", detail: "Created new entry: ACTOR-012 (person)" },
    { ts: "2026-02-21T14:00:00", user: "analyst1", action: "VIEW", detail: "Viewed full record: ACTOR-015" },
    { ts: "2026-02-20T09:00:00", user: "admin", action: "USER_CREATE", detail: "Created user: fieldops2 (basic)" },
  ],
  signals: [
    { entityId: 26, entityName: "European Advocacy Foundation", setBy: "admin", setAt: "2026-02-25T14:00:00" },
    { entityId: 16, entityName: "ACTOR-016", setBy: "admin", setAt: "2026-02-20T09:00:00" },
    { entityId: 19, entityName: "ACTOR-019", setBy: "admin", setAt: "2026-02-18T10:00:00" },
  ],
  notifications: [
    { message: "Validation request: ACTOR-014 → Community Empowerment Association", forUser: "admin", ts: "2026-02-20T10:00:00", read: false },
    { message: "Validation request: ACTOR-008 → European Advocacy Foundation", forUser: "admin", ts: "2026-02-18T14:00:00", read: false },
    { message: "Access request from fieldops1 for \"ACTOR-016\"", forUser: "admin", ts: "2026-02-26T11:30:00", read: false },
  ],
  reports: [
    { id: 1, title: "Brussels Strategy Meeting — Q1 2026 Planning", type: "meeting-debrief", date: "2026-01-20", location: "44 Garden Avenue, Brussels",
      attendees: [16, 19, 74, 73], externalAttendees: ["DG Justice Representative", "National Delegation Advisor"],
      sections: [
        { title: "Meeting Overview", content: "Quarterly planning session attended by leadership and external EU institutional partners. Discussed Q1 priorities including the upcoming EU Platform meeting in March 2026 and coordination of national advocacy campaigns. Executive Director presented the annual review of grant portfolio performance. Director outlined strategic vision for expanding presence in Western Balkans.", sensitivity: "standard" },
        { title: "Funding Allocation Discussion", content: "Review of €5.2M grant portfolio. Proposed reallocation of €800K from administrative overhead to direct grassroots support. Discussion of new partnership with DG Justice for pilot anti-discrimination monitoring program (€350K). EU representative indicated informal support for expanded education funding in 2027 budget cycle.", sensitivity: "sensitive" },
        { title: "Strategic Partnerships Under Consideration", content: "Confidential discussions regarding government support for inclusion within EU Presidency priorities. Preliminary agreement to co-host ministerial roundtable on integration. Potential partnership with World Bank on economic participation study — awaiting board approval. Interest signaled in merging advocacy efforts with another network to consolidate EU lobbying capacity.", sensitivity: "confidential" },
        { title: "Internal Assessment of Leadership Changes", content: "Discussion of succession planning for key positions. Assessment of organizational restructuring to separate policy and grants functions. Board evaluation of current executive performance — unanimous positive assessment. Confidential intelligence indicating potential funding strategy shift in 2027 that may affect portfolio allocation by 15-20%.", sensitivity: "top-secret" }
      ],
      tags: ["strategy", "funding", "EU-policy", "partnerships"],
      linkedEntities: [16, 19, 26, 35, 73, 74, 49],
      createdBy: "admin", createdAt: "2026-01-20T18:00:00", overallSensitivity: "top-secret", status: "reviewed" },

    { id: 2, title: "Field Visit — Regional Education Center", type: "field-report", date: "2026-02-05", location: "2 Central Square, Region Beta",
      attendees: [6], externalAttendees: ["School Coordinator", "Local Council Representative"],
      sections: [
        { title: "Visit Summary", content: "Three-day field visit to the Regional Education Center headquarters and partner schools. Met with leadership and key staff. Visited 4 partner schools implementing integrated education model. Observed community engagement sessions. Reviewed monitoring data — 78% retention rate among students in partner schools vs 52% national average.", sensitivity: "standard" },
        { title: "Community Observations", content: "Neighborhoods showing signs of improved infrastructure compared to 2024 visit. New community center opened with organizational support. Local parents increasingly engaged in school governance — 12 new parent representatives elected in partner schools. Youth mentoring program showing promising results with 23 university students serving as mentors.", sensitivity: "standard" },
        { title: "Sensitive Political Dynamics", content: "Local council representative expressed concern about upcoming municipal elections potentially affecting program funding. Current mayor supportive but challenger has made negative statements in campaign. Leadership mentioned private discussions with the national Ministry of Education about potential nationwide scaling of the integrated education model — budget implications of €4M being discussed internally. Not yet public.", sensitivity: "sensitive" }
      ],
      tags: ["education", "field-visit", "community"],
      linkedEntities: [6, 22, 31, 97, 98],
      createdBy: "fieldops1", createdAt: "2026-02-08T14:00:00", overallSensitivity: "sensitive", status: "submitted" },

    { id: 3, title: "Network Analysis — International Initiatives Office", type: "analysis", date: "2026-02-12", location: "Central Europe",
      attendees: [], externalAttendees: [],
      sections: [
        { title: "Network Overview", content: "Comprehensive analysis of the International Initiatives Office network map. 47 direct organizational partnerships identified across 14 countries. Total annual grantmaking: approximately €15M distributed through 89 active grants. Key geographic concentrations: Region Alpha (23%), Region Beta (18%), Region Gamma (14%), Region Zeta (12%), Region Delta (8%).", sensitivity: "standard" },
        { title: "Key Connections Identified", content: "ACTOR-016 maintains direct relationships with 34 organizational leaders across the network. Strong triangular relationship between the Initiatives Office, European Advocacy Foundation, and Education Fund — shared board members, co-funded programs, joint advocacy positions. Pattern detected: Initiatives Office increasingly channeling funding through the Foundation as intermediary rather than direct grants.", sensitivity: "sensitive" },
        { title: "Potential Vulnerabilities", content: "Single-point dependency on foundation funding identified for 12 organizations (receiving >60% of budget). Should the foundation reduce its portfolio (see Brussels Strategy Meeting notes regarding potential 15-20% cut), these organizations face existential risk. Recommended contingency mapping. Also identified: 3 organizations receiving funding with overlapping geographic mandates — potential consolidation candidates.", sensitivity: "confidential" }
      ],
      tags: ["network-analysis", "funding", "strategy"],
      linkedEntities: [16, 25, 26, 27, 34],
      createdBy: "analyst1", createdAt: "2026-02-14T16:00:00", overallSensitivity: "confidential", status: "reviewed" },

    { id: 4, title: "Western Balkans Integration Assessment", type: "intelligence-brief", date: "2026-02-18", location: "Remote / Multi-country",
      attendees: [77, 81], externalAttendees: ["Regional Cooperation Council Advisor", "OSCE Field Representative"],
      sections: [
        { title: "Regional Overview", content: "Assessment of integration progress across the Western Balkans. EU accession process remains primary driver for inclusion policy. Regional Cooperation Council coordinating implementation of integration commitments. Estimated 1.5-2M population across the region with significant data gaps.", sensitivity: "standard" },
        { title: "Cross-Border Movement Patterns", content: "Field intelligence indicates increased labor mobility following seasonal agricultural patterns. ACTOR-044 reports growing economic migration from the region toward EU member states. ACTOR-045 notes similar patterns. Informal cross-border networks facilitating movement — creating challenges for integration program tracking and service delivery continuity.", sensitivity: "sensitive" },
        { title: "Unverified Source Intelligence", content: "Unverified reports of new political party formation — potentially backed by opposition interests. If confirmed, could shift dynamics of political representation. Separate unverified intelligence about a major international development bank considering €50M inclusion investment, conditional on governance reforms. Source considered reliable but information unconfirmed.", sensitivity: "confidential" }
      ],
      tags: ["western-balkans", "integration", "cross-border", "political"],
      linkedEntities: [77, 81, 48, 88, 100, 101],
      createdBy: "analyst2", createdAt: "2026-02-20T10:00:00", overallSensitivity: "confidential", status: "submitted" },

    { id: 5, title: "Cultural Programs Impact Review", type: "analysis", date: "2026-02-22", location: "Berlin, Germany",
      attendees: [55, 56], externalAttendees: [],
      sections: [
        { title: "Program Assessment", content: "Review of cultural programs 2025 output. 14 exhibitions organized across 8 European cities. 3 major publications released. Digital platform received 180K unique visitors. Youth art fellowship program in 3rd year with 24 fellows from 11 countries. Growing institutional partnerships with major museums.", sensitivity: "standard" },
        { title: "Strategic Cultural Impact", content: "The Institute emerging as primary vehicle for cultural soft power in Europe. Analysis indicates correlation between cultural events and positive media coverage of communities in host cities. ACTOR-025 building effective network bridging cultural practitioners with mainstream art establishment. ACTOR-032 leveraging EP platform to amplify cultural agenda. Potential for model to be replicated for other marginalized European minorities.", sensitivity: "sensitive" }
      ],
      tags: ["culture", "arts", "impact-review"],
      linkedEntities: [47, 55, 56, 57, 62, 70],
      createdBy: "analyst1", createdAt: "2026-02-23T12:00:00", overallSensitivity: "sensitive", status: "reviewed" }
  ],
  inferredConnections: [
    { id: 1, entityA: 73, entityB: 19, confidence: 94, reason: "Shared office address and organizational affiliation",
      category: "shared-location", evidence: ["Both registered at 44 Garden Avenue, Brussels", "Both connected to European Advocacy Foundation", "Both connected to Enterprise Development Initiative", "Daily professional interaction highly probable"],
      createdAt: "2026-02-25T10:00:00", status: "confirmed" },
    { id: 2, entityA: 6, entityB: 1, confidence: 82, reason: "Co-attendance at strategy meetings and shared advocacy focus",
      category: "co-attendance", evidence: ["Both attended Brussels Strategy Meeting Q1 2026", "Both tagged with 'education' and 'advocacy'", "Both connected to European Advocacy Foundation board", "Both present at EU Platform 2025 (external records)"],
      createdAt: "2026-02-26T09:00:00", status: "new" },
    { id: 3, entityA: 75, entityB: 82, confidence: 78, reason: "National network — shared organizational ties and geographic proximity",
      category: "organizational", evidence: ["Both connected to National Inclusion Foundation", "Both based in Region Epsilon", "Same national network", "Both active in education and legal advocacy"],
      createdAt: "2026-02-26T10:00:00", status: "new" },
    { id: 4, entityA: 16, entityB: 74, confidence: 88, reason: "Foundation leadership team — high-frequency professional interaction",
      category: "behavioral", evidence: ["Chair and Vice-President of European Advocacy Foundation", "Both attend Brussels-based EU policy events regularly", "Both frequent same EU quarter establishments for working meetings (field observation)"],
      createdAt: "2026-02-27T08:00:00", status: "new" },
    { id: 5, entityA: 77, entityB: 78, confidence: 71, reason: "Western Balkans network — cross-border coordination pattern",
      category: "social-proximity", evidence: ["Adjacent regions", "Both attend OSCE meetings regularly", "Both involved in Regional Cooperation Council activities", "Observed at same coordination meeting (Oct 2025)"],
      createdAt: "2026-02-27T09:00:00", status: "new" },
    { id: 6, entityA: 64, entityB: 79, confidence: 91, reason: "Civil rights — organizational and personal connections",
      category: "behavioral", evidence: ["ACTOR-034 chairs Central Council; ACTOR-046 chairs regional association", "Both active in memorial culture", "Both members of memorial committee"],
      createdAt: "2026-02-27T10:00:00", status: "confirmed" },
    { id: 7, entityA: 2, entityB: 18, confidence: 85, reason: "Women's rights nexus — deep professional and personal ties",
      category: "social-proximity", evidence: ["Both women's rights advocates from Region Alpha", "Both previously worked at Civil Rights Monitoring Group", "Both serve on international advisory bodies for women"],
      createdAt: "2026-02-28T08:00:00", status: "new" },
    { id: 8, entityA: 55, entityB: 62, confidence: 76, reason: "Cultural sector collaboration — Institute and European Parliament intersection",
      category: "pattern-match", evidence: ["Both connected through Institute cultural programs", "ACTOR-032 champions Institute agenda in EP Culture committee", "Both attended international biennale events (2024, 2025)"],
      createdAt: "2026-02-28T09:00:00", status: "new" },
    { id: 9, entityA: 9, entityB: 10, confidence: 68, reason: "Education and civil rights overlap in Region Gamma",
      category: "organizational", evidence: ["Both key figures in Region Gamma civil society", "ACTOR-009 (civil rights) and ACTOR-010 (education) share mutual connections", "Both connected through Education Fund ecosystem", "Both attend annual civil society gathering"],
      createdAt: "2026-02-28T10:00:00", status: "new" },
    { id: 10, entityA: 51, entityB: 73, confidence: 72, reason: "Enterprise network — shared entrepreneurship focus and organizational ties",
      category: "organizational", evidence: ["Both connected to Enterprise Development Initiative", "ACTOR-021 (former Education Fund director) involved in enterprise initiative", "ACTOR-040 on enterprise board", "Both attend Brussels economic empowerment roundtables"],
      createdAt: "2026-02-28T11:00:00", status: "new" },
    { id: 11, entityA: 59, entityB: 60, confidence: 80, reason: "Council of Europe institutional nexus",
      category: "co-attendance", evidence: ["Both Council of Europe Community Rights Team leadership", "ACTOR-029 (Special Representative) works directly with ACTOR-030 (Forum President)", "Both attend quarterly CoE coordination meetings in Strasbourg"],
      createdAt: "2026-02-28T12:00:00", status: "new" },
    { id: 12, entityA: 3, entityB: 86, confidence: 74, reason: "Civil rights alumni network — gender rights advocacy",
      category: "pattern-match", evidence: ["ACTOR-003 currently leads Civil Rights Monitoring Group", "ACTOR-053 formerly at Civil Rights Monitoring Group", "Both connected to European Rights Centre through joint gender monitoring programs", "Pattern: organization alumni maintain active professional network"],
      createdAt: "2026-02-28T13:00:00", status: "new" }
  ],
  nextId: 103,
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
