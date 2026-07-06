// Раздел «ИИ-консультант»: системный промт, контекст и тест-чат.

import Topbar from "@/components/admin/Topbar";
import AIConfigEditor from "@/components/admin/AIConfigEditor";
import { getAiConfig } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAIPage() {
  const ai = await getAiConfig();
  const tourCount = await prisma.tour.count({ where: { isActive: true } });

  // Ключ задан либо в админке (БД), либо в .env.
  const hasKey = Boolean(ai.apiKey || process.env.DEEPSEEK_API_KEY);
  const keySource = ai.apiKey ? "admin" : process.env.DEEPSEEK_API_KEY ? "env" : "none";
  const envModel = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  return (
    <>
      <Topbar title="ИИ-консультант" />
      <div className="admin-body">
        <AIConfigEditor
          initial={{
            systemPrompt: ai.systemPrompt,
            toursContext: ai.toursContext,
            enabled: ai.enabled,
            model: ai.model,
          }}
          tourCount={tourCount}
          hasKey={hasKey}
          keySource={keySource}
          envModel={envModel}
        />
      </div>
    </>
  );
}
