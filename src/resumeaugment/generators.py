"""Extended Generative AI, HR Tech, and Advanced Augmentation Modules.

Features implemented:
1.1 PromptResumeGenerator (Zero-shot prompt-guided resume creation)
1.2 PersonaRewriter (Tone rewriting: Entry, Tech Lead, Executive, Research)
1.3 ExecutiveSummarizer (AI 3-bullet recruiter executive brief)
2.1 DocumentParser (Real PDF, DOCX, and TXT parsing)
2.2 JDMatcher (Job Description matching, fit score, and skill gaps)
2.3 Anonymizer (Bias-free hiring PII masking)
2.4 LocaleAugmenter (US, EU Europass, and Indian locale variations)
3.1 TwoColumnOCRSimulator (Multi-column OCR bleed and scrambling)
3.2 WordDiff (Word-by-word visual difference highlighter)
"""
from __future__ import annotations

import difflib
import io
import os
import random
import re
from typing import Any, Dict, List, Optional, Tuple

from .schema import Item, Resume, Section, Segment, parse_markup

# =====================================================================
# 1.1 Prompt-to-Resume Generator
# =====================================================================

DOMAIN_BANKS = {
    "software": {
        "names": ["Alex Chen", "Pooja Hegde", "Marcus Vance", "Elena Rostova", "Rohan Mehta"],
        "companies": ["Nexus Software", "Starlight Systems", "Apex Core Tech", "CloudScale Labs"],
        "designations": ["Software Engineer", "Senior Backend Developer", "Full Stack Engineer"],
        "degrees": ["B.Tech in Computer Science", "B.S. Software Engineering"],
        "colleges": ["Metropolitan Tech University", "Summit Institute of Technology"],
        "skills": ["Python", "Golang", "PostgreSQL", "Docker", "Kubernetes", "Redis", "TypeScript", "gRPC"],
        "bullets": [
            "Engineered distributed microservices handling 40,000 requests per second with 99.99% availability.",
            "Architected decoupled message broker pipelines using <SKILL>Kafka</SKILL> and <SKILL>Redis</SKILL>.",
            "Optimized SQL query performance across sharded <SKILL>PostgreSQL</SKILL> database clusters.",
            "Spearheaded automated CI/CD deployment workflows utilizing <SKILL>Docker</SKILL> and <SKILL>Kubernetes</SKILL>."
        ]
    },
    "data_ai": {
        "names": ["Dr. Ananya Sen", "Liam Gallagher", "Kavya Deshmukh", "Hiroshi Tanaka", "Sarah Jenkins"],
        "companies": ["DeepInsight AI", "TensorWave Analytics", "OmniData Research", "Cognitive Horizon"],
        "designations": ["Machine Learning Engineer", "Lead Data Scientist", "AI Research Specialist"],
        "degrees": ["M.Sc. in Data Science", "Ph.D. in Artificial Intelligence", "B.Tech in CS & AI"],
        "colleges": ["National Science Institute", "Bay Area Data Academy"],
        "skills": ["Python", "PyTorch", "spaCy", "Transformers", "SQL", "Scikit-Learn", "FastAPI", "MLflow"],
        "bullets": [
            "Trained and deployed transformer models that raised document extraction accuracy by 22%.",
            "Designed automated feature engineering pipelines utilizing <SKILL>Python</SKILL> and <SKILL>Scikit-Learn</SKILL>.",
            "Constructed real-time inference microservice in <SKILL>FastAPI</SKILL> processing 2M daily inferences.",
            "Benchmarked custom NLP token classification models with <SKILL>spaCy</SKILL> for automated entity extraction."
        ]
    },
    "devops_cloud": {
        "names": ["Vikramaditya Rao", "Chloe Dubois", "Nikhil Joshi", "Jordan Miller", "Zara Qureshi"],
        "companies": ["InfraScale Cloud", "Terraform Dynamics", "SkyOps Global", "Vanguard Infra"],
        "designations": ["Senior Cloud Architect", "DevOps Engineer", "Site Reliability Engineer"],
        "degrees": ["B.E. Computer Engineering", "B.Tech in Information Technology"],
        "colleges": ["Global Institute of Technology", "Apex University of Science"],
        "skills": ["AWS", "Terraform", "Kubernetes", "Linux", "Ansible", "Prometheus", "CI/CD", "Helm"],
        "bullets": [
            "Automated multi-region infrastructure provisioning using declarative <SKILL>Terraform</SKILL> manifests.",
            "Enforced GitOps deployment pipelines across 30 production <SKILL>Kubernetes</SKILL> clusters.",
            "Reduced cloud infrastructure billing overhead by 28% through autoscaling policies.",
            "Built end-to-end monitoring and alerting suites integrating <SKILL>Prometheus</SKILL> and Grafana."
        ]
    },
    "security": {
        "names": ["Tariq Mansoor", "Rachel Adams", "Aditya Vardhan", "Samantha Green"],
        "companies": ["CipherDefense", "Ironclad CyberSec", "Sentinel Threat Labs"],
        "designations": ["Cybersecurity Analyst", "Information Security Architect", "SOC Lead"],
        "degrees": ["B.Tech Cybersecurity", "M.S. Information Assurance"],
        "colleges": ["Vellore Tech Institute", "CyberDefense Academy"],
        "skills": ["Wireshark", "Splunk", "Linux", "SIEM", "Pen Testing", "Python", "Metasploit"],
        "bullets": [
            "Monitored threat intelligence across 6,000 corporate endpoints using <SKILL>Splunk</SKILL>.",
            "Executed bi-annual penetration assessments pinpointing 18 critical internal vulnerabilities.",
            "Automated incident containment playbooks utilizing <SKILL>Python</SKILL> scripting."
        ]
    }
}


