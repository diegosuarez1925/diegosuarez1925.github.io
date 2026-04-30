import { createApp, ref, computed, watch } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { GraffitiDecentralized } from "@graffiti-garden/implementation-decentralized";
import {
  GraffitiPlugin,
  useGraffiti,
  useGraffitiSession,
  useGraffitiDiscover,
} from "@graffiti-garden/wrapper-vue";

// ── Channel namespaces ─────────────────────────────────────────────
const DMS_CHANNEL      = "designftw-26-dms";
const STUDY_CHANNEL    = "designftw-26-study";
const PROFILES_CHANNEL = "designftw-26-profiles";

// ── Dummy seed data ────────────────────────────────────────────────
const NOW = Date.now();
const MIN = 60_000;
const HR  = 3_600_000;
const DAY = 86_400_000;

const DUMMY_PROFILES = [
  { actor: "dummy-alex",   displayName: "Alex Chen",       bio: "2nd year MFA. Speculative & critical design." },
  { actor: "dummy-sarah",  displayName: "Sarah Kim",        bio: "Researcher. Accessibility + inclusive design." },
  { actor: "dummy-marcus", displayName: "Marcus Johnson",   bio: "Designer/dev. AI tools & creative agency." },
  { actor: "dummy-jamie",  displayName: "Jamie Park",       bio: "1st year. Participatory co-design." },
  { actor: "dummy-prof",   displayName: "Prof. DesignFTW",  bio: "Teaching design methods and critical theory." },
];

const DUMMY_DMS = [
  {
    url: "dummy-dm-alex", channel: "dummy-ch-alex",
    partnerActor: "dummy-alex", partnerName: "Alex Chen",
    preview: "Right?? I had to reread it three times lol",
    created: NOW - 28 * MIN, isDummy: true,
  },
  {
    url: "dummy-dm-sarah", channel: "dummy-ch-sarah",
    partnerActor: "dummy-sarah", partnerName: "Sarah Kim",
    preview: "2pm in room 204. Bring your process work",
    created: NOW - 2 * HR, isDummy: true,
  },
  {
    url: "dummy-dm-marcus", channel: "dummy-ch-marcus",
    partnerActor: "dummy-marcus", partnerName: "Marcus Johnson",
    preview: "Can you share your notes from yesterday?",
    created: NOW - DAY, isDummy: true,
  },
];

const DUMMY_DM_MESSAGES = {
  "dummy-ch-alex": [
    { url: "d-a-1", isDummy: true, actor: "dummy-alex", senderName: "Alex Chen",     isOwn: false, value: { content: "Hey! Did you finish the ethnography reading for Thursday?",       published: NOW - 55 * MIN } },
    { url: "d-a-2", isDummy: true, actor: null,          senderName: "You",           isOwn: true,  value: { content: "Almost lol, the Geertz sections are so dense",                   published: NOW - 48 * MIN } },
    { url: "d-a-3", isDummy: true, actor: "dummy-alex", senderName: "Alex Chen",     isOwn: false, value: { content: "The cockfight essay took me three reads ngl",                    published: NOW - 44 * MIN } },
    { url: "d-a-4", isDummy: true, actor: null,          senderName: "You",           isOwn: true,  value: { content: "Did Suri confirm the reading response is due Wednesday?",        published: NOW - 32 * MIN } },
    { url: "d-a-5", isDummy: true, actor: "dummy-alex", senderName: "Alex Chen",     isOwn: false, value: { content: "Yeah 11:59pm. I just started 😬",                               published: NOW - 28 * MIN } },
  ],
  "dummy-ch-sarah": [
    { url: "d-s-1", isDummy: true, actor: "dummy-sarah", senderName: "Sarah Kim",     isOwn: false, value: { content: "Are you going to the design crit on Thursday?",                  published: NOW - 3 * HR } },
    { url: "d-s-2", isDummy: true, actor: null,           senderName: "You",           isOwn: true,  value: { content: "Planning to! What time does it start?",                          published: NOW - 2.8 * HR } },
    { url: "d-s-3", isDummy: true, actor: "dummy-sarah", senderName: "Sarah Kim",     isOwn: false, value: { content: "2pm in room 204. Bring your process work",                       published: NOW - 2 * HR } },
    { url: "d-s-4", isDummy: true, actor: null,           senderName: "You",           isOwn: true,  value: { content: "Perfect, see you there!",                                        published: NOW - 1.9 * HR } },
    { url: "d-s-5", isDummy: true, actor: "dummy-sarah", senderName: "Sarah Kim",     isOwn: false, value: { content: "Also — are you joining the accessibility reading group?",        published: NOW - 1.5 * HR } },
  ],
  "dummy-ch-marcus": [
    { url: "d-m-1", isDummy: true, actor: null,           senderName: "You",           isOwn: true,  value: { content: "Hey, do you have the slides from Tuesday's lecture?",            published: NOW - DAY - HR } },
    { url: "d-m-2", isDummy: true, actor: "dummy-marcus", senderName: "Marcus Johnson",isOwn: false, value: { content: "Yes! One sec",                                                   published: NOW - DAY - 55 * MIN } },
    { url: "d-m-3", isDummy: true, actor: "dummy-marcus", senderName: "Marcus Johnson",isOwn: false, value: { content: "Here you go → Lec_05_Methods.pdf",                               published: NOW - DAY - 50 * MIN } },
    { url: "d-m-4", isDummy: true, actor: null,           senderName: "You",           isOwn: true,  value: { content: "You're a lifesaver, thank you",                                  published: NOW - DAY - 45 * MIN } },
    { url: "d-m-5", isDummy: true, actor: "dummy-marcus", senderName: "Marcus Johnson",isOwn: false, value: { content: "Can you share your notes from yesterday's crit?",                published: NOW - DAY } },
  ],
};

