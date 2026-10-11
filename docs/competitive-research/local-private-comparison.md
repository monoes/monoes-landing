# Hosted AI-worker platforms: deployment and data handling (vendor-stated)

Read date for every source below: 2026-10-08.

Method and caveats:
- Only vendor-owned pages are used as sources. Everything is the vendor's own claim.
- Pages were read through a fetch tool that returns a model-written summary, so quotes are only as exact as that tool's output. Re-check any quote before using it in public copy.
- Evidence tags: **[fetched]** = vendor page fetched directly. **[search excerpt]** = text seen only as a search-result excerpt of a vendor-domain page; the page itself was not fetched or the fetch failed. Treat those as leads that still need a direct read.
- Several vendor pages returned 404 or 403 or had no content (listed under "Could not verify"). Third-party blogs were not used as sources.

## Summary table

| Vendor | 1. Deployment | 2. Data handling | 3. Model choice | 4. Source code | 5. Notable |
|---|---|---|---|---|---|
| Lindy | Not stated (no VPC/on-prem/self-host mentioned) | "Never used to train AI models"; no region stated; Enterprise "residency requirements ... supported" [search excerpt] | "Choose your model for each task" among Anthropic, OpenAI, Gemini; no BYO/local stated | Closed (not stated; no open-source claim) | SOC 2 Type II, HIPAA (BAA on Enterprise), GDPR, PIPEDA |
| Relevance AI | Multi-tenant; single-tenant "currently in the works"; custom VPCs are Relevance's own network isolation, not customer VPC | Region chosen at signup: US, EU (London), AU; not used for training unless partnership | BYO OpenAI/Anthropic API keys; Relevance also "self-hosts models" in AWS/Azure | Closed (not stated) | SOC 2 Type II, GDPR |
| Sintra | Not stated | Processed in US and other countries; AI providers include OpenAI, Google, Anthropic, FAL, Replicate; providers barred from training on data | Tied to vendor's providers; no BYO stated | Closed (not stated) | Privacy policy lists no certifications; a "SOC 2 controls" phrase appears only in marketing excerpts |
| 11x | Hosted on AWS; no other option stated | "All data resides in AWS' high-security facilities"; training: not stated | Not stated | Closed (not stated) | SOC 2 Type II, CASA Tier 3, GDPR, CCPA |
| Artisan | Not stated; trust center: "Major Cloud Provider" | Not stated | Not stated | Closed (not stated) | Trust center says "We are working on our security compliance"; SOC 2 Type II claim seen only in a search excerpt (conflict, see below) |
| Sierra | Not stated (no VPC/on-prem mentioned) | "never used to train models" [search excerpt]; customers "retain control over their data - where it lives" [search excerpt] | Vendor-chosen "constellation of LLMs - frontier, open-weight, and proprietary"; no BYO stated | Closed (not stated) | SOC 2, HIPAA, GDPR, PCI, FedRAMP High, CCPA, CSA STAR, ISO 27001, ISO 42001 |
| Decagon | **Offers** standard SaaS, single-tenant, cloud-prem/VPC, and "on-premises datacenter" (per its own blog) | Regional data residency; "zero-data retention" with AI providers [search excerpt] | OpenAI and Anthropic named; "self-hosted model inference" in air-gapped deployments | Closed (not stated) | SOC 2 Type II, HIPAA options; air-gapped deployment described |
| Beam AI | **Offers** cloud (Azure/AWS), private instance on customer cloud, on-premises, air-gapped | Hosted in the EU (cloud); on-prem "data never leaves the customer's network" | **On-prem: "bring your own models"**; OSS models via APIs | Closed (not stated) | ISO 27001, SOC 2 Type II, GDPR |
| Salesforce Agentforce | Salesforce-hosted; Einstein Trust Layer; no self-host found | Zero data retention with third-party LLMs; not used for training [search excerpt] | Salesforce-managed LLMs, plus customer-model options [search excerpt, unverified] | Closed | Not verified from a fetched primary page |
| Gumloop | Enterprise plan lists "VPC deployment" [fetched]; "deploy Gumloop inside your own AWS, Azure, or Google Cloud" [search excerpt] | "never uses customer data to train AI models" [search excerpt] | Enterprise lists "BYOK" [fetched] | Closed (not stated) | SOC 2 Type II, HIPAA, GDPR-aligned [search excerpt] |
| n8n | Cloud (Starter, Pro) and self-hosted (Docker, etc.); Business and Enterprise self-host | Cloud data "stored within the EU, on servers located in Frankfurt"; self-hosted data stays on your infrastructure | Any model incl. local (Ollama) via the AI Starter Kit [search excerpt] | **Source-available**, Sustainable Use License v1.0 (not OSI open source) | SOC 2 [search excerpt] |
| Zapier | Cloud only; "stores data on Amazon Web Services (AWS) in the United States" | "does not train on workflow data across any plan"; Enterprise opted out by default | Not stated | Closed (not stated) | SOC 2 Type II and SOC 3, GDPR, UK GDPR, CCPA |