class PromptResumeGenerator:
    """Generates complete, syntactically tagged resumes from a high-level role prompt."""

    def __init__(self, rng: Optional[random.Random] = None):
        self.rng = rng or random.Random(42)

    def generate(self, prompt: str, resume_id: str = "gen_001") -> str:
        prompt_lower = prompt.lower()
        if any(w in prompt_lower for w in ["ai", "ml", "machine learning", "data science", "nlp"]):
            bank = DOMAIN_BANKS["data_ai"]
        elif any(w in prompt_lower for w in ["cloud", "devops", "sre", "infra", "kubernetes"]):
            bank = DOMAIN_BANKS["devops_cloud"]
        elif any(w in prompt_lower for w in ["security", "cyber", "soc", "pen"]):
            bank = DOMAIN_BANKS["security"]
        else:
            bank = DOMAIN_BANKS["software"]

        name = self.rng.choice(bank["names"])
        email = f"{name.lower().replace(' ', '.')}@example.com"
        phone = f"+1 (555) {self.rng.randint(100, 999)}-{self.rng.randint(1000, 9999)}"
        company = self.rng.choice(bank["companies"])
        designation = self.rng.choice(bank["designations"])
        degree = self.rng.choice(bank["degrees"])
        college = self.rng.choice(bank["colleges"])

        selected_skills = self.rng.sample(bank["skills"], k=min(5, len(bank["skills"])))
        bullets = self.rng.sample(bank["bullets"], k=min(3, len(bank["bullets"])))

        markup = f"""=== {resume_id} ===
## [contact] Contact Information
<NAME>{name}</NAME>
<EMAIL>{email}</EMAIL>
<PHONE>{phone}</PHONE>
<LOCATION>San Francisco, CA</LOCATION>

## [summary] Professional Summary
High-performing professional with demonstrated experience driving strategic impact in {prompt.strip()}.

## [experience] Experience
- <DESIGNATION>{designation}</DESIGNATION> at <COMPANY>{company}</COMPANY>, <DATE>2022 - Present</DATE>
"""
        for b in bullets:
            markup += f"- {b}\n"

        markup += f"""## [education] Education
<DEGREE>{degree}</DEGREE> from <COLLEGE>{college}</COLLEGE>, <DATE>2018 - 2022</DATE>

## [skills] Technical Skills
"""
        for s in selected_skills:
            markup += f"<SKILL>{s}</SKILL>\n"

        return markup


# =====================================================================
# 1.2 Persona & Tone Rewriter
# =====================================================================

PERSONA_PATTERNS = {
    "entry": [
        "Assisted team with foundational development of {rest}.",
        "Collaborated closely with mentors to construct {rest}.",
        "Gained hands-on experience actively contributing to {rest}.",
        "Supported engineering sprint cycles executing {rest}."
    ],
    "tech_lead": [
        "Architected enterprise-grade solution delivering {rest}, reducing p99 latency by 35%.",
        "Spearheaded technical vision and execution for {rest}, lifting throughput by 40%.",
        "Engineered scalable, fault-tolerant infrastructure component for {rest}.",
        "Mentored team of 6 engineers while orchestrating {rest}."
    ],
    "executive": [
        "Championed multi-million dollar technology roadmap delivering {rest}.",
        "Steered operational governance and executive alignment across {rest}.",
        "Directed strategic modernization initiatives overseeing {rest}.",
        "Secured board approval and orchestrated cross-functional rollout of {rest}."
    ],
    "research": [
        "Conducted rigorous empirical benchmarking and validation for {rest}.",
        "Formulated novel algorithmic methodology to optimize {rest}.",
        "Authored experimental comparative evaluations analyzing {rest}.",
        "Applied statistical modeling and peer-reviewed protocols to {rest}."
    ]
}


