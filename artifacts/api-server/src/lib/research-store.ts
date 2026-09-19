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

// In-memory fallback stores when Postgres DATABASE_URL is not set locally
const memUsers = new Map<string, any>();
const memProjects = new Map<string, any>();
const memSessions = new Map<string, any>();
const memHistory: any[] = [];
const memMemories: any[] = [];

export async function getOrCreateResearchUser(clientId: string) {
  if (db) {
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

  // Memory fallback
  for (const user of memUsers.values()) {
    if (user.clientId === clientId) return user;
  }
  const newUser = { id: randomUUID(), clientId, createdAt: new Date() };
  memUsers.set(newUser.id, newUser);
  return newUser;
}

export async function createResearchProject(
  userId: string,
  name: string,
  description: string,
) {
  const now = new Date();
  if (db) {
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

  const newProject = {
    id: randomUUID(),
    userId,
    name,
    description,
    createdAt: now,
    updatedAt: now,
  };
  memProjects.set(newProject.id, newProject);
  return newProject;
}

export async function findResearchProject(projectId: string, userId: string) {
  if (db) {
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

  const project = memProjects.get(projectId);
  if (project && project.userId === userId) return project;
  return undefined;
}

export async function getMostRecentProject(userId: string) {
  if (db) {
    const result = await db
      .select()
      .from(researchProjects)
      .where(eq(researchProjects.userId, userId))
      .orderBy(desc(researchProjects.updatedAt))
      .limit(1);

    return result[0];
  }

  const userProjects = Array.from(memProjects.values())
    .filter((p) => p.userId === userId)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return userProjects[0];
}

async function getProjectSummary(project: any) {
  if (db) {
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

  const pHistory = memHistory.filter((h) => h.projectId === project.id);
  const pMemories = memMemories.filter((m) => m.projectId === project.id);
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    analysisCount: pHistory.length,
    sourceCount: pMemories.reduce((acc, m) => acc + (m.sourceCount || 0), 0),
    lastActivityAt: project.updatedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    recentResearch: pHistory.slice(0, 3).map((h) => ({
      id: h.id,
      question: h.question,
      createdAt: h.createdAt,
    })),
  };
}

export async function listResearchProjects(userId: string) {
  if (db) {
    const projects = await db
      .select()
      .from(researchProjects)
      .where(eq(researchProjects.userId, userId))
      .orderBy(desc(researchProjects.updatedAt));

    return Promise.all(projects.map(getProjectSummary));
  }

  const projects = Array.from(memProjects.values())
    .filter((p) => p.userId === userId)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return Promise.all(projects.map(getProjectSummary));
}

export async function getOrCreateResearchSession(
  projectId: string,
  sessionId?: string,
) {
  if (db) {
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

  if (sessionId && memSessions.has(sessionId)) {
    return memSessions.get(sessionId);
  }
  const newSession = {
    id: sessionId || randomUUID(),
    projectId,
    createdAt: new Date(),
    lastActivityAt: new Date(),
  };
  memSessions.set(newSession.id, newSession);
  return newSession;
}

export async function getResearchContext(projectId: string) {
  if (db) {
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

  const memories = memMemories
    .filter((m) => m.projectId === projectId)
    .slice(-8);
  const history = memHistory
    .filter((h) => h.projectId === projectId)
    .slice(-6)
    .map((h) => ({ question: h.question, answer: h.answer }));
  return { memories, history };
}

export async function saveResearchHistory(
  projectId: string,
  sessionId: string,
  question: string,
  answer: string,
) {
  const now = new Date();
  if (db) {
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
        .set({ lastActivityAt: now })
        .where(eq(researchSessions.id, sessionId)),
      db
        .update(researchProjects)
        .set({ updatedAt: now })
        .where(eq(researchProjects.id, projectId)),
    ]);

    return history;
  }

  const history = {
    id: randomUUID(),
    projectId,
    sessionId,
    question,
    answer,
    createdAt: now,
  };
  memHistory.unshift(history);
  const project = memProjects.get(projectId);
  if (project) {
    project.updatedAt = now;
  }
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
  if (db) {
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

  const memory = {
    id: randomUUID(),
    projectId,
    title,
    finding,
    entities,
    sources,
    sourceCount: sources.length,
    createdAt: now,
    updatedAt: now,
  };
  memMemories.unshift(memory);
  const project = memProjects.get(projectId);
  if (project) {
    project.updatedAt = now;
  }
  return memory;
}