const DUMMY_GROUPS = [
  { url: "dummy-grp-1", channel: "dummy-grp-ch-1", title: "HCI Midterm Review",        creatorName: "alex.chen",       published: NOW - HR,       isDummy: true },
  { url: "dummy-grp-2", channel: "dummy-grp-ch-2", title: "Design Sprint #3 Debrief",  creatorName: "sarah.kim",       published: NOW - 3 * HR,   isDummy: true },
  { url: "dummy-grp-3", channel: "dummy-grp-ch-3", title: "Thesis Proposal Workshop",  creatorName: "prof.designftw",  published: NOW - 2 * DAY,  isDummy: true },
];

const DUMMY_GROUP_MESSAGES = {
  "dummy-grp-ch-1": [
    { url: "g1-1", isDummy: true, actor: "dummy-alex",   senderName: "alex.chen",      isOwn: false, value: { content: "Has anyone started the review sheet?",                               published: NOW - 2 * HR } },
    { url: "g1-2", isDummy: true, actor: "dummy-sarah",  senderName: "sarah.kim",      isOwn: false, value: { content: "I made a shared doc! Adding it to the group now",                   published: NOW - 1.8 * HR } },
    { url: "g1-3", isDummy: true, actor: "dummy-marcus", senderName: "m.johnson",      isOwn: false, value: { content: "This chapter on affordances is definitely going to be on the exam", published: NOW - 1.5 * HR } },
    { url: "g1-4", isDummy: true, actor: "dummy-alex",   senderName: "alex.chen",      isOwn: false, value: { content: "Norman's seven stages too — super testable",                        published: NOW - 1.2 * HR } },
    { url: "g1-5", isDummy: true, actor: "dummy-sarah",  senderName: "sarah.kim",      isOwn: false, value: { content: "Should we schedule a proper study session this weekend?",            published: NOW - HR } },
    { url: "g1-6", isDummy: true, actor: "dummy-marcus", senderName: "m.johnson",      isOwn: false, value: { content: "Saturday afternoon works for me",                                   published: NOW - 55 * MIN } },
  ],
  "dummy-grp-ch-2": [
    { url: "g2-1", isDummy: true, actor: "dummy-sarah",  senderName: "sarah.kim",      isOwn: false, value: { content: "That was a tough sprint ngl",                                        published: NOW - 5 * HR } },
    { url: "g2-2", isDummy: true, actor: "dummy-marcus", senderName: "m.johnson",      isOwn: false, value: { content: "I think our prototype came out really well though",                  published: NOW - 4.5 * HR } },
    { url: "g2-3", isDummy: true, actor: "dummy-alex",   senderName: "alex.chen",      isOwn: false, value: { content: "The user feedback session was genuinely so helpful",                 published: NOW - 4 * HR } },
    { url: "g2-4", isDummy: true, actor: "dummy-sarah",  senderName: "sarah.kim",      isOwn: false, value: { content: "Agreed. Way better than peer review alone",                         published: NOW - 3.5 * HR } },
    { url: "g2-5", isDummy: true, actor: "dummy-marcus", senderName: "m.johnson",      isOwn: false, value: { content: "Who's writing the reflection doc?",                                 published: NOW - 3 * HR } },
  ],
  "dummy-grp-ch-3": [
    { url: "g3-1", isDummy: true, actor: "dummy-prof",   senderName: "prof.designftw", isOwn: false, value: { content: "Welcome everyone! Let's start by sharing our research questions",    published: NOW - 3 * DAY } },
    { url: "g3-2", isDummy: true, actor: "dummy-marcus", senderName: "m.johnson",      isOwn: false, value: { content: "Mine is about how AI tools affect creative agency in design",        published: NOW - 3 * DAY + 10 * MIN } },
    { url: "g3-3", isDummy: true, actor: "dummy-jamie",  senderName: "jamie.park",     isOwn: false, value: { content: "I'm exploring participatory methods in community-centered design",   published: NOW - 3 * DAY + 20 * MIN } },
    { url: "g3-4", isDummy: true, actor: "dummy-prof",   senderName: "prof.designftw", isOwn: false, value: { content: "Great threads. Let's dig into research framing next week",           published: NOW - 3 * DAY + 30 * MIN } },
    { url: "g3-5", isDummy: true, actor: "dummy-alex",   senderName: "alex.chen",      isOwn: false, value: { content: "Should we share our literature maps before the session?",            published: NOW - 2 * DAY } },
    { url: "g3-6", isDummy: true, actor: "dummy-prof",   senderName: "prof.designftw", isOwn: false, value: { content: "Yes, please post them to the channel by Tuesday",                   published: NOW - DAY - 6 * HR } },
  ],
};

