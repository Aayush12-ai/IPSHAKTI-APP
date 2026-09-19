import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  AppScreen,
  BackHeader,
  LanguagePill,
  PrimaryButton,
  StatusBadge,
  SurfaceCard,
  styles,
} from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';
import {
  getMobileProjectsQueryKey,
  useMobileProjectCreate,
  useMobileProjects,
} from '@workspace/api-client-react';
import {
  getResearchClientId,
  setActiveProjectId,
} from '@/lib/research-client';

function formatActivity(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ResearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    void getResearchClientId().then(setClientId);
  }, []);

  const projectsQuery = useMobileProjects(
    { clientId: clientId ?? '' },
    {
      query: {
        enabled: Boolean(clientId),
        queryKey: getMobileProjectsQueryKey({ clientId: clientId ?? '' }),
      },
    },
  );
  const createProject = useMobileProjectCreate();
  const projects = projectsQuery.data?.projects ?? [];
  const activeProject = projects[0];
  const projectCountLabel = useMemo(
    () => `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`,
    [projects.length],
  );

  const create = async () => {
    const name = projectName.trim();
    if (!clientId || !name || createProject.isPending) return;

    const project = await createProject.mutateAsync({
      data: { clientId, name, description: description.trim() || undefined },
    });
    await setActiveProjectId(project.id);
    setProjectName('');
    setDescription('');
    await projectsQuery.refetch();
  };

  const continueResearch = async (projectId: string) => {
    await setActiveProjectId(projectId);
    router.push({ pathname: '/ask-ai', params: { projectId } });
  };

  return (
    <AppScreen>
      <BackHeader title="My Research" subtitle="Projects, findings, and research history" />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>Research workspace</Text>
          <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
            Keep important context together so follow-up questions stay grounded.
          </Text>
        </View>
        <LanguagePill />
      </View>

      <SurfaceCard style={{ marginTop: 22, backgroundColor: colors.lavenderDeep, borderColor: colors.lavenderDeep }}>
        <Text style={{ color: colors.lavenderBorder, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 }}>ACTIVE WORKSPACE</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginTop: 7 }}>
          {activeProject?.name ?? 'Start your first project'}
        </Text>
        <Text style={{ color: colors.lavenderLight, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
          {activeProject?.description || 'Create a project to keep questions, findings, and sources connected.'}
        </Text>
        {activeProject ? (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <StatusBadge label={`${activeProject.analysisCount} analyses`} tone="success" />
            <StatusBadge label={`${activeProject.sourceCount} sources`} tone="warning" />
          </View>
        ) : null}
      </SurfaceCard>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 27, marginBottom: 12 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Projects</Text>
        <Text style={[styles.sectionAction, { color: colors.lavenderDeep }]}>{projectCountLabel}</Text>
      </View>

      {projectsQuery.isLoading ? (
        <SurfaceCard><Text style={{ color: colors.inkSubtle, fontSize: 13 }}>Loading research projects…</Text></SurfaceCard>
      ) : projects.length === 0 ? (
        <SurfaceCard>
          <Feather name="folder-plus" size={22} color={colors.lavenderDeep} />
          <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '700', marginTop: 11 }}>No research projects yet</Text>
          <Text style={{ color: colors.inkSubtle, fontSize: 12, lineHeight: 18, marginTop: 5 }}>
            Start with a named project so IP-SAKTI can carry context into your next question.
          </Text>
        </SurfaceCard>
      ) : projects.map((project) => (
        <SurfaceCard key={project.id} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 11 }}>
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.lavenderLight, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="briefcase" size={17} color={colors.lavenderDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '700' }}>{project.name}</Text>
              <Text style={{ color: colors.inkSubtle, fontSize: 11, lineHeight: 16, marginTop: 3 }} numberOfLines={2}>
                {project.description || 'No project description yet.'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 14 }}>
            <Text style={{ color: colors.inkSubtle, fontSize: 10 }}>{project.analysisCount} analyses</Text>
            <Text style={{ color: colors.inkSubtle, fontSize: 10 }}>{project.sourceCount} sources</Text>
            <Text style={{ color: colors.inkSubtle, fontSize: 10 }}>Active {formatActivity(project.lastActivityAt)}</Text>
          </View>
          {project.recentResearch.length > 0 ? (
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 10 }}>
              <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 }}>Recent research</Text>
              {project.recentResearch.map((item) => (
                <Text key={item.id} style={{ color: colors.foreground, fontSize: 11, lineHeight: 17, marginTop: 4 }} numberOfLines={1}>
                  {item.question}
                </Text>
              ))}
            </View>
          ) : null}
          <Pressable
            onPress={() => void continueResearch(project.id)}
            style={({ pressed }) => [{ marginTop: 13, borderRadius: 11, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.lavenderLight, opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={{ color: colors.lavenderDeep, fontSize: 11, fontWeight: '700' }}>Continue research</Text>
          </Pressable>
        </SurfaceCard>
      ))}

      <View style={{ marginTop: 17 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>New project</Text>
        <SurfaceCard>
          <TextInput
            value={projectName}
            onChangeText={setProjectName}
            placeholder="Project name"
            placeholderTextColor={colors.inkSubtle}
            style={{ color: colors.foreground, fontSize: 14, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 8 }}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What are you researching? (optional)"
            placeholderTextColor={colors.inkSubtle}
            multiline
            style={{ color: colors.foreground, fontSize: 12, minHeight: 52, paddingVertical: 10, textAlignVertical: 'top' }}
          />
          <PrimaryButton label="Create project" icon="plus" onPress={() => void create()} loading={createProject.isPending} />
        </SurfaceCard>
      </View>
    </AppScreen>
  );
}