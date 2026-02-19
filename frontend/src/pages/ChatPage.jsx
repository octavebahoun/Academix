import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WhiteboardCanvas from "../components/WhiteboardCanvas";
import {
  getMentionSuggestions,
  getSessionMessages,
  getSessionParticipants,
  getWhiteboardState,
  uploadChatFile,
} from "../api/chat";
import {
  getNotifications,
  getNotificationUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notifications";
import sessionSocketService from "../services/sessionSocket";

const CURRENT_USER = {
  id: 1,
  nom: "Dupont",
  prenom: "Jean",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
  role: "participant",
};

const SESSION_GOAL = {
  title: "Valider le chapitre 12",
  detail: "10 exercices corrigés avant 17h00",
  progress: 62,
};

const QUICK_LINKS = [
  { id: "syllabus", label: "Plan_du_cours.pdf" },
  { id: "recap", label: "Synthèse du chapitre" },
];

const PRO_TIP =
  "Utilise @Alex pour solliciter le modérateur, et @kavt pour une aide IA. Le bouton W te permet d'ouvrir le tableau blanc partagé !";

const WHITEBOARD_CARD = {
  title: "Tableau partagé",
  subtitle: "3 personnes dessinent",
};

const MOCK_PARTICIPANTS = [
  {
    userId: 2,
    statut: "present",
    online: true,
    user_info: {
      nom: "Marshall",
      prenom: "Alex",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
  },
  {
    userId: 3,
    statut: "present",
    online: true,
    user_info: {
      nom: "Jenkins",
      prenom: "Sarah",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  },
  {
    userId: 4,
    statut: "absent",
    online: false,
    user_info: {
      nom: "Chen",
      prenom: "David",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
  },
];

const MOCK_MESSAGES = [
  {
    _id: "demo-1",
    type: "system",
    contenu: "Elena Martinez a rejoint la session",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    _id: "demo-2",
    user_id: 2,
    user_info: {
      nom: "Marshall",
      prenom: "Alex",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    type: "text",
    contenu:
      "Quelqu'un a les notes du dernier cours sur la mécanique quantique ?",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    _id: "demo-3",
    user_id: 1,
    user_info: {
      nom: "Dupont",
      prenom: "Jean",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
    },
    type: "text",
    contenu: "Oui ! Je les partage dans 2 minutes.",
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  },
];

const ChatPage = ({ session, onLeave }) => {
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatPagination, setChatPagination] = useState({
    hasMore: false,
    nextCursor: null,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const MotionDiv = motion.div;
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [isMentionsLoading, setIsMentionsLoading] = useState(false);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [pendingUploadName, setPendingUploadName] = useState("");
  const [activeRoleFilter, setActiveRoleFilter] = useState("all");
  const [sessionRole, setSessionRole] = useState(CURRENT_USER.role);
  const [whiteboardStateCount, setWhiteboardStateCount] = useState(0);
  const [whiteboardEventsCount, setWhiteboardEventsCount] = useState(0);
  const [whiteboardOperations, setWhiteboardOperations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [counterStartAt, setCounterStartAt] = useState(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const sessionId = session?.id || session?._id;
  const isDemoSession = sessionId && String(sessionId).startsWith("demo-");

  const sessionTitle = session?.titre || "Session collaborative";
  const sessionSubtitle = session?.format
    ? `Format ${session.format.toUpperCase()}`
    : "Session en cours";

  const sessionStart = useMemo(() => {
    return session?.date_debut ? new Date(session.date_debut) : null;
  }, [session?.date_debut]);
  const sessionDuration = session?.duree_minutes || 90;
  const sessionEnd = useMemo(() => {
    if (session?.date_fin) {
      return new Date(session.date_fin);
    }
    if (sessionStart) {
      return new Date(sessionStart.getTime() + sessionDuration * 60000);
    }
    return null;
  }, [session?.date_fin, sessionStart, sessionDuration]);

  const activeParticipants = participants.filter((p) => p.online).length;

  const filteredParticipants = useMemo(() => {
    if (!searchTerm.trim()) return participants;
    const term = searchTerm.toLowerCase();
    return participants.filter((participant) => {
      const name =
        `${participant.user_info?.prenom || ""} ${participant.user_info?.nom || ""}`.toLowerCase();
      return name.includes(term);
    });
  }, [participants, searchTerm]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!sessionId) return;
    if (typeof window === "undefined") return;

    const key = `session_counter_started_at_${sessionId}`;
    const stored = Number(window.localStorage.getItem(key));
    if (Number.isFinite(stored) && stored > 0) {
      setCounterStartAt(stored);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (typeof window === "undefined") return;

    if (activeParticipants > 0 && !counterStartAt) {
      const now = Date.now();
      setCounterStartAt(now);
      window.localStorage.setItem(
        `session_counter_started_at_${sessionId}`,
        String(now),
      );
    }
  }, [activeParticipants, counterStartAt, sessionId]);

  useEffect(() => {
    if (!counterStartAt) {
      setTimeLeft(0);
      return;
    }

    const tick = () => {
      const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - counterStartAt) / 1000),
      );
      setTimeLeft(elapsedSeconds);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [counterStartAt]);

  useEffect(() => {
    if (!sessionId || isDemoSession) return;

    const token = localStorage.getItem("token") || "demo-token";
    sessionSocketService.connect(token);
    sessionSocketService.registerUser(CURRENT_USER.id);
    sessionSocketService.joinSession(
      sessionId,
      CURRENT_USER,
      CURRENT_USER.role,
    );
    sessionSocketService.requestWhiteboardSync(sessionId);

    sessionSocketService.onNewMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });

    sessionSocketService.onMessageUpdate((payload) => {
      if (!payload?._id) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg?._id === payload._id
            ? {
                ...msg,
                ...payload,
              }
            : msg,
        ),
      );
    });

    sessionSocketService.onParticipantUpdate((list) => {
      setParticipants(list || []);
    });

    sessionSocketService.onTyping((payload) => {
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        if (payload.isTyping) {
          updated.set(payload.userId, payload.userInfo || {});
        } else {
          updated.delete(payload.userId);
        }
        return updated;
      });
    });

    sessionSocketService.onSessionRole((payload) => {
      if (payload?.role) {
        setSessionRole(payload.role);
      }
    });

    sessionSocketService.onWhiteboardState((payload) => {
      const state = Array.isArray(payload?.state) ? payload.state : [];
      setWhiteboardOperations(state);
      setWhiteboardStateCount(state.length);
    });

    sessionSocketService.onWhiteboardUpdate((payload) => {
      if (payload?.by === CURRENT_USER.id) {
        return;
      }

      if (payload?.action === "clear") {
        setWhiteboardOperations([]);
        setWhiteboardStateCount(0);
      } else if (payload?.action === "text" && payload?.data?.id) {
        if (payload.data?.remove) {
          setWhiteboardOperations((prev) =>
            prev.filter((item) => item?.data?.id !== payload.data.id),
          );
          setWhiteboardStateCount((prev) => Math.max(0, prev - 1));
        } else {
          setWhiteboardOperations((prev) => {
            const existingIndex = prev.findIndex(
              (item) => item?.data?.id === payload.data.id,
            );
            if (existingIndex >= 0) {
              const next = [...prev];
              next[existingIndex] = payload;
              return next;
            }
            return [...prev, payload];
          });
          setWhiteboardStateCount((prev) => prev + 1);
        }
      } else if (payload?.action) {
        setWhiteboardOperations((prev) => [...prev, payload]);
        setWhiteboardStateCount((prev) => prev + 1);
      }
      setWhiteboardEventsCount((prev) => prev + 1);
    });

    sessionSocketService.onNotification((notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 30));
      setNotificationUnreadCount((prev) => prev + 1);
    });

    sessionSocketService.onError((error) => {
      console.error("Session socket error:", error);
    });

    return () => {
      sessionSocketService.leaveSession(sessionId, CURRENT_USER.id);
      sessionSocketService.disconnect();
    };
  }, [sessionId, isDemoSession]);

  useEffect(() => {
    if (!sessionId) return;
    if (isDemoSession) {
      setMessages(MOCK_MESSAGES);
      setParticipants(MOCK_PARTICIPANTS);
      setWhiteboardStateCount(3);
      return;
    }

    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        const [
          messagesResponse,
          participantsResponse,
          whiteboardResponse,
          notificationsResponse,
          unreadResponse,
        ] = await Promise.all([
          getSessionMessages(sessionId, { limit: 40 }),
          getSessionParticipants(
            sessionId,
            activeRoleFilter !== "all" ? activeRoleFilter : undefined,
          ),
          getWhiteboardState(sessionId),
          getNotifications({ limit: 20 }),
          getNotificationUnreadCount(),
        ]);
        if (messagesResponse?.success) {
          setMessages(messagesResponse.messages || []);
          setChatPagination({
            hasMore: Boolean(messagesResponse.pagination?.hasMore),
            nextCursor: messagesResponse.pagination?.nextCursor || null,
          });
        }
        if (participantsResponse?.success) {
          setParticipants(participantsResponse.participants || []);
        }
        if (whiteboardResponse?.success) {
          const state = Array.isArray(whiteboardResponse.state)
            ? whiteboardResponse.state
            : [];
          setWhiteboardOperations(state);
          setWhiteboardStateCount(state.length);
        }
        if (notificationsResponse?.success) {
          setNotifications(
            (notificationsResponse.notifications || []).slice(0, 30),
          );
        }
        if (unreadResponse?.success) {
          setNotificationUnreadCount(unreadResponse.unreadCount || 0);
        }
      } catch (error) {
        console.error("Erreur chargement session:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [sessionId, isDemoSession, activeRoleFilter]);

  const mentionToken = useMemo(() => {
    const match = newMessage.match(/(?:^|\s)@([\wÀ-ÿ.-]{1,50})$/);
    return match?.[1] || "";
  }, [newMessage]);

  useEffect(() => {
    if (!sessionId || isDemoSession || !mentionToken) {
      setMentionSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsMentionsLoading(true);
        const response = await getMentionSuggestions(sessionId, {
          q: mentionToken,
          role: mentionToken.toLowerCase().startsWith("mod")
            ? "moderateur"
            : undefined,
          limit: 6,
        });
        if (response?.success) {
          setMentionSuggestions(response.suggestions || []);
          setSelectedMentionIndex(0);
        }
      } catch (error) {
        console.error("Erreur suggestions mentions:", error);
      } finally {
        setIsMentionsLoading(false);
      }
    }, 180);

    return () => clearTimeout(timeout);
  }, [sessionId, isDemoSession, mentionToken]);

  const handleLoadMoreMessages = async () => {
    if (!sessionId || isDemoSession || isLoadingMore || !chatPagination.hasMore)
      return;
    try {
      setIsLoadingMore(true);
      const response = await getSessionMessages(sessionId, {
        limit: 40,
        before: chatPagination.nextCursor,
      });
      if (response?.success) {
        const olderMessages = response.messages || [];
        setMessages((prev) => [...olderMessages, ...prev]);
        setChatPagination({
          hasMore: Boolean(response.pagination?.hasMore),
          nextCursor: response.pagination?.nextCursor || null,
        });
      }
    } catch (error) {
      console.error("Erreur pagination chat:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const applyMentionSuggestion = (suggestion) => {
    if (!suggestion) return;
    setNewMessage((prev) =>
      prev.replace(
        /@([\wÀ-ÿ.-]{1,50})$/,
        `@${suggestion.prenom || suggestion.nom} `,
      ),
    );
    setMentionSuggestions([]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !sessionId) return;
    if (isDemoSession) {
      setMessages((prev) => [
        ...prev,
        {
          _id: `demo-${Date.now()}`,
          user_id: CURRENT_USER.id,
          user_info: {
            nom: CURRENT_USER.nom,
            prenom: CURRENT_USER.prenom,
            avatar_url: CURRENT_USER.avatar_url,
          },
          type: "text",
          contenu: newMessage.trim(),
          createdAt: new Date().toISOString(),
        },
      ]);
    } else {
      sessionSocketService.sendMessage(
        sessionId,
        CURRENT_USER,
        newMessage.trim(),
      );
    }
    setNewMessage("");
    setMentionSuggestions([]);
    if (!isDemoSession) {
      sessionSocketService.typingStop(sessionId, CURRENT_USER);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !sessionId || isDemoSession) return;

    try {
      setPendingUploadName(file.name);
      const response = await uploadChatFile(sessionId, file);
      if (response?.success && response.file) {
        sessionSocketService.sendMessage(sessionId, CURRENT_USER, "", {
          type: "file",
          file_url: response.file.url,
          file_meta: {
            name: response.file.name,
            mime: response.file.mime,
            size: response.file.size,
            extension: response.file.extension,
            storage: response.file.storage,
          },
        });
      }
    } catch (error) {
      console.error("Erreur upload fichier:", error);
    } finally {
      setPendingUploadName("");
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleTyping = (event) => {
    setNewMessage(event.target.value);
    if (!sessionId || isDemoSession) return;

    sessionSocketService.typingStart(sessionId, CURRENT_USER);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sessionSocketService.typingStop(sessionId, CURRENT_USER);
    }, 1500);
  };

  const refreshNotifications = async () => {
    try {
      const [listResponse, unreadResponse] = await Promise.all([
        getNotifications({ limit: 20 }),
        getNotificationUnreadCount(),
      ]);
      if (listResponse?.success) {
        setNotifications((listResponse.notifications || []).slice(0, 30));
      }
      if (unreadResponse?.success) {
        setNotificationUnreadCount(unreadResponse.unreadCount || 0);
      }
    } catch (error) {
      console.error("Erreur notifications:", error);
    }
  };

  const handleOpenNotifications = async () => {
    setNotificationsOpen((prev) => !prev);
    if (!notificationsOpen) {
      await refreshNotifications();
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, is_read: true }
            : notification,
        ),
      );
      setNotificationUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur lecture notification:", error);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true })),
      );
      setNotificationUnreadCount(0);
    } catch (error) {
      console.error("Erreur lecture globale notifications:", error);
    }
  };

  const handleWhiteboardOperation = (operation) => {
    if (!sessionId || isDemoSession || !operation?.action) return;

    if (operation.action === "clear") {
      setWhiteboardOperations([]);
      setWhiteboardStateCount(0);
    } else if (operation.action === "undo") {
      setWhiteboardOperations((prev) => prev.slice(0, -1));
      setWhiteboardStateCount((prev) => Math.max(0, prev - 1));
    } else if (operation.action === "text" && operation.data?.id) {
      if (operation.data?.remove) {
        setWhiteboardOperations((prev) =>
          prev.filter((item) => item?.data?.id !== operation.data.id),
        );
        setWhiteboardStateCount((prev) => Math.max(0, prev - 1));
      } else {
        setWhiteboardOperations((prev) => {
          const existingIndex = prev.findIndex(
            (item) => item?.data?.id === operation.data.id,
          );
          if (existingIndex >= 0) {
            const next = [...prev];
            next[existingIndex] = operation;
            return next;
          }
          return [...prev, operation];
        });
        setWhiteboardStateCount((prev) => prev + 1);
      }
    } else {
      setWhiteboardOperations((prev) => [...prev, operation]);
      setWhiteboardStateCount((prev) => prev + 1);
    }

    setWhiteboardEventsCount((prev) => prev + 1);

    sessionSocketService.whiteboardDraw(sessionId, operation);
  };

  const handleInvite = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
      }
    } catch (error) {
      console.error("Erreur copie lien:", error);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatCountdown = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const getParticipantStatusTone = (status = "") => {
    if (status.toLowerCase().includes("absent")) {
      return "bg-amber-50 text-amber-700";
    }
    if (status.toLowerCase().includes("present")) {
      return "bg-emerald-50 text-emerald-700";
    }
    return "bg-slate-100 text-slate-600";
  };

  const getInitials = (prenom = "", nom = "") => {
    const first = prenom?.charAt(0) || "";
    const last = nom?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "ME";
  };

  const dayLabel = messages.length > 0 ? formatTime(messages[0].createdAt) : "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-sky-200/40 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-100/60 blur-[120px]" />

      <div className="relative mx-auto flex h-screen max-w-350 gap-6 px-6 py-6">
        <aside className="flex w-80 flex-col rounded-3xl border border-slate-200/70 bg-white/80 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="px-4 pt-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-400">
                Astuce
              </p>
              <p className="mt-1 text-xs text-blue-700">{PRO_TIP}</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 pt-4">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Participants
              </h2>
              <p className="text-sm text-slate-500">Membres actifs</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              {activeParticipants} en ligne
            </span>
          </div>

          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 21l-4.35-4.35" />
                <circle cx="11" cy="11" r="7" />
              </svg>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Trouver un membre..."
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div className="mt-3 flex gap-2">
              {[
                { id: "all", label: "Tous" },
                { id: "moderateur", label: "MOD" },
                { id: "participant", label: "Participants" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveRoleFilter(filter.id)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    activeRoleFilter === filter.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto px-3">
            <AnimatePresence>
              {filteredParticipants.map((participant, index) => {
                const name =
                  `${participant.user_info?.prenom || ""} ${participant.user_info?.nom || ""}`.trim();
                const avatar =
                  participant.user_info?.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    name || "User",
                  )}`;
                return (
                  <MotionDiv
                    key={participant.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3"
                  >
                    <div className="relative">
                      <img
                        src={avatar}
                        alt={name}
                        className="h-11 w-11 rounded-full border border-white object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          participant.online ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {name}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getParticipantStatusTone(
                            participant.statut,
                          )}`}
                        >
                          {participant.statut || "participant"}
                        </span>
                        {participant.role === "moderateur" && (
                          <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                            MOD
                          </span>
                        )}
                      </div>
                    </div>
                  </MotionDiv>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={handleInvite}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
            >
              <span>Inviter un membre</span>
              {inviteCopied && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  Lien copié
                </span>
              )}
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-slate-200/70 bg-white/80 px-4 py-2 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-base font-semibold text-white shadow shadow-blue-200">
                E
              </div>
              <div>
                <h1 className="font-display text-base font-semibold text-slate-900 leading-tight">
                  {sessionTitle}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500">{sessionSubtitle}</p>
                  <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                    {sessionRole === "moderateur" ? "MOD" : "Participant"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsWhiteboardOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow shadow-indigo-100 transition hover:bg-indigo-500"
                title="Tableau blanc partagé"
              >
                W
              </button>
              <div className="relative">
                <button
                  onClick={handleOpenNotifications}
                  className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                    <path d="M9 17a3 3 0 0 0 6 0" />
                  </svg>
                  {notificationUnreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {notificationUnreadCount > 99
                        ? "99+"
                        : notificationUnreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-12 z-20 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">
                        Notifications
                      </p>
                      <button
                        onClick={handleMarkAllNotificationsRead}
                        className="text-xs font-semibold text-blue-600"
                      >
                        Tout lire
                      </button>
                    </div>
                    <div className="max-h-72 space-y-2 overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                          Aucune notification
                        </p>
                      )}
                      {notifications.map((notification) => (
                        <button
                          key={notification._id}
                          onClick={() =>
                            handleMarkNotificationRead(notification._id)
                          }
                          className={`w-full rounded-xl px-3 py-2 text-left transition ${
                            notification.is_read ? "bg-slate-50" : "bg-blue-50"
                          }`}
                        >
                          <p className="text-xs font-semibold text-slate-800">
                            {notification.titre}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            {notification.message}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <span
                  className={`h-2 w-2 rounded-full ${
                    activeParticipants > 0 ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
                {formatCountdown(timeLeft)}
              </span>
              <button
                onClick={onLeave}
                className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                Quitter la session
              </button>
            </div>
          </div>

          <div className="mt-2 flex-1 overflow-y-auto rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            {messages.length > 0 && (
              <div className="flex justify-center">
                <span className="rounded-full bg-slate-100 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {dayLabel}
                </span>
              </div>
            )}

            <div className="mt-6 space-y-6">
              {!isDemoSession && chatPagination.hasMore && (
                <div className="flex justify-center">
                  <button
                    onClick={handleLoadMoreMessages}
                    disabled={isLoadingMore}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:opacity-60"
                  >
                    {isLoadingMore
                      ? "Chargement..."
                      : "Charger les messages précédents"}
                  </button>
                </div>
              )}

              {isInitialLoading && (
                <div className="text-center text-xs text-slate-400">
                  Chargement du chat...
                </div>
              )}

              <AnimatePresence>
                {messages.map((message, index) => {
                  if (message.type === "system") {
                    return (
                      <motion.div
                        key={message._id || `system-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-xs text-slate-400"
                      >
                        {message.contenu || message.content}
                      </motion.div>
                    );
                  }

                  const senderId = message.user_id || message.senderId;
                  const isMe = senderId === CURRENT_USER.id;
                  const senderName = isMe
                    ? "Vous"
                    : `${message.user_info?.prenom || ""} ${message.user_info?.nom || ""}`.trim() ||
                      "Participant";
                  const senderAvatar =
                    message.user_info?.avatar_url ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      senderName || "User",
                    )}`;

                  return (
                    <motion.div
                      key={message._id || `msg-${index}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`flex items-end gap-3 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isMe && (
                        <img
                          src={senderAvatar}
                          alt={senderName}
                          className="h-9 w-9 rounded-full border border-white object-cover"
                        />
                      )}
                      <div className="max-w-[70%]">
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            isMe
                              ? "bg-blue-600 text-white"
                              : "bg-white text-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className={`text-xs font-semibold ${
                                isMe ? "text-white/80" : "text-slate-500"
                              }`}
                            >
                              {senderName}
                            </span>
                            <span
                              className={`text-xs ${
                                isMe ? "text-white/70" : "text-slate-400"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          {(message.contenu || message.content) && (
                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                              {message.contenu || message.content}
                            </p>
                          )}
                          {message.type === "file" && message.file_url && (
                            <a
                              href={message.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className={`mt-2 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold ${
                                isMe
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 text-blue-700"
                              }`}
                            >
                              📎 {message.file_meta?.name || "Fichier joint"}
                            </a>
                          )}
                          {Array.isArray(message.mentions_meta) &&
                            message.mentions_meta.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {message.mentions_meta.map((mention) => (
                                  <span
                                    key={`${message._id}-${mention.user_id}`}
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                      isMe
                                        ? "bg-white/20 text-white"
                                        : "bg-violet-100 text-violet-700"
                                    }`}
                                  >
                                    @{mention.prenom || mention.nom}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                      {isMe && (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                          {getInitials(CURRENT_USER.prenom, CURRENT_USER.nom)}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {typingUsers.size > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                          className="h-1.5 w-1.5 rounded-full bg-slate-400"
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    Quelqu'un est en train d'écrire...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="mt-2 rounded-3xl border border-slate-200/70 bg-white/80 px-4 py-2 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelected}
              />

              <button
                onClick={handleUploadClick}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition hover:border-blue-200 hover:text-blue-600"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21.44 11.05l-8.49 8.49a5 5 0 0 1-7.07-7.07l8.49-8.49a3.5 3.5 0 0 1 4.95 4.95l-8.49 8.49a2 2 0 0 1-2.83-2.83l7.78-7.78" />
                </svg>
              </button>
              <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition hover:border-blue-200 hover:text-blue-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <path d="M9 9h.01" />
                  <path d="M15 9h.01" />
                </svg>
              </button>
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyDown={(e) => {
                    if (
                      mentionSuggestions.length > 0 &&
                      e.key === "ArrowDown"
                    ) {
                      e.preventDefault();
                      setSelectedMentionIndex((prev) =>
                        Math.min(prev + 1, mentionSuggestions.length - 1),
                      );
                      return;
                    }
                    if (mentionSuggestions.length > 0 && e.key === "ArrowUp") {
                      e.preventDefault();
                      setSelectedMentionIndex((prev) => Math.max(prev - 1, 0));
                      return;
                    }
                    if (mentionSuggestions.length > 0 && e.key === "Tab") {
                      e.preventDefault();
                      applyMentionSuggestion(
                        mentionSuggestions[selectedMentionIndex],
                      );
                      return;
                    }
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (mentionSuggestions.length > 0) {
                        applyMentionSuggestion(
                          mentionSuggestions[selectedMentionIndex],
                        );
                        return;
                      }
                      handleSendMessage();
                    }
                  }}
                  placeholder="Écris un message… (Entrée pour envoyer, @ pour mentionner)"
                  rows={1}
                  className="h-9 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {pendingUploadName && (
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    📎 {pendingUploadName}
                  </p>
                )}

                {(isMentionsLoading || mentionSuggestions.length > 0) && (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                    {isMentionsLoading && (
                      <p className="px-2 py-1 text-xs text-slate-500">
                        Recherche...
                      </p>
                    )}
                    {mentionSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.userId}
                        onClick={() => applyMentionSuggestion(suggestion)}
                        className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs ${
                          selectedMentionIndex === index
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700"
                        }`}
                      >
                        <span>{suggestion.display}</span>
                        {suggestion.role === "moderateur" && (
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                            MOD
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow shadow-blue-200 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4z" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>

      {isWhiteboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="flex w-[90vw] flex-col rounded-3xl border border-indigo-200 bg-white shadow-2xl"
            style={{ height: "calc(100vh - 3rem)" }}
          >
            <WhiteboardCanvas
              title={WHITEBOARD_CARD.title}
              metaLine={`${whiteboardStateCount} actions sauvegardées · +${whiteboardEventsCount} en live`}
              onClose={() => setIsWhiteboardOpen(false)}
              operations={whiteboardOperations}
              onOperation={handleWhiteboardOperation}
              disabled={!sessionId || isDemoSession}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