const SUGGESTED_TOPICS = [
  "Midterm Prep", "Paper Reading", "Design Crit", "Thesis Writing",
  "Portfolio Review", "Research Methods",
];

// ── ChatMessage component ──────────────────────────────────────────
// Renders a single message bubble with sender, timestamp, content,
// and an optional delete button for messages the current user owns.
// Props:   message    – the message object
//          isOwn      – true if the current user sent this message
//          isDeleting – true while the delete request is in flight
// Emits:   delete(message)
const ChatMessage = {
  template: "#chat-message-template",
  props: {
    message:    { type: Object,  required: true },
    isOwn:      { type: Boolean, default: false },
    isDeleting: { type: Boolean, default: false },
  },
  emits: ["delete", "view-profile"],
  setup() {
    function fmt(ts) {
      if (!ts) return "";
      const d = new Date(ts), now = new Date();
      const today = d.toDateString() === now.toDateString();
      const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return today ? time : d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + time;
    }
    return { fmt };
  },
};

// ── Router ─────────────────────────────────────────────────────────
// IMPORTANT: Vue Router requires every non-redirect route to have a
// `component` property — routes without one are silently skipped and
// router.push() never updates the URL.
// Our app renders via v-if in the main template (not via <router-view>),
// so we give each route a tiny NullView that renders nothing.
const NullView = { template: "<span></span>" };

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/",               redirect: "/chats" },
    { path: "/chats",          name: "chats",       component: NullView },
    { path: "/chat/:chatId",   name: "chat",        component: NullView },
    { path: "/study",          name: "study",       component: NullView },
    { path: "/study/:groupId", name: "study-group", component: NullView },
    { path: "/connect",        name: "connect",     component: NullView },
  ],
});

