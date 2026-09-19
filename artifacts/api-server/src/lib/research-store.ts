import { randomUUID } from "node:crypto";
import { and, count, desc, eq, sql } from "drizzle-orm";
import {
  db,
  researchHistory,
  researchMemories,
  researchProjects,
  researchSessions,
  researchUsers,
} from "@workspace/db";

export type ResearchSource = Record<string, string>;

export async function getOrCreateResearchUser(clientId: string) {
  const existing = await db
    .select()
    .from(researchUsers)
    .where(eq(researchUsers.clientId, clientId))
    .limit(1);

  if (existing[0]) return existing[0];

  const created = await db
    .insert(researchUsers)
    .values({ id: randomUUID(), clientId })
    .returning();

  return created[0];
}

export async function createResearchProject(
  userId: string,
  name: string,
  description: string,
) {
  const created = await db
    .insert(researchProjects)
    .values({
      id: randomUUID(),
      userId,
      name,
      description,
    })
    .returning();

  return created[0];
}

export async function findResearchProject(projectId: string, userId: string) {
  const result = await db
    .select()
    .from(researchProjects)
    .where(
      and(
        eq(researchProjects.id, projectId),
        eq(researchProjects.userId, userId),
      ),
    )
    .limit(1);

  return result[0];
}

export async function getMostRecentProject(userId: string) {
  const result = await db
    .select()
    .from(researchProjects)
    .where(eq(researchProjects.userId, userId))
    .orderBy(desc(researchProjects.updatedAt))
    .limit(1);

  return result[0];
}

async function getProjectSummary(project: typeof researchProjects.$inferSelect) {
  const [analysisCount, sourceCount, recentResearch] = await Promise.all([
    db
      .select({ total: count() })
      .from(researchHistory)
      .where(eq(researchHistory.projectId, project.id)),
    db
      .select({
        total: sql<number>`coalesce(sum(${researchMemories.sourceCount}), 0)`,
      })
      .from(researchMemories)
      .where(eq(researchMemories.projectId, project.id)),
    db
      .select({
        id: researchHistory.id,
        question: researchHistory.question,
        createdAt: researchHistory.createdAt,
      })
      .from(researchHistory)
      .where(eq(researchHistory.projectId, project.id))
      .orderBy(desc(researchHistory.createdAt))
      .limit(3),
  ]);

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    analysisCount: Number(analysisCount[0]?.total ?? 0),
    sourceCount: Number(sourceCount[0]?.total ?? 0),
    lastActivityAt: project.updatedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    recentResearch,
  };
}

export async function listResearchProjects(userId: string) {
  const projects = await db
    .select()
    .from(researchProjects)
    .where(eq(researchProjects.userId, userId))
    .orderBy(desc(researchProjects.updatedAt));

  return Promise.all(projects.map(getProjectSummary));
}

export async function getOrCreateResearchSession(
  projectId: string,
  sessionId?: string,
) {
  if (sessionId) {
    const existing = await db
      .select()
      .from(researchSessions)
      .where(
        and(
          eq(researchSessions.id, sessionId),
          eq(researchSessions.projectId, projectId),
        ),
      )
      .limit(1);

    if (existing[0]) return existing[0];
  }

  const created = await db
    .insert(researchSessions)
    .values({ id: randomUUID(), projectId })
    .returning();

  return created[0];
}

export async function getResearchContext(projectId: string) {
  const [memories, history] = await Promise.all([
    db
      .select()
      .from(researchMemories)
      .where(eq(researchMemories.projectId, projectId))
      .orderBy(desc(researchMemories.updatedAt))
      .limit(8),
    db
      .select({
        question: researchHistory.question,
        answer: researchHistory.answer,
      })
      .from(researchHistory)
      .where(eq(researchHistory.projectId, projectId))
      .orderBy(desc(researchHistory.createdAt))
      .limit(6),
  ]);

  return { memories, history };
}

export async function saveResearchHistory(
  projectId: string,
  sessionId: string,
  question: string,
  answer: string,
) {
  const [history] = await db
    .insert(researchHistory)
    .values({
      id: randomUUID(),
      projectId,
      sessionId,
      question,
      answer,
    })
    .returning();

  await Promise.all([
    db
      .update(researchSessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(researchSessions.id, sessionId)),
    db
      .update(researchProjects)
      .set({ updatedAt: new Date() })
      .where(eq(researchProjects.id, projectId)),
  ]);

  return history;
}

export async function saveResearchMemory(
  projectId: string,
  title: string,
  finding: string,
  entities: string[],
  sources: ResearchSource[],
) {
  const now = new Date();
  const [memory] = await db
    .insert(researchMemories)
    .values({
      id: randomUUID(),
      projectId,
      title,
      finding,
      entities,
      sources,
      sourceCount: sources.length,
      updatedAt: now,
    })
    .returning();

  await db
    .update(researchProjects)
    .set({ updatedAt: now })
    .where(eq(researchProjects.id, projectId));

  return memory;
}