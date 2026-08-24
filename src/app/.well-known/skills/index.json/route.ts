import { agentSkillsIndex } from "@/lib/agent-skills/skill-index";

// Legacy path the isitagentready.com scanner also checks, alongside the
// current v0.2.0 path at /.well-known/agent-skills/index.json.
export async function GET() {
  return Response.json(await agentSkillsIndex());
}
