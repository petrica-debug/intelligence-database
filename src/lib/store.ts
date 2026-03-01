import type { Database } from "@/types";

const STORAGE_KEY = "rfe_db_v3";

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

    // ── NEW ORGANIZATIONS ──
    { id: 45, category: "company", name: "REDI (Roma Entrepreneurship Development Initiative)", context: "confirmed", country: "International", tags: ["entrepreneurship", "funding", "youth"],
      narrative: "Initiative supporting Roma entrepreneurs across Europe. Connected to Open Society Foundations ecosystem. Provides mentoring, seed funding, and business training for Roma-led startups. Operates in Romania, Bulgaria, Hungary, Slovakia, and Czech Republic. Focus on breaking cycles of poverty through economic empowerment.",
      createdBy: "admin", createdAt: "2025-11-28T09:00:00", linkedTo: [25, 26, 27, 51] },
    { id: 46, category: "company", name: "Roma for Democracy", context: "confirmed", country: "International", tags: ["democracy", "political-participation", "advocacy"],
      narrative: "Platform promoting Roma political participation and civic engagement across Europe. Supports Roma candidates in local and national elections. Provides training on democratic processes, voter registration drives, and political leadership development. Connected to Roma Foundations for Europe and OSCE Roma Contact Point.",
      createdBy: "admin", createdAt: "2025-11-27T09:00:00", linkedTo: [26, 25, 48] },
    { id: 47, category: "company", name: "ERIAC (European Roma Institute for Arts and Culture)", context: "confirmed", country: "International", tags: ["culture", "arts", "heritage"],
      narrative: "European Roma Institute for Arts and Culture. Founded 2017, based in Berlin. Joint initiative of Council of Europe, Open Society Foundations, and Roma leaders. Promotes Roma arts, culture, and history. Counters antigypsyism through cultural production. Executive Director: Timea Junghaus. Organizes exhibitions, film screenings, publications. Partner of Documenta and Venice Biennale programs.",
      createdBy: "admin", createdAt: "2025-11-26T09:00:00", linkedTo: [55, 56, 57, 58, 12, 62, 64, 67, 70] },
    { id: 48, category: "company", name: "Council of Europe Roma & Travellers Team", context: "confirmed", country: "International", tags: ["policy", "monitoring", "human-rights"],
      narrative: "Dedicated team within Council of Europe Secretariat. Implements CoE Strategic Action Plan for Roma and Traveller Inclusion. Headed by Special Representative of Secretary General. Coordinates with ECRI, Commissioner for Human Rights, and Congress of Local Authorities. Monitors Roma rights across 46 member states. Supports European Roma and Travellers Forum (ERTF).",
      createdBy: "admin", createdAt: "2025-11-25T09:00:00", linkedTo: [59, 60, 64, 68, 71, 28] },
    { id: 49, category: "company", name: "European Commission DG Justice Roma Policy Unit", context: "confirmed", country: "International", tags: ["policy", "EU", "strategy"],
      narrative: "Unit within DG Justice and Consumers responsible for EU Roma Strategic Framework 2020-2030. Coordinates National Roma Strategic Frameworks across EU member states. Monitors implementation of Council Recommendation on Roma equality, inclusion and participation. Works with EU Agency for Fundamental Rights (FRA) on Roma surveys. Key institutional partner for Roma civil society organizations.",
      createdBy: "admin", createdAt: "2025-11-24T09:00:00", linkedTo: [63, 66, 26, 28] },
    { id: 50, category: "company", name: "World Bank Roma Inclusion Initiative", context: "confirmed", country: "International", tags: ["development", "research", "funding"],
      narrative: "World Bank program supporting Roma inclusion in Central and Eastern Europe. Provides technical assistance, research, and project financing for Roma integration. Key publications: Roma Inclusion reports, Regional Roma Survey data. Works with governments on education, employment, housing, and health programs. Connected to Roma Education Fund and UNDP Roma programs.",
      createdBy: "admin", createdAt: "2025-11-23T09:00:00", linkedTo: [66, 27, 25] },

    // ── PERSONS: Roma Education Fund ──
    { id: 51, category: "person", name: "Costel Bercuș", context: "confirmed", country: "Romania", tags: ["leadership", "education", "funding"],
      narrative: "Former Executive Director of Roma Education Fund. Romanian Roma leader who built REF into a major international education organization. Oversaw scholarship programs supporting over 100,000 Roma students across 16 countries. Prior experience with Open Society Foundations in Romania. Connected to Roma Foundations for Europe board. Key figure in Roma education policy at EU level. Also involved in REDI entrepreneurship initiative.",
      createdBy: "analyst1", createdAt: "2025-11-22T09:00:00", linkedTo: [27, 45, 26, 25] },
    { id: 52, category: "person", name: "Nadir Redzepi", context: "confirmed", country: "International", tags: ["education", "program-management", "youth"],
      narrative: "Program Director at Roma Education Fund. North Macedonian Roma background. Manages REF country programs in Western Balkans. Expertise in Roma education access and quality improvement. Connected to OSF Roma Initiatives and REDI network. Coordinates with local Roma organizations on scholarship distribution and school desegregation programs.",
      createdBy: "analyst2", createdAt: "2025-11-21T09:00:00", linkedTo: [27, 25, 45] },
    { id: 53, category: "person", name: "Laura Surdu", context: "confirmed", country: "Romania", tags: ["research", "education", "data"],
      narrative: "Research Director formerly at Roma Education Fund. Romanian Roma sociologist specializing in quantitative research on Roma education outcomes. Published key studies on school segregation and educational attainment gaps. Connected to Romani CRISS research programs and Policy Center for Roma and Minorities. Data contributed to EU Roma Strategic Framework indicators.",
      createdBy: "analyst1", createdAt: "2025-11-20T09:00:00", linkedTo: [27, 21, 30] },
    { id: 54, category: "person", name: "Judit Szira", context: "confirmed", country: "Hungary", tags: ["education", "communications", "advocacy"],
      narrative: "Former Communications and External Relations Officer at Roma Education Fund. Hungarian Roma professional with experience in educational advocacy and institutional communications. Connected to OSF Roma Initiatives through REF partnership. Active in promoting Roma education success stories in international media.",
      createdBy: "analyst2", createdAt: "2025-11-19T09:00:00", linkedTo: [27, 25, 72] },

    // ── PERSONS: ERIAC ──
    { id: 55, category: "person", name: "Timea Junghaus", context: "confirmed", country: "Hungary", tags: ["culture", "arts", "leadership"],
      narrative: "Executive Director and co-founder of ERIAC (European Roma Institute for Arts and Culture). Hungarian Roma art historian and curator. First Roma curator at Venice Biennale (2007, Hungarian Pavilion). PhD in art history. Pioneered recognition of contemporary Roma art in mainstream European cultural institutions. Connected to Council of Europe cultural programs and Open Society Foundations.",
      createdBy: "analyst1", createdAt: "2025-11-18T09:00:00", linkedTo: [47, 25, 48] },
    { id: 56, category: "person", name: "Anna Mirga-Kruszelnicka", context: "confirmed", country: "International", tags: ["culture", "research", "advocacy"],
      narrative: "Deputy Director of ERIAC. Polish Roma background. Academic researcher and cultural activist. PhD research on Roma cultural production and identity politics. Former fellow at European University Institute, Florence. Connected to Roma Foundations for Europe. Active in debates on Roma cultural autonomy and anti-discrimination through cultural recognition.",
      createdBy: "analyst1", createdAt: "2025-11-17T09:00:00", linkedTo: [47, 26] },
    { id: 57, category: "person", name: "Daniel Baker", context: "confirmed", country: "International", tags: ["arts", "culture", "heritage"],
      narrative: "Romani artist and academic based in UK. Connected to ERIAC as board advisor. PhD from Royal College of Art. Work explores Romani visual culture, flag design, and identity markers. Exhibited internationally including Tate Britain and Venice Biennale. Lecturer in Romani art history. Key voice in contemporary Romani arts movement.",
      createdBy: "analyst2", createdAt: "2025-11-16T09:00:00", linkedTo: [47] },
    { id: 58, category: "person", name: "Ethel Brooks", context: "confirmed", country: "International", tags: ["research", "culture", "women-rights"],
      narrative: "Professor of Women's and Gender Studies and Sociology at Rutgers University. Romani American scholar. Connected to ERIAC advisory network. Research on Roma women's rights, transnational Romani identity, and globalization. Published 'Unraveling the Garment Industry'. Board member of European Roma Rights Centre. Key academic voice on intersectional Roma identity.",
      createdBy: "analyst1", createdAt: "2025-11-15T09:00:00", linkedTo: [47, 28] },

    // ── PERSONS: Council of Europe Roma ──
    { id: 59, category: "person", name: "Jeroen Schokkenbroek", context: "confirmed", country: "International", tags: ["policy", "human-rights", "leadership"],
      narrative: "Special Representative of the Secretary General of the Council of Europe for Roma Issues. Dutch human rights lawyer. Coordinates CoE Roma and Travellers Team. Oversees implementation of Strategic Action Plan for Roma and Traveller Inclusion. Engages with national governments on Roma rights compliance. Connected to Roma Foundations for Europe and ERRC through institutional partnerships.",
      createdBy: "admin", createdAt: "2025-11-14T09:00:00", linkedTo: [48, 26, 28] },
    { id: 60, category: "person", name: "Miranda Vuolasranta", context: "confirmed", country: "International", tags: ["policy", "leadership", "advocacy"],
      narrative: "President of the European Roma and Travellers Forum (ERTF) at the Council of Europe. Finnish Romani background. Pioneering Roma woman leader in Nordic countries. Advocates for Roma inclusion in EU and CoE policy frameworks. Connected to Roma Foundations for Europe board. Coordinates ERTF advocacy with national Roma platforms across 46 CoE member states.",
      createdBy: "admin", createdAt: "2025-11-13T09:00:00", linkedTo: [48, 26] },

    // ── PERSONS: EU Parliament / European Politicians ──
    { id: 61, category: "person", name: "Soraya Post", context: "confirmed", country: "International", tags: ["political-participation", "human-rights", "leadership"],
      narrative: "Former Member of European Parliament (2014-2019), Sweden. Romani and Afro-Swedish heritage. First Roma woman elected to European Parliament from a Nordic country. Served on Civil Liberties (LIBE) committee. Championed Roma rights, anti-discrimination legislation, and refugee rights. Connected to ERIAC founding. Post-parliamentary work in Roma advocacy and anti-racism.",
      createdBy: "analyst1", createdAt: "2025-11-12T09:00:00", linkedTo: [47, 48] },
    { id: 62, category: "person", name: "Romeo Franz", context: "confirmed", country: "International", tags: ["political-participation", "culture", "leadership"],
      narrative: "Member of European Parliament (Greens/EFA, Germany). German Sinto musician and politician. First Sinto MEP. Professional jazz musician. Serves on Culture and Education (CULT) committee. Advocates for Roma and Sinti cultural recognition and anti-discrimination. Connected to ERIAC cultural programs. Campaigns for recognition of Sinti and Roma persecution history.",
      createdBy: "analyst1", createdAt: "2025-11-11T09:00:00", linkedTo: [47, 48, 64] },
    { id: 63, category: "person", name: "Lívia Járóka", context: "confirmed", country: "Hungary", tags: ["political-participation", "policy", "leadership"],
      narrative: "Vice-President of the European Parliament. Hungarian Roma. First Romani woman to serve as EP Vice-President. Former EU Roma coordinator. Social anthropologist by training. Served multiple terms as MEP (EPP group). Key contact between European institutions and Roma civil society. Connected to DG Justice Roma policy processes and Roma Education Fund.",
      createdBy: "analyst1", createdAt: "2025-11-10T09:00:00", linkedTo: [49, 27] },

    // ── PERSONS: Other Key Figures ──
    { id: 64, category: "person", name: "Romani Rose", context: "confirmed", country: "International", tags: ["civil-rights", "holocaust", "leadership"],
      narrative: "Chairman of the Central Council of German Sinti and Roma. Leading Sinti civil rights figure since 1980s. Instrumental in achieving official German recognition of the Sinti and Roma genocide. Established Documentation and Cultural Centre of German Sinti and Roma in Heidelberg. Connected to Council of Europe Roma work and ERIAC. Key figure in Holocaust remembrance for Roma and Sinti.",
      createdBy: "admin", createdAt: "2025-11-09T09:00:00", linkedTo: [48, 47, 62] },
    { id: 65, category: "person", name: "Ian Hancock", context: "confirmed", country: "International", tags: ["research", "linguistics", "advocacy"],
      narrative: "Professor Emeritus at University of Texas at Austin. British-born Romani scholar. Pioneer of Romani studies as academic discipline. Author of 'We are the Romani People' and 'The Pariah Syndrome'. Former representative to the United Nations for the International Romani Union. Expert on Romani language and history. Connected to European Roma Rights Centre research programs.",
      createdBy: "analyst2", createdAt: "2025-11-08T09:00:00", linkedTo: [28] },
    { id: 66, category: "person", name: "Andrey Ivanov", context: "confirmed", country: "International", tags: ["policy", "research", "development"],
      narrative: "Senior Roma inclusion advisor, formerly with UNDP Regional Bureau for Europe and CIS. Key author of UNDP Roma human development reports. Expert on Roma socioeconomic data and indicators. Currently advises European Commission DG Justice on Roma Strategic Framework implementation. Connected to World Bank Roma programs and OSF Roma Initiatives.",
      createdBy: "admin", createdAt: "2025-11-07T09:00:00", linkedTo: [49, 50, 25] },
    { id: 67, category: "person", name: "Hristo Kyuchukov", context: "confirmed", country: "Bulgaria", tags: ["research", "linguistics", "education"],
      narrative: "Bulgarian Roma academic and psycholinguist. Professor at University of Silesia, Poland. Expert on Romani language acquisition and bilingual education. Author of over 200 publications on Roma education and language. Connected to Center Amalipe and ERIAC cultural programs. Advocate for Romani language preservation and standardization.",
      createdBy: "analyst2", createdAt: "2025-11-06T09:00:00", linkedTo: [22, 47] },
    { id: 68, category: "person", name: "Thomas Acton", context: "confirmed", country: "International", tags: ["research", "policy", "advocacy"],
      narrative: "Professor Emeritus of Romani Studies at University of Greenwich, UK. Leading Romani studies scholar. Extensive publication record on Roma history, politics, and identity. Connected to Council of Europe Roma research programs and European Roma Rights Centre. Advisor to multiple Roma organizations on academic research and policy development.",
      createdBy: "analyst2", createdAt: "2025-11-05T09:00:00", linkedTo: [28, 48] },
    { id: 69, category: "person", name: "Juan de Dios Ramírez-Heredia", context: "confirmed", country: "International", tags: ["political-participation", "legal", "leadership"],
      narrative: "Spanish Roma politician and lawyer. First Roma member of Spanish Parliament (1977) and first Roma MEP (1994). Founded Unión Romaní in Spain. Pioneering figure in Roma political representation. Legal advocate for Roma rights in Spain and at European level. Connected to Roma Foundations for Europe through international Roma policy network.",
      createdBy: "analyst1", createdAt: "2025-11-04T09:00:00", linkedTo: [26] },

    // ── NEW ADDRESSES ──
    { id: 70, category: "address", name: "ERIAC, Reinhardtstraße 7, 10117 Berlin, Germany", context: "confirmed", country: "International", tags: ["office", "headquarters"],
      narrative: "Headquarters of the European Roma Institute for Arts and Culture in central Berlin. Houses exhibition space, office facilities, and cultural event venue. Located near Friedrichstraße, accessible for international visitors and EU institutional contacts.",
      createdBy: "admin", createdAt: "2025-11-03T09:00:00", linkedTo: [47, 55] },
    { id: 71, category: "address", name: "Council of Europe, Avenue de l'Europe, 67075 Strasbourg, France", context: "confirmed", country: "International", tags: ["institutional", "headquarters"],
      narrative: "Headquarters of the Council of Europe. Houses the Roma and Travellers Team within the Secretariat. Location of ERTF meetings and Roma policy coordination. Key institutional address for European Roma rights monitoring and policy development.",
      createdBy: "admin", createdAt: "2025-11-02T09:00:00", linkedTo: [48, 59] },
    { id: 72, category: "address", name: "Roma Education Fund, Teréz körút 46, 1066 Budapest, Hungary", context: "confirmed", country: "International", tags: ["office", "headquarters"],
      narrative: "Budapest headquarters of Roma Education Fund. Central office for managing scholarship programs across 16 countries. Houses program management, grants administration, and research teams. Key location for Roma education policy coordination in Central Europe.",
      createdBy: "analyst1", createdAt: "2025-11-01T09:00:00", linkedTo: [27, 51, 54] },
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
  nextId: 73,
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
