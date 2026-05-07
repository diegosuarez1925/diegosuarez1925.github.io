import { createApp, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { GraffitiDecentralized } from "@graffiti-garden/implementation-decentralized";
import {
  GraffitiPlugin,
  useGraffiti,
  useGraffitiSession,
  useGraffitiDiscover,
} from "@graffiti-garden/wrapper-vue";

// ── Channel namespaces ─────────────────────────────────────────────
const DMS_CHANNEL              = "designftw-26-dms";
const STUDY_CHANNEL            = "designftw-26-study";
const STUDY_MEMBERSHIPS_CHANNEL = "designftw-26-study-memberships";
const PROFILES_CHANNEL         = "designftw-26-profiles";

// ── Dummy seed data ────────────────────────────────────────────────
const NOW = Date.now();
const MIN = 60_000;
const HR  = 3_600_000;
const DAY = 86_400_000;

const TAG_OPTIONS = ["6.1800", "6.4500", "9.00", "6.C01", "6.767"];

const DUMMY_PROFILES = [
  { actor: "dummy-alex",   displayName: "Alex Chen",       bio: "2nd year MFA. Speculative & critical design.", tags: ["6.1800", "6.C01"] },
  { actor: "dummy-sarah",  displayName: "Sarah Kim",        bio: "Researcher. Accessibility + inclusive design.", tags: ["9.00", "6.4500"] },
  { actor: "dummy-marcus", displayName: "Marcus Johnson",   bio: "Designer/dev. AI tools & creative agency.", tags: ["6.767", "6.1800"] },
  { actor: "dummy-jamie",  displayName: "Jamie Park",       bio: "1st year. Participatory co-design.", tags: ["6.C01", "9.00", "6.4500"] },
  { actor: "dummy-prof",   displayName: "Prof. DesignFTW",  bio: "Teaching design methods and critical theory.", tags: ["6.1800", "6.767", "6.C01"] },
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

const _isoDate = (ms) => new Date(ms).toISOString().slice(0, 10);
const TODAY_STR     = _isoDate(NOW);
const TOMORROW_STR  = _isoDate(NOW + DAY);
const NEXT_WEEK_STR = _isoDate(NOW + 7 * DAY);

const DUMMY_GROUPS = [
  {
    url: "dummy-grp-1", channel: "dummy-grp-ch-1",
    title: "HCI Midterm Review",
    description: "Group review for the upcoming HCI midterm. We'll go through Norman's design principles, the seven stages of action, and practice past exam problems together.",
    creatorName: "alex.chen", creatorActor: "dummy-alex",
    published: NOW - HR, isDummy: true,
    tags: ["6.1800"],
    date: TODAY_STR, startTime: "14:00", endTime: "16:00",
    location: "Building 32, Room 144",
    pinLat: 42.36174, pinLng: -71.09102,
    pinAddress: "Stata Center (Building 32), 32 Vassar St, Cambridge, MA",
    dummyMembers: ["dummy-alex", "dummy-sarah", "dummy-marcus"],
  },
  {
    url: "dummy-grp-2", channel: "dummy-grp-ch-2",
    title: "Design Sprint #3 Debrief",
    description: "Reflect on our third design sprint, share insights from user testing, and plan improvements for the next iteration.",
    creatorName: "sarah.kim", creatorActor: "dummy-sarah",
    published: NOW - 3 * HR, isDummy: true,
    tags: ["6.C01", "9.00"],
    date: TOMORROW_STR, startTime: "10:00", endTime: "11:30",
    location: "Studio Lab, E15-310",
    pinLat: 42.36031, pinLng: -71.08715,
    pinAddress: "MIT Media Lab (E15), 75 Amherst St, Cambridge, MA",
    dummyMembers: ["dummy-sarah", "dummy-jamie"],
  },
  {
    url: "dummy-grp-3", channel: "dummy-grp-ch-3",
    title: "Thesis Proposal Workshop",
    description: "Workshop your thesis proposals with feedback from peers and the professor. Bring drafts of research questions and a one-page summary.",
    creatorName: "prof.designftw", creatorActor: "dummy-prof",
    published: NOW - 2 * DAY, isDummy: true,
    tags: ["6.767"],
    date: NEXT_WEEK_STR, startTime: "13:00", endTime: "15:00",
    location: "Hayden Library, Room 1",
    pinLat: 42.35930, pinLng: -71.09200,
    pinAddress: "Hayden Library, 160 Memorial Dr, Cambridge, MA",
    dummyMembers: ["dummy-prof", "dummy-marcus", "dummy-jamie", "dummy-alex"],
  },
];

// MIT campus center, used as the default map view
const MIT_CENTER = [42.3601, -71.0942];
const MIT_ZOOM   = 16;

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
        tags:        profile.value.tags || [],
        isDummy:     profile.isDummy || false,
      };
    } else {
      viewingProfile.value = { actor, displayName: actor, bio: "", tags: [], isDummy: false };
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
    },
    session  // needed to discover private (allowed) DM objects
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
      session, // needed to discover private (allowed) DM messages
      true
    );

  // ── DMs ────────────────────────────────────────────────────────
  const showNewDM       = ref(false);
  const dmSearch        = ref("");
  const dmTagFilter     = ref([]);
  const dmTagDropdown   = ref("");

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
    const tagsF = dmTagFilter.value;
    return allDMs.value.filter(d => {
      // text search across partner name (and tag substrings, for back-compat)
      if (q) {
        const nameMatch = d.partnerName.toLowerCase().includes(q);
        const tagSubMatch = getActorTags(d.partnerActor)
          .some(t => t.toLowerCase().includes(q));
        if (!nameMatch && !tagSubMatch) return false;
      }
      // tag dropdown filter (must have at least one of the selected tags)
      if (tagsF.length) {
        const tags = getActorTags(d.partnerActor);
        if (!tagsF.some(t => tags.includes(t))) return false;
      }
      return true;
    });
  });

  // Tag dropdown helpers for DMs (mirror the Study filter helpers)
  const availableDmTags = computed(() =>
    TAG_OPTIONS.filter(t => !dmTagFilter.value.includes(t))
  );
  function addDmTag() {
    const t = dmTagDropdown.value;
    if (t && !dmTagFilter.value.includes(t)) {
      dmTagFilter.value = [...dmTagFilter.value, t];
    }
    dmTagDropdown.value = "";
  }
  function removeDmTag(t) {
    dmTagFilter.value = dmTagFilter.value.filter(x => x !== t);
  }

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
        allowed: [me, partnerActor], // only the two participants can see this
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
  // Create form state
  const newGroupTitle       = ref("");
  const newGroupDescription = ref("");
  const newGroupTags        = ref([]);
  const newGroupDate        = ref("");
  const newGroupStartTime   = ref("");
  const newGroupEndTime     = ref("");
  const newGroupLocation    = ref("");
  const newGroupTagDropdown = ref("");
  const newGroupPinLat      = ref(null);
  const newGroupPinLng      = ref(null);
  const newGroupPinAddress  = ref("");
  const creatingGroup       = ref(false);
  const createError         = ref("");

  // Leaflet map state
  let joinMap          = null;
  let createMap        = null;
  let createMapMarker  = null;
  const joinMapMarkers = [];

  // Filter state for the Join sub-tab
  const studySearch     = ref("");
  const studyTagFilter  = ref([]);
  const studyDateFilter = ref("");
  const studyStartsBy   = ref("");
  const studyEndsBy     = ref("");
  const filterTagDropdown = ref("");

  // Modal state
  const viewingSession = ref(null);
  const joiningGroup   = ref(false);

  // Memberships (who has joined which session)
  const { objects: membershipObjects } = useGraffitiDiscover(
    [STUDY_MEMBERSHIPS_CHANNEL],
    {
      properties: {
        value: {
          required: ["type", "sessionChannel", "joinedAt"],
          properties: {
            type:           { const: "StudyMembership" },
            sessionChannel: { type: "string" },
            joinedAt:       { type: "number" },
          },
        },
      },
    }
  );

  const realGroups = computed(() =>
    groupObjects.value.map(g => ({
      url: g.url, channel: g.value.channel, title: g.value.title,
      description: g.value.description || "",
      tags: g.value.tags || [],
      date: g.value.date || "",
      startTime: g.value.startTime || "",
      endTime: g.value.endTime || "",
      location: g.value.location || "",
      pinLat:     typeof g.value.pinLat     === "number" ? g.value.pinLat     : null,
      pinLng:     typeof g.value.pinLng     === "number" ? g.value.pinLng     : null,
      pinAddress: g.value.pinAddress || "",
      creatorName: g.actor, creatorActor: g.actor,
      published: g.value.published, isDummy: false,
    })).toSorted((a, b) => b.published - a.published)
  );

  const allGroups = computed(() => [...realGroups.value, ...DUMMY_GROUPS]);

  // Compute members of a session: dummyMembers (for demos) + real memberships
  // + the creator (auto-joined). Returns array of actor identifiers.
  function getSessionMembers(group) {
    const set = new Set();
    if (group.creatorActor) set.add(group.creatorActor);
    if (group.isDummy && Array.isArray(group.dummyMembers)) {
      group.dummyMembers.forEach(a => set.add(a));
    }
    membershipObjects.value
      .filter(m => m.value.sessionChannel === group.channel)
      .forEach(m => set.add(m.actor));
    return [...set];
  }

  // Did the current user join this session?
  function isMemberOf(group) {
    if (!group) return false;
    const me = session.value?.actor;
    if (!me) return false;
    if (group.creatorActor === me) return true;
    return membershipObjects.value.some(
      m => m.actor === me && m.value.sessionChannel === group.channel
    );
  }

  const filteredGroups = computed(() => {
    const q = studySearch.value.toLowerCase().trim();
    const tagsF  = studyTagFilter.value;
    const dateF  = studyDateFilter.value;
    const sBy    = studyStartsBy.value;
    const eBy    = studyEndsBy.value;
    return allGroups.value.filter(g => {
      // text search across title and description
      if (q) {
        const inTitle = g.title.toLowerCase().includes(q);
        const inDesc  = (g.description || "").toLowerCase().includes(q);
        if (!inTitle && !inDesc) return false;
      }
      // class tags filter (match any selected tag)
      if (tagsF.length) {
        const tags = g.tags || [];
        if (!tagsF.some(t => tags.includes(t))) return false;
      }
      // date filter
      if (dateF && g.date !== dateF) return false;
      // starts-by filter — session starts at or before this time
      if (sBy && (!g.startTime || g.startTime > sBy)) return false;
      // ends-by filter — session ends at or before this time
      if (eBy && (!g.endTime || g.endTime > eBy)) return false;
      return true;
    });
  });

  // Sessions that the current user has joined or created (used for the
  // "My Sessions" sidebar in the Session Chats sub-tab). Demo sessions
  // are always visible so users can browse the chats without joining.
  const myJoinedGroups = computed(() => {
    return allGroups.value.filter(g => g.isDummy || isMemberOf(g));
  });

  // The My Sessions sidebar reuses the Join keyword search.
  const myJoinedGroupsFiltered = computed(() => {
    const q = studySearch.value.toLowerCase().trim();
    if (!q) return myJoinedGroups.value;
    return myJoinedGroups.value.filter(g => {
      if (g.title.toLowerCase().includes(q)) return true;
      if ((g.description || "").toLowerCase().includes(q)) return true;
      return (g.tags || []).some(t => t.toLowerCase().includes(q));
    });
  });

  async function createGroup() {
    createError.value = "";
    if (!newGroupTitle.value.trim())       { createError.value = "Title is required.";       return; }
    if (!newGroupDescription.value.trim()) { createError.value = "Description is required."; return; }
    if (!newGroupDate.value)               { createError.value = "Date is required.";        return; }
    if (!newGroupStartTime.value)          { createError.value = "Start time is required.";  return; }
    if (!newGroupEndTime.value)            { createError.value = "End time is required.";    return; }
    if (!newGroupLocation.value.trim())    { createError.value = "Location is required.";    return; }
    if (newGroupEndTime.value <= newGroupStartTime.value) {
      createError.value = "End time must be after start time."; return;
    }
    if (newGroupPinLat.value == null || newGroupPinLng.value == null) {
      createError.value = "Drop a pin on the map to set the session location."; return;
    }
    creatingGroup.value = true;
    try {
      const channel = crypto.randomUUID();
      await graffiti.post(
        {
          value: {
            type: "StudyGroup",
            channel,
            title:       newGroupTitle.value.trim(),
            description: newGroupDescription.value.trim(),
            tags:        newGroupTags.value,
            date:        newGroupDate.value,
            startTime:   newGroupStartTime.value,
            endTime:     newGroupEndTime.value,
            location:    newGroupLocation.value.trim(),
            pinLat:      newGroupPinLat.value,
            pinLng:      newGroupPinLng.value,
            pinAddress:  newGroupPinAddress.value || "",
            published:   Date.now(),
          },
          channels: [STUDY_CHANNEL],
        },
        session.value
      );
      // reset form
      newGroupTitle.value       = "";
      newGroupDescription.value = "";
      newGroupTags.value        = [];
      newGroupDate.value        = "";
      newGroupStartTime.value   = "";
      newGroupEndTime.value     = "";
      newGroupLocation.value    = "";
      newGroupTagDropdown.value = "";
      newGroupPinLat.value      = null;
      newGroupPinLng.value      = null;
      newGroupPinAddress.value  = "";
      if (createMapMarker) { createMapMarker.remove(); createMapMarker = null; }
      // jump to Join so the user can see their new session
      studySubTab.value = "join";
    } finally {
      creatingGroup.value = false;
    }
  }

  // Click a session card in Join → open the details modal
  function viewSession(group) {
    viewingSession.value = group;
  }

  function closeViewSession() {
    viewingSession.value = null;
  }

  // Post a membership for the current user (no-op for dummies / already-joined).
  async function joinSession(group) {
    if (!session.value) return;
    if (group.isDummy) {
      // demo sessions: just open the chat
      selectGroup(group);
      closeViewSession();
      return;
    }
    if (isMemberOf(group)) {
      selectGroup(group);
      closeViewSession();
      return;
    }
    joiningGroup.value = true;
    try {
      await graffiti.post(
        {
          value: {
            type:           "StudyMembership",
            sessionChannel: group.channel,
            sessionUrl:     group.url,
            joinedAt:       Date.now(),
          },
          channels: [STUDY_MEMBERSHIPS_CHANNEL],
        },
        session.value
      );
      selectGroup(group);
      closeViewSession();
    } finally {
      joiningGroup.value = false;
    }
  }

  // Reset all Join filters
  function clearStudyFilters() {
    studySearch.value     = "";
    studyTagFilter.value  = [];
    studyDateFilter.value = "";
    studyStartsBy.value   = "";
    studyEndsBy.value     = "";
    filterTagDropdown.value = "";
  }

  // Tag dropdown helpers
  function addCreateTag() {
    const t = newGroupTagDropdown.value;
    if (t && !newGroupTags.value.includes(t)) {
      newGroupTags.value = [...newGroupTags.value, t];
    }
    newGroupTagDropdown.value = "";
  }
  function removeCreateTag(t) {
    newGroupTags.value = newGroupTags.value.filter(x => x !== t);
  }
  function addFilterTag() {
    const t = filterTagDropdown.value;
    if (t && !studyTagFilter.value.includes(t)) {
      studyTagFilter.value = [...studyTagFilter.value, t];
    }
    filterTagDropdown.value = "";
  }
  function removeFilterTag(t) {
    studyTagFilter.value = studyTagFilter.value.filter(x => x !== t);
  }

  // Available options remaining (not already selected)
  const availableCreateTags = computed(() =>
    TAG_OPTIONS.filter(t => !newGroupTags.value.includes(t))
  );
  const availableFilterTags = computed(() =>
    TAG_OPTIONS.filter(t => !studyTagFilter.value.includes(t))
  );

  // Find a profile/display-name for any actor (real or dummy)
  function getActorDisplayName(actor) {
    if (!actor) return "Unknown";
    const profile = allProfiles.value.find(p => p.actor === actor);
    if (profile?.value?.displayName) return profile.value.displayName;
    // fall back to a short version of the raw actor string
    if (actor.startsWith("dummy-")) return actor.replace(/^dummy-/, "");
    return actor;
  }

  // Pretty-print a YYYY-MM-DD as e.g. "Wed, May 6"
  function fmtDate(s) {
    if (!s) return "";
    const [y, m, d] = s.split("-").map(Number);
    if (!y || !m || !d) return s;
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  }
  // Pretty-print HH:MM (24h) as "2:00 PM"
  function fmtTime(s) {
    if (!s) return "";
    const [h, m] = s.split(":").map(Number);
    if (Number.isNaN(h)) return s;
    const dt = new Date(); dt.setHours(h, m || 0, 0, 0);
    return dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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
    value: { displayName: p.displayName, bio: p.bio, tags: p.tags || [], type: "Profile", published: 0 },
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
    const tagsF = dmTagFilter.value;
    const all = allProfiles.value.map(p => ({
      actor: p.actor,
      displayName: p.value.displayName,
      bio: p.value.bio || "",
      tags: p.value.tags || [],
    }));
    return all.filter(u => {
      if (q) {
        const matches = u.displayName.toLowerCase().includes(q) ||
                        u.bio.toLowerCase().includes(q) ||
                        u.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (tagsF.length && !tagsF.some(t => u.tags.includes(t))) return false;
      return true;
    });
  });

  const editingProfile = ref(false);
  const savingProfile  = ref(false);
  const profileDraft   = ref({ displayName: "", bio: "", tags: [] });

  function startEdit() {
    profileDraft.value = {
      displayName: myProfile.value?.value.displayName ?? "",
      bio:         myProfile.value?.value.bio ?? "",
      tags:        [...(myProfile.value?.value.tags ?? [])],
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
            tags:        profileDraft.value.tags || [],
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

  // Look up tags for any actor (used in DM list and profile modal)
  function getActorTags(actor) {
    if (!actor) return [];
    const profile = allProfiles.value.find(p => p.actor === actor);
    return profile?.value?.tags || [];
  }

  // Toggle a tag in the profile editor
  function toggleProfileTag(tag) {
    const tags = profileDraft.value.tags || [];
    profileDraft.value.tags = tags.includes(tag)
      ? tags.filter(t => t !== tag)
      : [...tags, tag];
  }

  // Toggle a tag when creating a study session
  function toggleGroupTag(tag) {
    newGroupTags.value = newGroupTags.value.includes(tag)
      ? newGroupTags.value.filter(t => t !== tag)
      : [...newGroupTags.value, tag];
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
    const isDM = tab.value === "chats";
    const ch   = isDM ? activeDMChannel.value : activeStudyChannel.value;
    if (!draft.value.trim() || !ch) return;
    sending.value = true;
    try {
      // For real DMs, restrict the message to sender + recipient only.
      // Study group messages stay public (no allowed).
      const allowed =
        isDM && !activeDMIsDummy.value && activeDMPartnerActor.value
          ? [session.value.actor, activeDMPartnerActor.value]
          : undefined;

      await graffiti.post(
        {
          value: { content: draft.value.trim(), published: Date.now() },
          channels: [ch],
          ...(allowed ? { allowed } : {}),
        },
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

  // ── Leaflet maps ───────────────────────────────────────────────
  // Fix the default Leaflet marker icon URLs (they point to local
  // assets by default; we serve from the unpkg CDN instead).
  function patchLeafletIcons() {
    if (!window.L || window.__leafletIconsPatched) return;
    const proto = window.L.Icon.Default.prototype;
    delete proto._getIconUrl;
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
    window.__leafletIconsPatched = true;
  }

  // Initialise the Join map and seed pins for the current filter.
  function initJoinMap() {
    if (!window.L) return;
    patchLeafletIcons();
    const el = document.getElementById("join-map");
    if (!el || joinMap) return;
    joinMap = window.L.map(el, { scrollWheelZoom: true })
      .setView(MIT_CENTER, MIT_ZOOM);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
      maxZoom: 19,
    }).addTo(joinMap);
    refreshJoinMarkers();
    // Leaflet sometimes lays out before the container finishes sizing
    // (especially on the very first navigation). Retry a few times so
    // tiles always paint correctly.
    [0, 60, 250, 600].forEach(d => setTimeout(() => {
      if (joinMap) joinMap.invalidateSize();
    }, d));
    // Also re-measure if the container resizes (e.g. window resize).
    if (window.ResizeObserver && !joinMap._roAttached) {
      const ro = new ResizeObserver(() => { if (joinMap) joinMap.invalidateSize(); });
      ro.observe(el);
      joinMap._ro = ro;
      joinMap._roAttached = true;
    }
  }

  function tearDownJoinMap() {
    if (!joinMap) return;
    if (joinMap._ro) { joinMap._ro.disconnect(); joinMap._ro = null; }
    joinMapMarkers.forEach(m => m.remove());
    joinMapMarkers.length = 0;
    joinMap.remove();
    joinMap = null;
  }

  // Sync the pins on the Join map with whatever filteredGroups currently is.
  function refreshJoinMarkers() {
    if (!joinMap || !window.L) return;
    joinMapMarkers.forEach(m => m.remove());
    joinMapMarkers.length = 0;
    for (const g of filteredGroups.value) {
      if (g.pinLat == null || g.pinLng == null) continue;
      const marker = window.L.marker([g.pinLat, g.pinLng]).addTo(joinMap);
      const subtitle = [
        g.date ? fmtDate(g.date) : "",
        g.startTime ? fmtTime(g.startTime) : "",
      ].filter(Boolean).join(" · ");
      marker.bindTooltip(`<strong>${escapeHtml(g.title)}</strong>${subtitle ? `<br/>${escapeHtml(subtitle)}` : ""}`, {
        direction: "top", offset: [0, -16],
      });
      marker.on("click", () => viewSession(g));
      joinMapMarkers.push(marker);
    }
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[ch]));
  }

  // Initialise the Create-form pin picker map.
  function initCreateMap() {
    if (!window.L) return;
    patchLeafletIcons();
    const el = document.getElementById("create-map");
    if (!el || createMap) return;
    const center = (newGroupPinLat.value != null && newGroupPinLng.value != null)
      ? [newGroupPinLat.value, newGroupPinLng.value] : MIT_CENTER;
    createMap = window.L.map(el, { scrollWheelZoom: true })
      .setView(center, MIT_ZOOM);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(createMap);
    if (newGroupPinLat.value != null && newGroupPinLng.value != null) {
      placeCreateMarker(newGroupPinLat.value, newGroupPinLng.value, false);
    }
    createMap.on("click", (e) => {
      placeCreateMarker(e.latlng.lat, e.latlng.lng, true);
    });
    [0, 60, 250, 600].forEach(d => setTimeout(() => {
      if (createMap) createMap.invalidateSize();
    }, d));
  }

  function tearDownCreateMap() {
    if (!createMap) return;
    if (createMapMarker) { createMapMarker.remove(); createMapMarker = null; }
    createMap.remove();
    createMap = null;
  }

  function placeCreateMarker(lat, lng, doGeocode) {
    if (!createMap || !window.L) return;
    if (createMapMarker) {
      createMapMarker.setLatLng([lat, lng]);
    } else {
      createMapMarker = window.L.marker([lat, lng], { draggable: true }).addTo(createMap);
      createMapMarker.on("dragend", (e) => {
        const ll = e.target.getLatLng();
        newGroupPinLat.value = ll.lat;
        newGroupPinLng.value = ll.lng;
        reverseGeocode(ll.lat, ll.lng);
      });
    }
    newGroupPinLat.value = lat;
    newGroupPinLng.value = lng;
    if (doGeocode) reverseGeocode(lat, lng);
  }

  // Optional: ask Nominatim for a human-readable address. Best-effort.
  async function reverseGeocode(lat, lng) {
    const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    newGroupPinAddress.value = fallback;
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { Accept: "application/json" } }
      );
      if (!r.ok) return;
      const data = await r.json();
      if (data?.display_name) newGroupPinAddress.value = data.display_name;
    } catch { /* network errors are non-fatal */ }
  }

  function clearCreatePin() {
    newGroupPinLat.value = null;
    newGroupPinLng.value = null;
    newGroupPinAddress.value = "";
    if (createMapMarker) { createMapMarker.remove(); createMapMarker = null; }
  }

  // Init/tear down maps as the user moves between sub-tabs.
  // Only fires when both: tab === "study" and the relevant sub-tab is active.
  watch(
    () => (tab.value === "study" ? studySubTab.value : null),
    async (val, oldVal) => {
      if (oldVal === "join")   tearDownJoinMap();
      if (oldVal === "create") tearDownCreateMap();
      await nextTick();
      // Two ticks helps when v-if templates have just been mounted.
      await nextTick();
      if (val === "join")   initJoinMap();
      if (val === "create") initCreateMap();
    },
    { immediate: true }
  );

  // Update Join markers whenever filtered list changes.
  watch(filteredGroups, () => {
    if (joinMap) refreshJoinMarkers();
  });

  // Try to init the Join map on first mount if user lands directly there.
  onMounted(async () => {
    await nextTick();
    if (tab.value === "study" && studySubTab.value === "join")  initJoinMap();
    if (tab.value === "study" && studySubTab.value === "create") initCreateMap();
  });

  onBeforeUnmount(() => {
    tearDownJoinMap();
    tearDownCreateMap();
  });

  return {
    tab, setTab, studySubTab,
    TAG_OPTIONS,
    viewingProfile, openProfile, closeProfile,
    showNewDM, dmSearch, filteredDMs, pickerResults,
    dmTagFilter, dmTagDropdown, addDmTag, removeDmTag, availableDmTags,
    activeDMChannel, activeDMPartnerName, activeDMPartnerActor, activeDMIsDummy,
    selectDM, openOrCreateDM,
    // study groups
    allGroups, filteredGroups, myJoinedGroups, myJoinedGroupsFiltered,
    studySearch, studyTagFilter, studyDateFilter, studyStartsBy, studyEndsBy,
    filterTagDropdown, addFilterTag, removeFilterTag, availableFilterTags,
    clearStudyFilters,
    // session create form
    newGroupTitle, newGroupDescription, newGroupTags, newGroupDate,
    newGroupStartTime, newGroupEndTime, newGroupLocation,
    newGroupTagDropdown, addCreateTag, removeCreateTag, availableCreateTags,
    newGroupPinLat, newGroupPinLng, newGroupPinAddress, clearCreatePin,
    creatingGroup, createError, createGroup, selectGroup,
    // session details modal
    viewingSession, viewSession, closeViewSession, joinSession, joiningGroup,
    isMemberOf, getSessionMembers, getActorDisplayName,
    fmtDate, fmtTime,
    activeStudyChannel, activeStudyTitle, activeStudyIsDummy, suggestedTopics,
    myProfile, filteredProfiles, searchQ,
    getActorTags, toggleProfileTag, toggleGroupTag,
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