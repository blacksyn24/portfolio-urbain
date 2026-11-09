// Contenu du portfolio, tiré du CV (novembre 2026).
// Phase 2 : ces données seront déplacées dans Supabase et modifiables depuis le dashboard.

export type Status = "obtenue" | "en-cours" | "planifiee";

export const profile = {
  firstName: "Urbain Sedami",
  lastName: "LANDJIDE",
  handle: "echo_404",
  title: "Étudiant en Réseaux & Cybersécurité",
  subtitle: "Licence RMS · Pigier Bénin × Cisco Networking Academy",
  tagline:
    "Je construis et sécurise des infrastructures réseau en laboratoire : multi-VLAN, EtherChannel, HSRP, SSH/AAA, et des topologies multi-constructeurs Cisco, Fortinet et MikroTik.",
  location: "Abomey-Calavi, Bénin",
  email: "landjide1@gmail.com",
  availability: "Ouvert aux stages en administration réseau",
  photo: "/images/urbain.jpg",
  cvUrl: "/cv-urbain-landjide.pdf",
  about: [
    "Étudiant en 2ᵉ année de Licence Professionnelle Réseaux Informatiques, Mobilité et Sécurité (RMS) à Pigier Bénin, en partenariat avec la Cisco Networking Academy.",
    "Je conçois et documente des labs GNS3 complets qui reproduisent des réseaux d'entreprise réels : banque, e-commerce, éducation, santé. Mon objectif : devenir ingénieur réseau & sécurité en maîtrisant la théorie CCNA comme la pratique en laboratoire.",
    "Déterminé et sérieux, je publie mes labs et ma documentation technique pour apprendre en public.",
  ],
  languages: [
    { name: "Français", level: "Écrit et parlé" },
    { name: "Fon-gbé", level: "Parlé" },
  ],
  interests: ["Basketball", "Théâtre & humour", "Musique"],
  highlights: [
    { value: "2ᵉ", label: "équipe béninoise · primeCTF Africa 2026" },
    { value: "CCNA 1", label: "badge Cisco vérifié" },
    { value: "3", label: "constructeurs : Cisco, Fortinet, MikroTik" },
  ],
  socials: [] as { label: string; url: string }[],
};

export const skillGroups = [
  {
    name: "Routage & commutation",
    icon: "route",
    items: ["VLAN", "Router-on-a-Stick", "SVI", "STP", "EtherChannel / LACP", "HSRP", "Routage statique", "Cisco IOS CLI"],
  },
  {
    name: "Adressage & services",
    icon: "network",
    items: ["IPv4 / IPv6", "Subnetting", "VLSM", "SLAAC", "DHCPv4", "DNS", "TCP/IP"],
  },
  {
    name: "Sécurité",
    icon: "shield",
    items: ["SSH", "AAA", "ACL", "FortiGate", "Durcissement des équipements"],
  },
  {
    name: "Simulation & labs",
    icon: "flask",
    items: ["GNS3", "Cisco Packet Tracer", "PNETLab", "MikroTik RouterOS"],
  },
  {
    name: "Systèmes & outils",
    icon: "terminal",
    items: ["Windows", "Linux", "Git / GitHub", "Documentation technique", "Maintenance matérielle"],
  },
  {
    name: "Développement",
    icon: "code",
    items: ["HTML / CSS", "PHP", "MySQL", "Langage C", "Algorithmique"],
  },
];

export type Project = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  category: "Lab" | "Projet";
  year: string;
  topology: "core" | "vlan" | "multi" | "web";
};

export const projects: Project[] = [
  {
    slug: "labs-gns3-ccna",
    title: "Série de labs GNS3 — CCNA 1 & 2",
    summary:
      "Labs complets et documentés : sécurisation des équipements (SSH, AAA), adressage VLSM et routage statique, IPv6 avec SLAAC.",
    tags: ["GNS3", "SSH", "AAA", "VLSM", "IPv6"],
    category: "Lab",
    year: "2025–2026",
    topology: "core",
  },
  {
    slug: "reseau-entreprise-multi-vlan",
    title: "Réseau d'entreprise multi-VLAN pour PME",
    summary:
      "Simulations de réseaux de banque, d'e-commerce, d'école et de clinique : Router-on-a-Stick, SVI, STP, EtherChannel et DHCPv4.",
    tags: ["VLAN", "STP", "EtherChannel", "DHCPv4"],
    category: "Lab",
    year: "2025–2026",
    topology: "vlan",
  },
  {
    slug: "lab-multi-constructeur",
    title: "Lab multi-constructeur",
    summary:
      "Intégration d'un pare-feu FortiGate, d'un routeur MikroTik (RouterOS) et de commutateurs Cisco IOSvL2 dans une même topologie GNS3.",
    tags: ["FortiGate", "MikroTik", "Cisco IOSvL2", "GNS3"],
    category: "Lab",
    year: "2026",
    topology: "multi",
  },
  {
    slug: "app-services-digitaux",
    title: "Application web de services digitaux",
    summary:
      "Conception et développement d'une application web de services réalisée pendant mon stage chez CITECH Sarl.",
    tags: ["HTML", "CSS", "PHP", "MySQL"],
    category: "Projet",
    year: "2024",
    topology: "web",
  },
];

export const timeline = [
  {
    period: "2025 — 2028",
    title: "Licence Pro Réseaux Informatiques, Mobilité et Sécurité",
    place: "Pigier Bénin × Cisco Networking Academy",
    detail: "Actuellement en 2ᵉ année.",
    kind: "formation",
    current: true,
  },
  {
    period: "2026",
    title: "picoCTF / primeCTF Africa 2026",
    place: "Compétition de cybersécurité",
    detail: "2ᵉ équipe béninoise classée.",
    kind: "competition",
    current: false,
  },
  {
    period: "2025 — 2026",
    title: "Projets réseaux personnels",
    place: "GNS3 · Packet Tracer · PNETLab",
    detail: "Labs CCNA documentés, réseaux PME multi-VLAN, lab multi-constructeur.",
    kind: "projet",
    current: false,
  },
  {
    period: "2024 — 2025",
    title: "Diplôme de Technicien en Installation et Maintenance Informatique",
    place: "DT-IMI",
    detail: "",
    kind: "formation",
    current: false,
  },
  {
    period: "2024",
    title: "Stage en maintenance informatique",
    place: "CITECH Sarl",
    detail: "Dépannage matériel, algorithmique et C, bases de données, application web PHP/MySQL.",
    kind: "experience",
    current: false,
  },
] as const;

export const certifications: {
  name: string;
  issuer: string;
  year: string;
  status: Status;
}[] = [
  { name: "CCNA 1 — Introduction to Networks", issuer: "Cisco Networking Academy", year: "2025", status: "obtenue" },
  {
    name: "CCNA 2 — Switching, Routing & Wireless Essentials",
    issuer: "Cisco Networking Academy",
    year: "2026",
    status: "en-cours",
  },
];

export const navItems = [
  { href: "/", label: "Accueil", icon: "home" },
  { href: "/a-propos", label: "À propos", icon: "user" },
  { href: "/projets", label: "Projets", icon: "folder" },
  { href: "/parcours", label: "Parcours", icon: "clock" },
  { href: "/certifications", label: "Certifications", icon: "award" },
  { href: "/blog", label: "Blog", icon: "pen" },
  { href: "/ressources", label: "Ressources", icon: "download" },
  { href: "/contact", label: "Contact", icon: "mail" },
] as const;

export function navLabel(pathname: string) {
  const item = [...navItems].sort((a, b) => b.href.length - a.href.length).find((n) => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)));
  return item?.label ?? "Accueil";
}