// ── Setup ──────────────────────────────────────────────────────────
function setup() {
  const graffiti = useGraffiti();
  const session  = useGraffitiSession();

  // tab is derived from the current route name.
  // We read router.currentRoute directly (a reactive ref on the router
  // object) — this is more reliable in CDN setups than useRoute().
  const tab = computed(() => {
    const name = router.currentRoute.value.name;
    if (name === "chats" || name === "chat")        return "chats";
    if (name === "study" || name === "study-group") return "study";
    if (name === "connect")                         return "connect";
    return "chats";
  });

  function setTab(t) {
    if (t === "chats")        router.push("/chats");
    else if (t === "study")   router.push("/study");
    else if (t === "connect") router.push("/connect");
  }

  const studySubTab = ref("join");

  // ── Profile modal ──────────────────────────────────────────────
  const viewingProfile = ref(null);

  function openProfile(actor) {
    const profile = allProfiles.value.find(p => p.actor === actor);
    if (profile) {
      viewingProfile.value = {
        actor,
        displayName: profile.value.displayName,
        bio:         profile.value.bio || "",
        isDummy:     profile.isDummy || false,
      };
    } else {
      // Real user not yet loaded from Graffiti — show what we have
      viewingProfile.value = { actor, displayName: actor, bio: "", isDummy: false };
    }
  }

  function closeProfile() {
    viewingProfile.value = null;
  }

  // ── Active chat state ──────────────────────────────────────────
  const activeDMChannel      = ref(null);
  const activeDMPartnerName  = ref(null);
  const activeDMPartnerActor = ref(null);
  const activeDMIsDummy      = ref(false);
  const activeStudyChannel   = ref(null);
  const activeStudyTitle     = ref(null);
  const activeStudyIsDummy   = ref(false);

  const activeChannel = computed(() => {
    if (tab.value === "chats") return activeDMChannel.value;
    if (tab.value === "study") return activeStudyChannel.value;
    return null;
  });

  // ── Graffiti discovers ─────────────────────────────────────────
  const { objects: dmConvObjects } = useGraffitiDiscover(
    [DMS_CHANNEL],
    {
      properties: {
        value: {
          required: ["type", "participants", "channel", "created"],
          properties: {
            type:         { const: "DMConversation" },
            participants: { type: "array", items: { type: "string" } },
            channel:      { type: "string" },
            created:      { type: "number" },
          },
        },
      },
    }
  );

  const { objects: groupObjects } = useGraffitiDiscover(
    [STUDY_CHANNEL],
    {
      properties: {
        value: {
          required: ["type", "channel", "title", "published"],
          properties: {
            type:      { const: "StudyGroup" },
            channel:   { type: "string" },
            title:     { type: "string" },
            published: { type: "number" },
          },
        },
      },
    }
  );

  const { objects: profileObjects } = useGraffitiDiscover(
    [PROFILES_CHANNEL],
    {
      properties: {
        value: {
          required: ["type", "displayName", "published"],
          properties: {
            type:        { const: "Profile" },
            displayName: { type: "string" },
            bio:         { type: "string" },
            published:   { type: "number" },
          },
        },
      },
    }
  );

  const { objects: messageObjects, isFirstPoll: messagesLoading } =
    useGraffitiDiscover(
      () => (activeChannel.value ? [activeChannel.value] : []),
      {
        properties: {
          value: {
            required: ["content", "published"],
            properties: {
              content:   { type: "string" },
              published: { type: "number" },
            },
          },
        },
      },
      undefined,
      true
    );

  // ── DMs ────────────────────────────────────────────────────────
  const showNewDM = ref(false);
  const dmSearch  = ref("");

  const realDMs = computed(() => {
    if (!session.value) return [];
    return dmConvObjects.value
      .filter(c => c.value.participants.includes(session.value.actor))
      .map(c => {
        const partner = c.value.participants.find(p => p !== session.value.actor) ?? "";
        return {
          url: c.url, channel: c.value.channel,
          partnerActor: partner, partnerName: partner,
          preview: "Real conversation", created: c.value.created,
          isDummy: false,
        };
      });
  });

  const allDMs = computed(() => {
    const real = realDMs.value.toSorted((a, b) => b.created - a.created);
    return [...real, ...DUMMY_DMS];
  });

  const filteredDMs = computed(() => {
    const q = dmSearch.value.toLowerCase().trim();
    if (!q) return allDMs.value;
    return allDMs.value.filter(d => d.partnerName.toLowerCase().includes(q));
  });

  function selectDM(conv) {
    activeDMChannel.value      = conv.channel;
    activeDMPartnerName.value  = conv.partnerName;
    activeDMPartnerActor.value = conv.partnerActor;
    activeDMIsDummy.value      = conv.isDummy ?? false;
    router.push({ name: "chat", params: { chatId: encodeURIComponent(conv.channel) } });
  }

  async function openOrCreateDM(partnerActor, partnerDisplayName) {
    if (!session.value) return;
    const me = session.value.actor;

    const dummyMatch = DUMMY_DMS.find(d => d.partnerActor === partnerActor);
    if (dummyMatch) { selectDM(dummyMatch); return; }

    const existing = dmConvObjects.value.find(c =>
      c.value.participants.includes(me) && c.value.participants.includes(partnerActor)
    );
    if (existing) {
      selectDM({
        url: existing.url, channel: existing.value.channel,
        partnerActor, partnerName: partnerDisplayName || partnerActor,
        isDummy: false, created: existing.value.created,
      });
      return;
    }

    const newCh = crypto.randomUUID();
    await graffiti.post(
      {
        value: {
          type: "DMConversation",
          participants: [me, partnerActor].sort(),
          channel: newCh,
          created: Date.now(),
        },
        channels: [DMS_CHANNEL],
      },
      session.value
    );
    activeDMChannel.value     = newCh;
    activeDMPartnerName.value = partnerDisplayName || partnerActor;
    activeDMIsDummy.value     = false;
    router.push({ name: "chat", params: { chatId: encodeURIComponent(newCh) } });
  }

  // Restore DM state when navigating directly to /chat/:chatId
  watch(
    () => router.currentRoute.value.params.chatId,
    (chatId) => {
      if (!chatId) {
        if (router.currentRoute.value.name === "chats") activeDMChannel.value = null;
        return;
      }
      const channel = decodeURIComponent(chatId);
      if (activeDMChannel.value === channel) return;
      const conv = allDMs.value.find(d => d.channel === channel);
      if (conv) {
        activeDMChannel.value      = conv.channel;
        activeDMPartnerName.value  = conv.partnerName;
        activeDMPartnerActor.value = conv.partnerActor;
        activeDMIsDummy.value      = conv.isDummy ?? false;
      } else {
        activeDMChannel.value = channel;
      }
    },
    { immediate: true }
  );

  // ── Study groups ───────────────────────────────────────────────
  const newGroupTitle = ref("");
  const creatingGroup = ref(false);

  const realGroups = computed(() =>
    groupObjects.value.map(g => ({
      url: g.url, channel: g.value.channel, title: g.value.title,
      creatorName: g.actor, published: g.value.published, isDummy: false,
    })).toSorted((a, b) => b.published - a.published)
  );

  const allGroups = computed(() => [...realGroups.value, ...DUMMY_GROUPS]);

  async function createGroup() {
    if (!newGroupTitle.value.trim()) return;
    creatingGroup.value = true;
    try {
      await graffiti.post(
        {
          value: {
            type: "StudyGroup",
            channel: crypto.randomUUID(),
            title: newGroupTitle.value.trim(),
            published: Date.now(),
          },
          channels: [STUDY_CHANNEL],
        },
        session.value
      );
      newGroupTitle.value = "";
    } finally {
      creatingGroup.value = false;
    }
  }

  function selectGroup(g) {
    activeStudyChannel.value = g.channel;
    activeStudyTitle.value   = g.title;
    activeStudyIsDummy.value = g.isDummy ?? false;
    studySubTab.value        = "session";
    router.push({ name: "study-group", params: { groupId: encodeURIComponent(g.channel) } });
  }

  const suggestedTopics = SUGGESTED_TOPICS;

  // Restore study state when navigating directly to /study/:groupId
  watch(
    () => router.currentRoute.value.params.groupId,
    (groupId) => {
      if (!groupId) return;
      const channel = decodeURIComponent(groupId);
      if (activeStudyChannel.value === channel) return;
      const g = allGroups.value.find(g => g.channel === channel);
      if (g) {
        activeStudyChannel.value = g.channel;
        activeStudyTitle.value   = g.title;
        activeStudyIsDummy.value = g.isDummy ?? false;
      } else {
        activeStudyChannel.value = channel;
      }
      studySubTab.value = "session";
    },
    { immediate: true }
  );

  // ── Profiles ───────────────────────────────────────────────────
  const searchQ = ref("");

  const latestRealProfiles = computed(() => {
    const map = new Map();
    for (const p of profileObjects.value) {
      const prev = map.get(p.actor);
      if (!prev || p.value.published > prev.value.published) map.set(p.actor, p);
    }
    return [...map.values()];
  });

  const myProfile = computed(() =>
    session.value
      ? latestRealProfiles.value.find(p => p.actor === session.value.actor) ?? null
      : null
  );

  const dummyProfileObjs = DUMMY_PROFILES.map(p => ({
    actor: p.actor, isDummy: true,
    value: { displayName: p.displayName, bio: p.bio, type: "Profile", published: 0 },
  }));

  const allProfiles = computed(() => {
    const myActor = session.value?.actor;
    const realOthers = latestRealProfiles.value.filter(p => p.actor !== myActor);
    return [...realOthers, ...dummyProfileObjs];
  });

  const filteredProfiles = computed(() => {
    const q = searchQ.value.toLowerCase().trim();
    if (!q) return allProfiles.value;
    return allProfiles.value.filter(p =>
      p.value.displayName?.toLowerCase().includes(q) ||
      p.value.bio?.toLowerCase().includes(q)
    );
  });

  const pickerResults = computed(() => {
    const q = dmSearch.value.toLowerCase().trim();
    const all = allProfiles.value.map(p => ({
      actor: p.actor,
      displayName: p.value.displayName,
      bio: p.value.bio || "",
    }));
    if (!q) return all;
    return all.filter(u =>
      u.displayName.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q)
    );
  });

  const editingProfile = ref(false);
  const savingProfile  = ref(false);
  const profileDraft   = ref({ displayName: "", bio: "" });

  function startEdit() {
    profileDraft.value = {
      displayName: myProfile.value?.value.displayName ?? "",
      bio:         myProfile.value?.value.bio ?? "",
    };
    editingProfile.value = true;
  }

  async function saveProfile() {
    savingProfile.value = true;
    try {
      const mine = profileObjects.value.filter(p => p.actor === session.value?.actor);
      for (const old of mine) await graffiti.delete(old, session.value);
      await graffiti.post(
        {
          value: {
            type:        "Profile",
            displayName: profileDraft.value.displayName.trim(),
            bio:         profileDraft.value.bio.trim(),
            published:   Date.now(),
          },
          channels: [PROFILES_CHANNEL],
        },
        session.value
      );
      editingProfile.value = false;
    } finally {
      savingProfile.value = false;
    }
  }

  // ── Active messages ────────────────────────────────────────────
  const activeMessages = computed(() => {
    let seeds = [];
    if (tab.value === "chats" && activeDMChannel.value) {
      seeds = DUMMY_DM_MESSAGES[activeDMChannel.value] ?? [];
    } else if (tab.value === "study" && activeStudyChannel.value) {
      seeds = DUMMY_GROUP_MESSAGES[activeStudyChannel.value] ?? [];
    }
    return [...seeds, ...messageObjects.value]
      .toSorted((a, b) => b.value.published - a.value.published);
  });

  // ── Send / Delete ──────────────────────────────────────────────
  const draft    = ref("");
  const sending  = ref(false);
  const deleting = ref(new Set());

  async function send() {
    const ch = tab.value === "chats" ? activeDMChannel.value : activeStudyChannel.value;
    if (!draft.value.trim() || !ch) return;
    sending.value = true;
    try {
      await graffiti.post(
        { value: { content: draft.value.trim(), published: Date.now() }, channels: [ch] },
        session.value
      );
      draft.value = "";
    } finally {
      sending.value = false;
    }
  }

  async function del(msg) {
    deleting.value = new Set(deleting.value).add(msg.url);
    try {
      await graffiti.delete(msg, session.value);
    } finally {
      const s = new Set(deleting.value); s.delete(msg.url);
      deleting.value = s;
    }
  }

  function isMine(msg) {
    if (msg.isDummy) return msg.isOwn;
    return msg.actor === session.value?.actor;
  }

  function senderLabel(msg) {
    return msg.isDummy ? msg.senderName : msg.actor;
  }

  function fmt(ts) {
    if (!ts) return "";
    const d = new Date(ts), now = new Date();
    const today = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return today ? time : d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + time;
  }

  return {
    tab, setTab, studySubTab,
    viewingProfile, openProfile, closeProfile,
    showNewDM, dmSearch, filteredDMs, pickerResults,
    activeDMChannel, activeDMPartnerName, activeDMPartnerActor, activeDMIsDummy,
    selectDM, openOrCreateDM,
    allGroups, newGroupTitle, creatingGroup, createGroup, selectGroup,
    activeStudyChannel, activeStudyTitle, activeStudyIsDummy, suggestedTopics,
    myProfile, filteredProfiles, searchQ,
    editingProfile, profileDraft, savingProfile, startEdit, saveProfile,
    activeMessages, messagesLoading,
    draft, sending, send,
    deleting, del,
    isMine, senderLabel, fmt,
  };
}

const App = { template: "#template", setup, components: { ChatMessage } };

createApp(App)
  .use(GraffitiPlugin, { graffiti: new GraffitiDecentralized() })
  .use(router)
  .mount("#app");