def rewrite_persona(bullet: str, persona: str, rng: Optional[random.Random] = None) -> str:
    r = rng or random.Random(0)
    words = bullet.strip().split()
    if len(words) < 3:
        return bullet
    clean_words = words[1:] if words[0].lower() in ["built", "developed", "led", "engineered", "improved"] else words
    rest = " ".join(clean_words)
    templates = PERSONA_PATTERNS.get(persona, PERSONA_PATTERNS["tech_lead"])
    return r.choice(templates).format(rest=rest)


# =====================================================================
# 1.3 AI Resume Summarizer & Recruiter Executive Brief
# =====================================================================

def generate_executive_brief(profile: Dict[str, Any], text: str) -> Dict[str, Any]:
    """Generates an instant 3-bullet recruiter executive brief."""
    name = profile.get("candidate", {}).get("name") or "The candidate"
    skills = profile.get("skills", [])
    exp = profile.get("experience", [])
    edu = profile.get("education", [])

    # Top skills
    top_skills = ", ".join(skills[:5]) if skills else "General technical skills"

    # Recent title & company
    latest_role = exp[0].get("designation") if exp else "Professional"
    latest_company = exp[0].get("company") if exp else None

    # Education
    highest_degree = edu[0].get("degree") if edu else "Relevant degree"

    bullets = [
        f"**Profile Overview:** {name} is a **{latest_role}**{f' at {latest_company}' if latest_company else ''} with a background in {highest_degree}.",
        f"**Core Tech Stack:** Key technical proficiencies include **{top_skills}** with hands-on production experience.",
        f"**Candidate Evaluation:** Demonstrated track record delivering scalable system components with verifiable impact across past roles."
    ]

    return {
        "headline": f"{latest_role} | {top_skills}",
        "executive_summary_bullets": bullets,
        "total_skills_count": len(skills),
        "total_roles_count": len(exp),
    }


# =====================================================================
# 2.1 Real Document Parser (PDF, DOCX, TXT)
# =====================================================================

def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    """Extracts raw plain text cleanly from PDF, DOCX, or TXT."""
    ext = filename.lower().split(".")[-1]
    if ext == "txt":
        return file_bytes.decode("utf-8", errors="replace")
    elif ext == "pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            text_pages = [p.extract_text() or "" for p in reader.pages]
            return "\n\n".join(text_pages).strip()
        except Exception as e:
            return f"[Error extracting PDF: {str(e)}]"
    elif ext in ["docx", "doc"]:
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            return "\n".join([p.text for p in doc.paragraphs if p.text.strip()]).strip()
        except Exception as e:
            return f"[Error extracting DOCX: {str(e)}]"
    return file_bytes.decode("utf-8", errors="replace")


# =====================================================================
# 2.2 Job Description (JD) Skill Matcher & Fit Score
# =====================================================================

def match_job_description(jd_text: str, candidate_skills: List[str]) -> Dict[str, Any]:
    """Calculates semantic match score and missing skills against a Job Description."""
    # Common tech skills dictionary for extraction from JD
    ALL_KNOWN_SKILLS = [
        "python", "spacy", "pytorch", "tensorflow", "fastapi", "flask", "docker", "kubernetes",
        "aws", "gcp", "azure", "terraform", "sql", "postgresql", "mongodb", "redis", "kafka",
        "react", "typescript", "javascript", "node.js", "html", "css", "tailwind", "git",
        "linux", "ci/cd", "rest api", "graphql", "agile", "jira", "tableau", "powerbi",
        "pandas", "numpy", "scikit-learn", "nlp", "llm", "langchain", "prompt engineering",
        "splunk", "wireshark", "golang", "java", "c++", "microservices"
    ]

    jd_lower = jd_text.lower()
    candidate_skills_lower = {s.lower().strip() for s in candidate_skills}

    # Extract required skills from JD
    required_skills = []
    for s in ALL_KNOWN_SKILLS:
        # Check boundary match
        pattern = rf"\b{re.escape(s)}\b"
        if re.search(pattern, jd_lower):
            required_skills.append(s.title())

    if not required_skills:
        # Fallback to general words
        required_skills = ["Python", "Problem Solving", "System Design", "Communication"]

    matched = []
    missing = []

    for req in required_skills:
        req_clean = req.lower()
        if any(req_clean in cand or cand in req_clean for cand in candidate_skills_lower):
            matched.append(req)
        else:
            missing.append(req)

    total_req = len(required_skills)
    fit_score = int(round((len(matched) / total_req * 100))) if total_req > 0 else 75

    if fit_score >= 75:
        recommendation = "Strong Candidate Match — Recommend for Immediate Recruiter Screen"
        badge_color = "emerald"
    elif fit_score >= 50:
        recommendation = "Moderate Candidate Match — Meets Core Requirements; Secondary Review Advised"
        badge_color = "amber"
    else:
        recommendation = "Low Candidate Match — Significant Technical Gaps Identified"
        badge_color = "rose"

    return {
        "fit_score": fit_score,
        "recommendation": recommendation,
        "badge_color": badge_color,
        "required_skills": required_skills,
        "matched_skills": matched,
        "missing_skills": missing,
        "total_matched": len(matched),
        "total_required": len(required_skills),
    }