## Per-vendor evidence

### Lindy (lindy.ai)
- Security page, https://www.lindy.ai/security [fetched]: "Your data is encrypted in transit and at rest. It's never sold, never shared, never used to train models." Certifications listed: SOC 2 Type II (Johanson Group), HIPAA, GDPR, PIPEDA. Deployment options (VPC, on-prem, self-host): not stated on this page.
- Enterprise page, https://www.lindy.ai/enterprise [fetched]: "models without lock-in" from "Anthropic, OpenAI, Gemini and the top frontier models"; "Never sold, never shared, never used to train AI models."
- Pricing, https://www.lindy.ai/pricing [fetched]: Enterprise adds "HIPAA compliance & signed BAA", SSO, SCIM, audit logs. Team plan has "Model selection for each task".
- Search excerpt of the vendor's docs says "data deletion requests, access rights, and residency requirements are all supported." Not confirmed on a fetched page, and no regions are named.
- Region, BYO/local model, self-host, source code: not stated / could not verify.

### Relevance AI (relevanceai.com)
- https://relevanceai.com/docs/admin/security [fetched]:
  - "a multi-tenanted architecture where customer data is logically separated"; single-tenant "currently in the works".
  - Regions: US (N. Virginia), EU (London), AU (Sydney); the region "cannot be changed after your organization is created."
  - "We do not use your data to train our models or improve our services unless you have a specific partnership agreement with us."
  - "custom VPCs and private subnets" (Relevance's own infrastructure isolation, not a customer-VPC option).
  - BYO: users can supply OpenAI or Anthropic keys; Relevance also self-hosts models "within AWS and Azure environments".
  - SOC 2 Type II, GDPR.
- https://relevanceai.com/data-security-policy [fetched]: no mention of single-tenant, dedicated, VPC or on-prem.
- Source code: not stated / could not verify.

### Sintra (sintra.ai)
- Privacy policy, https://sintra.ai/legal/privacy-policy [fetched]: processes data "in the United States and other countries"; AI providers "OpenAI, Google, Anthropic, FAL, Replicate"; "We do not permit our third-party AI providers to use your personal data to train or improve their own foundational AI models." No certifications mentioned in the policy.
- Terms, https://sintra.ai/legal/terms-and-conditions [fetched]: AI "provided by third-party vendors, including ... OpenAI (ChatGPT), Google (Gemini), Anthropic (Claude)"; data location and self-hosting not stated.
- Marketing excerpts (search results) mention "encrypted Brain AI storage under standard SOC 2 controls" and data in the US or EU [search excerpt]. That is not a stated SOC 2 certification.
- Deployment options, BYO model, source code: not stated / could not verify. Security page URL returned 404.

### 11x (11x.ai)
- https://www.11x.ai/security [fetched]: "All data resides in AWS' high-security facilities"; AES-256 in AWS RDS; SOC 2 Type II; CASA Tier 3; "full alignment with GDPR data retention protocols"; CCPA. A second pass confirmed the page does not state whether data trains models or which model providers are used.
- Deployment alternatives, BYO model, source code: not stated / could not verify. docs.11x.ai intro page has no such statements.

### Artisan (artisan.co)
- Trust center, https://trust.artisan.co/ [fetched]: "We are working on our security compliance. We can provide completed questionnaires upon request." Hosting: "Major Cloud Provider".
- Conflict: search excerpts of artisan.co blog pages claim "SOC 2 Type II" and a "trust center" with pentest and DPA [search excerpt]. These disagree with the trust page we fetched. Do not state Artisan's certification status either way without re-checking.
- security page URL returned 404. Deployment, training, BYO model, source: not stated / could not verify.

### Sierra (sierra.ai)
- https://sierra.ai/product/trust-and-reliability [fetched]: "SOC 2, HIPAA, GDPR, PCI, FedRAMP High, CCPA, CSA STAR, ISO 27001, and ISO 42001"; "a constellation of LLMs - combining frontier, open-weight, and proprietary models"; data "is only used as you instruct, and is never shared with other customers."
- Search excerpt of the same domain: "your data is never used to train models"; customers "retain control over their data - where it lives, how it's used, and when it is deleted" [search excerpt].
- VPC / on-prem / single-tenant / BYO model: not stated / could not verify (no mention found).

### Decagon (decagon.ai)
- Deployment blog, https://decagon.ai/blog/what-an-air-gapped-ai-deployment-actually-requires [fetched]: lists Standard SaaS ("Decagon hosts and manages everything"), single-tenant SaaS, and cloud-prem/VPC ("The customer owns the infrastructure, while Decagon manages the software"). Also: "we also support options such as on-premises datacenter deployments for more specialized requirements", and an air-gapped deployment needing "self-hosted model inference". The fetch summary garbled the single-tenant wording; the search excerpt of the same site describes single-tenant as "a dedicated VPC inside Decagon's cloud" [search excerpt]. Re-read before quoting.
- https://decagon.ai/security [search excerpt]: "regional data residency options"; "zero-data retention with all AI providers like OpenAI and Anthropic, ensuring no conversation data is stored or used for training"; SOC 2 Type II, HIPAA options. The direct fetch of the security page showed the same zero-retention and provider wording and a listing of DPR, CCPA, EU AI Act, HIPAA, SOC 2, ISO, PCI logos.
- Decagon states the majority of customers run on standard SaaS (search excerpt).
- Source code: not stated / could not verify. trust.decagon.ai returned no content.

### Beam AI (beam.ai)
- https://beam.ai/platform [fetched]: "Beam is designed to dovetail with your existing infrastructure, allowing for a customized fit on both cloud services like Azure or AWS or on-premises for those seeking to keep their data closely managed in-house." "Beam is hosted in the EU and is GDPR-compliant. With ISO 27001 and SOC Type II certifications..."
- https://beam.ai/agentic-insights/ai-agent-security-enterprise-checklist [fetched, thin summary]: lists "Flexible Deployment - Support cloud, private instance, and on-premises options". Search excerpts of Beam's pages add: "Private instances on customer cloud infrastructure, deployed via Azure BICEP templates"; "On-premise deployments, including air-gapped options, ensure data never leaves the customer's network"; "For on-premise, bring your own models. Data sent to LLMs is not used for training." [search excerpt]
- Source code: not stated / could not verify. security page returned 404.

### Salesforce Agentforce
- https://www.salesforce.com/agentforce/ [fetched]: product description only; no data or deployment claims.
- Trust Layer details come from search excerpts of salesforce.com and developer.salesforce.com [search excerpt]: "zero data retention policy ... ensures any third-party LLMs used by Salesforce do not retain Customer Data or use it for model training"; LLMs "hosted within the Salesforce trust boundary, such as the Anthropic Claude model"; a custom action can reference a customer-chosen model. The primary help and developer pages returned 403 or no content, so none of this is directly verified.
- On-prem / self-host: not found. Source: closed. Certifications: not verified.

### Gumloop (gumloop.com)
- https://www.gumloop.com/pricing [fetched]: Enterprise plan includes "VPC deployment, BYOK, SSO, data retention."
- https://www.gumloop.com/solutions/security [search excerpt]: SOC 2 Type II, HIPAA with BAAs on eligible plans; "You can deploy Gumloop inside your own AWS, Azure, or Google Cloud environment"; zero-retention agreements with LLM providers; "never uses customer data to train AI models". The direct fetch of that page returned no content.
- Source code: not stated / could not verify.

### n8n
- Hosting docs, https://docs.n8n.io/hosting/ [fetched]: Docker/Compose, many clouds; "Without a license key, n8n runs as the free Community edition. Adding a Business or Enterprise license key enables those editions."
- Pricing, https://n8n.io/pricing/ [fetched]: Starter and Pro are cloud-hosted by n8n; Business and Enterprise support self-hosting; hosted data "is stored within the EU, on servers located in Frankfurt, Germany."
- License, https://github.com/n8n-io/n8n/blob/master/LICENSE.md [fetched]: "Sustainable Use License, Version 1.0"; use for internal business or non-commercial purposes; files containing ".ee." need a separate Enterprise License. This is source-available, not open source.
- Search excerpts of docs.n8n.io [search excerpt]: AI Starter Kit bundles self-hosted n8n with Ollama for local LLMs; AI Workflow Builder data "will not be incorporated, used, or retained to train the models of the AI services"; "SOC2 compliant".

### Zapier
- https://zapier.com/security-compliance [fetched]: "Amazon Web Services (AWS) in the United States"; no training on workflow data on any plan (may learn from workflow structure; Enterprise auto opted out, other plans via form); "SOC 2 (Type II) & SOC 3", GDPR, UK GDPR, CCPA; TLS 1.2+ and AES-256. Self-hosting or private deployment: not mentioned.
- BYO model, source code: not stated / could not verify.

## Could not verify (404, 403 or empty)
lindy.ai region list; sintra.ai/security; artisan.co/security; Sierra deployment and region pages; trust.decagon.ai; Salesforce help.salesforce.com Trust Layer pages; docs.n8n.io/privacy-security; Gumloop security page body; 11x model providers; Zapier BYO-model statement; source-code status for all closed vendors (inferred only from the absence of any open-source claim).

## Claims we can safely make about hosted AI-worker platforms in general
Phrase these as "most" or "typically", and always name the exceptions. Based on the vendors verified above:
1. Most of these platforms are operated by the vendor, with customer data processed in the vendor's cloud (Lindy, Relevance AI, Sintra, 11x, Artisan, Sierra, Zapier by stated pages; Salesforce and Gumloop by default).
2. Their standard offering is multi-tenant SaaS (Relevance AI says so explicitly; Zapier and 11x state AWS hosting).
3. Several of them route your data to third-party model providers such as OpenAI, Anthropic and Google (Sintra, Decagon, Lindy, Zapier-class integrations), under their own "no training" assurances.
4. Many state they do not use customer data to train models (Lindy, Relevance AI, Sintra's providers, Sierra, Decagon, Zapier, Gumloop). This is a vendor promise, not something you can inspect.
5. Region choice, where offered, is limited to a few regions (Relevance AI: US, EU, AU) and is often an Enterprise matter.
6. Closed source is the norm; none of the AI-worker vendors (excluding n8n) state an open-source or source-available license.
7. SOC 2 is common; local or self-hosted operation is not the usual deal.

Exceptions to name (they DO offer private options):
- Decagon: single-tenant, cloud-prem/VPC, on-prem datacenter, air-gapped (per its own blog).
- Beam AI: private instance on customer cloud, on-prem, air-gapped, bring-your-own-models on-prem.
- Gumloop: Enterprise "VPC deployment" and "BYOK".
- Relevance AI: BYO LLM keys; single-tenant "in the works".
- n8n: self-hosted for everyone, any model including local; source-available.
- Salesforce: customer-model options within the Trust Layer (unverified from a primary page).

## Claims we must NOT make
- "Hosted AI-worker platforms run only in the vendor's cloud." False for Decagon, Beam, Gumloop (and n8n if counted).
- "None of them offer on-prem, VPC or air-gapped deployment." False (Decagon, Beam, Gumloop).
- "None let you bring your own model or key." False (Relevance AI BYO keys, Gumloop BYOK, Beam on-prem BYO models, n8n any model).
- "They all send your data to OpenAI/Anthropic/Google." Not true or not verified for every vendor (Beam on-prem BYO models; Decagon air-gapped self-hosted inference; Sierra uses open-weight and proprietary models too).
- "They all train on your data." Every vendor above that addressed it says it does not.
- "Their security claims are false or unverified in general." We only verified what pages say, not whether it is true.
- "All competitors are closed source." n8n is source-available (Sustainable Use License); we did not verify the others beyond the absence of any open-source claim.
- "Competitor X has no SOC 2 / is not certified." Artisan's trust page and its blog excerpts disagree; Sintra's certification status is unclear. Do not assert either.
- "Salesforce Agentforce lacks self-hosting / has no BYO model." Not verified from a primary page.
- Any statement about Lindy, Sierra, Sintra, 11x, Artisan or Zapier having "no VPC/on-prem option" worded as fact. Say "does not advertise" instead; absence from the pages we could read is not proof.
- Describe n8n as "open source" without qualification; say "source-available" or "fair-code".
