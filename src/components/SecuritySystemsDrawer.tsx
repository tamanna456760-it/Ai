import React, { useState } from 'react';
import {
  Shield,
  Search,
  Code,
  Cloud,
  Key,
  FileText,
  AlertTriangle,
  Lock,
  Layers,
  ChevronRight,
  Terminal,
  Zap,
} from 'lucide-react';

interface SecuritySystemsDrawerProps {
  onInjectPrompt: (promptText: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface SecuritySystem {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  description: string;
  quickPrompts: { label: string; prompt: string }[];
}

export const SECURITY_SYSTEMS: SecuritySystem[] = [
  {
    id: 'owasp',
    name: 'OWASP Top 10 & API Pentest',
    category: 'Vulnerability Assessment',
    icon: Shield,
    description: 'Audit web & API attack vectors: Injection, BOLA/IDOR, SSRF, XSS, and broken access controls.',
    quickPrompts: [
      {
        label: 'Audit Broken Access Control (BOLA/IDOR)',
        prompt: 'System: OWASP Top 10 Audit.\nPlease evaluate this API endpoint or workflow for Broken Object Level Authorization (BOLA/IDOR) and Broken Function Level Authorization:\n\n[PASTE ROUTE / CODE / LOGIC HERE]\n\nProvide root-cause analysis, proof of concept verification methodology, and the exact secure code fix.',
      },
      {
        label: 'Detect & Prevent SSRF (Cloud & Internal)',
        prompt: 'System: Server-Side Request Forgery (SSRF) Defense.\nHow do I audit and defend an application that fetches external URLs against SSRF (including cloud metadata service 169.254.169.254 extraction and internal RFC 1918 network scanning)? Provide both application-level validation and network-level egress filtering.',
      },
      {
        label: 'XSS & DOM Sanitization Review',
        prompt: 'System: Cross-Site Scripting (XSS) Remediation.\nReview this frontend component for Stored, Reflected, or DOM-based XSS vectors. Demonstrate safe encoding, DOMPurify sanitization, and strict Content Security Policy (CSP) integration:\n\n[PASTE CODE HERE]',
      },
    ],
  },
  {
    id: 'sast',
    name: 'Secure Code SAST & Bug Bounty Review',
    category: 'Code Security',
    icon: Code,
    description: 'Line-by-line source code auditing, unsafe deserialization, SQL injection, and memory safety.',
    quickPrompts: [
      {
        label: 'Static Code Security Review (SAST)',
        prompt: 'System: Static Application Security Testing (SAST).\nPlease perform an exhaustive, line-by-line security audit on the following code snippet:\n\n[PASTE SOURCE CODE HERE]\n\nList all vulnerabilities with CWE IDs, CVSS severity estimates, attack scenarios, and provide the fully refactored, hardened code.',
      },
      {
        label: 'SQL / NoSQL Injection Audit',
        prompt: 'System: Injection Vulnerability Audit.\nInspect this database querying code for SQL, Blind SQL, or NoSQL injection vulnerabilities. Show how malicious input breaks query structure and rewrite it using parameterized queries and type-safe schema constraints:\n\n[PASTE DB QUERY CODE HERE]',
      },
      {
        label: 'Safe File Upload Pipeline',
        prompt: 'System: File Upload Hardening.\nProvide a production-grade, secure file upload handler in Node.js/Python that enforces MIME type verification (magic bytes), randomized non-executable storage paths, file size limits, and antivirus/sandboxing hooks.',
      },
    ],
  },
  {
    id: 'crypto',
    name: 'Cryptography & Secrets Defense',
    category: 'Cryptographic Engine',
    icon: Key,
    description: 'Password hashing (Argon2id/bcrypt), JWT security, AES-256-GCM, and secret leakage defense.',
    quickPrompts: [
      {
        label: 'JWT Security & Algorithm Confusion Audit',
        prompt: 'System: JWT Security Analyzer.\nAudit this JWT verification implementation for key vulnerabilities: "none" algorithm attacks, weak HMAC secret brute-forcing, asymmetric/symmetric confusion, missing expiration (exp) checks, and jku/kid header injections:\n\n[PASTE JWT IMPLEMENTATION HERE]',
      },
      {
        label: 'Password Hashing Benchmark (Argon2id vs bcrypt)',
        prompt: 'System: Password Hashing Architecture.\nSpecify the optimal password hashing parameters using Argon2id (memory, time cost, parallelism) versus bcrypt (cost factor). Provide production-ready code with secure salt generation and timing-attack-safe comparison.',
      },
      {
        label: 'Secret Scanning & API Key Hygiene',
        prompt: 'System: Secrets Management & Leaks.\nWhat is the complete remediation playbook if high-privilege cloud or API credentials are inadvertently committed to a public Git repository? Provide immediate revocation, rotation, blast radius containment, and git history scrubbing steps.',
      },
    ],
  },
  {
    id: 'cloud',
    name: 'Cloud, Docker & Kubernetes Hardener',
    category: 'Infrastructure & Containers',
    icon: Cloud,
    description: 'AWS/GCP IAM privilege escalation, IMDSv2, Docker rootless defense, and Kubernetes RBAC.',
    quickPrompts: [
      {
        label: 'Kubernetes Pod Security & RBAC Audit',
        prompt: 'System: Kubernetes Hardening Architecture.\nAudit this Kubernetes manifest or cluster configuration for security weaknesses. Enforce Pod Security Standards (restricted), NetworkPolicies, read-only root filesystems, dropping Linux capabilities, and non-root UID execution:\n\n[PASTE YAML MANIFEST HERE]',
      },
      {
        label: 'AWS IAM Privilege Escalation Check',
        prompt: 'System: Cloud IAM Security.\nAnalyze this IAM policy for permission boundary bypasses and privilege escalation paths (e.g. iam:PassRole with ec2:RunInstances, or iam:CreatePolicyVersion):\n\n[PASTE IAM POLICY JSON HERE]',
      },
      {
        label: 'Hardened Production Dockerfile',
        prompt: 'System: Container Hardening.\nRefactor this Dockerfile into a minimal, rootless, multi-stage production build that strips unnecessary build tooling, drops setuid binaries, and minimizes CVE attack surface:\n\n[PASTE DOCKERFILE HERE]',
      },
    ],
  },
  {
    id: 'recon',
    name: 'Reconnaissance & OSINT Planner',
    category: 'Information Gathering',
    icon: Search,
    description: 'Authorized passive/active reconnaissance, DNS enumeration, Shodan queries, and attack surface mapping.',
    quickPrompts: [
      {
        label: 'Comprehensive Reconnaissance Workflow',
        prompt: 'System: Authorized Reconnaissance & Attack Surface Mapping.\nDraft a structured reconnaissance and asset discovery plan for an authorized scope (domain: [TARGET.COM]). Include passive DNS analysis, Certificate Transparency (crt.sh), subdomain brute-forcing, and ASN boundary identification.',
      },
      {
        label: 'Defensive Shodan & Google Dorking Queries',
        prompt: 'System: Defensive Exposure Audit.\nGenerate a suite of Shodan and Google Dorking search queries to discover inadvertently exposed administrative portals, open database ports, swagger/API specs, and backup files (.git, .env) for our organization.',
      },
    ],
  },
  {
    id: 'network',
    name: 'Network, Port & Firewall Hardener',
    category: 'Perimeter Defense',
    icon: Terminal,
    description: 'Nmap scanning profiles, firewall rules (iptables/nftables), TLS 1.3 hardening, and zero-trust.',
    quickPrompts: [
      {
        label: 'Firewall Ruleset (iptables / UFW)',
        prompt: 'System: Network Defense & Firewall Rules.\nGenerate a hardened, drop-by-default iptables or UFW ruleset for a production Linux server running a web service (ports 80, 443) and SSH on a custom port with rate-limiting against brute force attacks.',
      },
      {
        label: 'Nmap Scanning Methodology (Authorized Labs)',
        prompt: 'System: Network Audit & Port Scanning.\nProvide an authorized network discovery playbook with Nmap commands for host discovery, TCP SYN scanning, service version detection, and vulnerability script (NSE) execution with minimal network disruption.',
      },
    ],
  },
  {
    id: 'headers',
    name: 'Security Headers & CSP Architect',
    category: 'Defensive Enclosure',
    icon: Lock,
    description: 'Strict Content-Security-Policy (CSP), HSTS, CORS policies, and browser defense headers.',
    quickPrompts: [
      {
        label: 'Strict CSP & Modern SPA Headers',
        prompt: 'System: Security Headers Architect.\nDesign a strict Content Security Policy (CSP) with nonce-based script execution, HSTS preload, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy for a modern React/Single Page Application without breaking legitimate analytics or CDN assets.',
      },
      {
        label: 'CORS Misconfiguration Audit',
        prompt: 'System: Cross-Origin Resource Sharing (CORS) Defense.\nReview this CORS configuration for wildcard reflection, null origin trust, and credentials exposure vulnerabilities. Provide the secure, allowlist-driven Express/Node.js implementation:\n\n[PASTE CORS CONFIG HERE]',
      },
    ],
  },
  {
    id: 'dfir',
    name: 'Incident Response & DFIR Playbook',
    category: 'Forensics & Containment',
    icon: AlertTriangle,
    description: 'Live breach triage, IOC extraction, log analysis (SIEM, auth.log, Nginx), and malware eradication.',
    quickPrompts: [
      {
        label: 'Active Breach Containment Playbook',
        prompt: 'System: Digital Forensics & Incident Response (DFIR).\nScenario: We suspect an active compromise on a production server (unusual outbound connections, high CPU, modified system binaries).\nProvide immediate, step-by-step triage actions: preserving volatile RAM evidence, isolating network egress, capturing network connections, and inspecting persistence mechanisms.',
      },
      {
        label: 'Web Server Access Log Forensics',
        prompt: 'System: Log Analysis & Threat Hunting.\nAnalyze these web server access log entries for malicious scanning patterns, SQL injection probes, directory traversal, and webshell activity:\n\n[PASTE LOG ENTRIES HERE]',
      },
    ],
  },
  {
    id: 'reporting',
    name: 'Pentest Reporting & Compliance',
    category: 'Reporting & Standards',
    icon: FileText,
    description: 'Professional pentest report generation, CVSS v3.1/v4.0 scoring, and NIST/PCI-DSS compliance mapping.',
    quickPrompts: [
      {
        label: 'Executive Pentest Report Generator',
        prompt: 'System: Penetration Testing Report Generator.\nGenerate an enterprise-grade Penetration Testing Report following NIST SP 800-115 format for an assessment finding: [DESCRIBE FINDING, e.g. Unauthenticated Remote Code Execution or SQLi]. Include Executive Summary, CVSS v3.1 calculation, Technical Impact, Steps to Reproduce, and Prioritized Remediation Roadmap.',
      },
      {
        label: 'CVSS v3.1 / v4.0 Vulnerability Scoring',
        prompt: 'System: CVSS Vulnerability Calculator.\nHelp me score this vulnerability under CVSS v3.1 metrics: Attack Vector (Network/Adjacent/Local/Physical), Complexity (Low/High), Privileges Required (None/Low/High), User Interaction (None/Required), Scope (Unchanged/Changed), Confidentiality (None/Low/High), Integrity (None/Low/High), Availability (None/Low/High). Provide the exact vector string and calculated Base Score.',
      },
    ],
  },
];

export const SecuritySystemsDrawer: React.FC<SecuritySystemsDrawerProps> = ({
  onInjectPrompt,
  isOpen,
  onToggle,
}) => {
  const [selectedSystemId, setSelectedSystemId] = useState<string>(SECURITY_SYSTEMS[0].id);

  const activeSystem =
    SECURITY_SYSTEMS.find((s) => s.id === selectedSystemId) || SECURITY_SYSTEMS[0];

  return (
    <div className="border-b border-slate-800 bg-slate-900/95 backdrop-blur shrink-0 transition-all">
      {/* Collapsible toggle bar */}
      <div className="px-6 py-2.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight">
            Ethical Hacking Systems Suite
          </span>
          <span className="text-[11px] text-cyan-400 font-mono hidden sm:inline">
            · 9 Core Defensive Modules
          </span>
        </div>

        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded transition-colors cursor-pointer"
        >
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>{isOpen ? 'Hide Systems' : 'Open Systems Suite'}</span>
        </button>
      </div>

      {/* Expanded Systems Explorer */}
      {isOpen && (
        <div className="p-4 sm:p-5 max-w-5xl mx-auto space-y-4">
          {/* System Pills Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {SECURITY_SYSTEMS.map((sys) => {
              const Icon = sys.icon;
              const isSelected = sys.id === selectedSystemId;
              return (
                <button
                  key={sys.id}
                  onClick={() => setSelectedSystemId(sys.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950 border border-slate-800/90 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{sys.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active System Details & Quick Actions */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col md:flex-row gap-5 items-start">
            <div className="space-y-1.5 md:w-1/3">
              <div className="flex items-center gap-2">
                <activeSystem.icon className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white">{activeSystem.name}</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {activeSystem.description}
              </p>
              <div className="text-[10px] text-cyan-400 font-mono pt-1">
                Category: {activeSystem.category}
              </div>
            </div>

            {/* Quick Action Injections */}
            <div className="flex-1 w-full space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Launch System Analysis Workflow
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {activeSystem.quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onInjectPrompt(item.prompt)}
                    className="group p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {item.label}
                      </span>
                      <Zap className="w-3 h-3 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform mt-0.5" />
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-2">
                      {item.prompt.slice(0, 80)}...
                    </span>
                    <div className="flex items-center text-[10px] text-cyan-400 font-medium">
                      <span>Send to Bot</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