# =====================================================================
# 2.3 Fair Hiring & Bias Mitigation (PII Anonymization)
# =====================================================================

def anonymize_resume_text(text: str, entities: Dict[str, List[str]]) -> str:
    """Masks Personally Identifiable Information (PII) for blind screening."""
    clean = text
    # Mask Names
    for name in entities.get("NAME", []):
        clean = re.sub(re.escape(name), "[CANDIDATE_ANONYMOUS]", clean, flags=re.IGNORECASE)

    # Mask Emails
    clean = re.sub(r"[\w\.-]+@[\w\.-]+\.\w+", "[EMAIL_REDACTED]", clean)

    # Mask Phones
    clean = re.sub(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}", "[PHONE_REDACTED]", clean)

    # Mask Colleges
    for col in entities.get("COLLEGE", []):
        clean = re.sub(re.escape(col), "[ACCREDITED_UNIVERSITY]", clean, flags=re.IGNORECASE)

    # Mask Locations
    for loc in entities.get("LOCATION", []):
        clean = re.sub(re.escape(loc), "[CONFIDENTIAL_LOCATION]", clean, flags=re.IGNORECASE)

    return clean


# =====================================================================
# 2.4 Cross-Locale Regional Augmentation
# =====================================================================

def apply_locale_formatting(text: str, locale: str, rng: Optional[random.Random] = None) -> str:
    """Transforms resume formatting according to regional recruitment norms."""
    r = rng or random.Random(42)
    out = text

    if locale.upper() == "US":
        # Add GPA and US date convention
        if "Education" in out or "EDUCATION" in out:
            out = re.sub(r"(Education|EDUCATION)", r"\1\nGPA: 3.85 / 4.0", out, count=1)
        # Ensure US phone
        out = re.sub(r"\+91[- ]?\d+", "+1 (555) 234-5678", out)

    elif locale.upper() == "EU":
        # Add Europass style indicators
        footer = "\n\nLANGUAGES\n• English (C2 - Proficient)\n• French (B2 - Independent)\n\nDRIVING LICENSE\n• Category B (Clean)"
        out += footer

    elif locale.upper() == "IN":
        # Add Indian recruitment norms: Notice Period, CTC, Permanent Location
        notice = r.choice(["Immediate Joiner", "15 Days Notice", "30 Days Notice"])
        header_extra = f"\nNotice Period: {notice} | Expected CTC: Competitive | PIN: 500081"
        if "Contact" in out:
            out = re.sub(r"(Contact.*)", rf"\1{header_extra}", out, count=1)
        else:
            out = header_extra + "\n" + out

    return out


# =====================================================================
# 3.1 Two-Column OCR Glitch Simulation
# =====================================================================

def simulate_twocolumn_ocr_bleed(lines: List[str], rng: Optional[random.Random] = None) -> List[str]:
    """Simulates multi-column PDF text bleed (interleaved lines)."""
    r = rng or random.Random(12)
    if len(lines) < 6:
        return lines

    scrambled = list(lines)
    # Pick a random 4-line block and interleave
    idx = r.randint(1, len(lines) - 4)
    # Swap consecutive lines to simulate side-by-side reading order failure
    scrambled[idx], scrambled[idx + 1] = scrambled[idx + 1], scrambled[idx]
    return scrambled


# =====================================================================
# 3.2 Word-by-Word Visual Diff
# =====================================================================

def compute_word_diff(orig_text: str, aug_text: str) -> List[Dict[str, str]]:
    """Generates word-level diff tokens for visual side-by-side inspection."""
    orig_words = orig_text.split()
    aug_words = aug_text.split()

    matcher = difflib.SequenceMatcher(None, orig_words, aug_words)
    diff_tokens = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for w in orig_words[i1:i2]:
                diff_tokens.append({"word": w, "type": "equal"})
        elif tag == "replace":
            for w in orig_words[i1:i2]:
                diff_tokens.append({"word": w, "type": "removed"})
            for w in aug_words[j1:j2]:
                diff_tokens.append({"word": w, "type": "added"})
        elif tag == "delete":
            for w in orig_words[i1:i2]:
                diff_tokens.append({"word": w, "type": "removed"})
        elif tag == "insert":
            for w in aug_words[j1:j2]:
                diff_tokens.append({"word": w, "type": "added"})

    return diff_tokens

