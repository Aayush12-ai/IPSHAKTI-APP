import { Router, type IRouter } from "express";
import {
  MobileMemoryCreateBody,
  MobileMemoryCreateParams,
  MobileMemoryCreateResponse,
  MobileProjectCreateBody,
  MobileProjectCreateResponse,
  MobileProjectsQueryParams,
  MobileProjectsResponse,
} from "@workspace/api-zod";
import {
  createResearchProject,
  findResearchProject,
  getOrCreateResearchUser,
  listResearchProjects,
  saveResearchMemory,
} from "../lib/research-store";

const router: IRouter = Router();

router.get("/mobile/projects", async (req, res) => {
  const parsedQuery = MobileProjectsQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ message: "A valid client identity is required." });
    return;
  }

  try {
    const user = await getOrCreateResearchUser(parsedQuery.data.clientId);
    const projects = await listResearchProjects(user.id);
    res.json(MobileProjectsResponse.parse({ projects }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to list research projects");
    res.status(500).json({ message: "Research projects are unavailable." });
  }
});

router.post("/mobile/projects", async (req, res) => {
  const parsedBody = MobileProjectCreateBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ message: "A project name is required." });
    return;
  }

  try {
    const user = await getOrCreateResearchUser(parsedBody.data.clientId);
    const project = await createResearchProject(
      user.id,
      parsedBody.data.name.trim(),
      parsedBody.data.description?.trim() ?? "",
    );
    res.status(201).json(
      MobileProjectCreateResponse.parse({
        id: project.id,
        name: project.name,
        description: project.description,
        analysisCount: 0,
        sourceCount: 0,
        lastActivityAt: project.updatedAt,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        recentResearch: [],
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Unable to create research project");
    res.status(500).json({ message: "The research project could not be created." });
  }
});

router.post("/mobile/projects/:projectId/memories", async (req, res) => {
  const parsedParams = MobileMemoryCreateParams.safeParse(req.params);
  const parsedBody = MobileMemoryCreateBody.safeParse(req.body);

  if (!parsedParams.success || !parsedBody.success) {
    res.status(400).json({ message: "A valid research finding is required." });
    return;
  }

  try {
    const user = await getOrCreateResearchUser(parsedBody.data.clientId);
    const project = await findResearchProject(parsedParams.data.projectId, user.id);
    if (!project) {
      res.status(404).json({ message: "Research project not found." });
      return;
    }

    const memory = await saveResearchMemory(
      project.id,
      parsedBody.data.title.trim(),
      parsedBody.data.finding.trim(),
      parsedBody.data.entities ?? [],
      (parsedBody.data.sources ?? []).map((source) => ({
        title: source.title,
        reference: source.reference,
        ...(source.url ? { url: source.url } : {}),
      })),
    );

    res.status(201).json(
      MobileMemoryCreateResponse.parse({
        id: memory.id,
        title: memory.title,
        finding: memory.finding,
        savedAt: memory.createdAt,
        sourceCount: memory.sourceCount,
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Unable to save research memory");
    res.status(500).json({ message: "The research finding could not be saved." });
  }
});

export default router;