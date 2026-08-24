import { agentSkillsIndex } from "@/lib/agent-skills/skill-index";

export async function GET() {
  return Response.json(await agentSkillsIndex());
}
