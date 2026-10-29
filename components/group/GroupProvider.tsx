"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getGrade, getTopic } from "@/lib/curriculum";
import { HEARTBEAT_MS, type Activity, type Invite, type PresenceView } from "@/lib/groups";
import type { T } from "@/lib/i18n";
import { useApp } from "../AppProvider";
import { Mascot } from "../Mascot";
import { DuelApiError, saveToken } from "../duel/api";
import {
  type AdminSession,
  type GroupSession,
  activityFromPath,
  groupApi,
  saveAdmin,
  saveGroup,
  storedAdmin,
  storedGroup,
} from "./api";

/**
 * Keeps this device "online" in its group while the app is open and visible,
 * and shows incoming challenges on any screen.
 */

type GroupState = {
  session: GroupSession | null;
  admin: AdminSession | null;
  online: PresenceView[];
  available: boolean;
  setAvailable: (v: boolean) => void;
  join: (code: string, name: string, grade: number) => Promise<void>;
  create: (name: string) => Promise<AdminSession>;
  leave: () => Promise<void>;
  forgetAdmin: () => void;
  /** Sends a challenge and opens the waiting room. */
  challenge: (target: PresenceView, grade: number, duration: number) => Promise<void>;
  /** Set when the server forgets this child (removed by the admin). */
  removed: boolean;
};

const GroupContext = createContext<GroupState | null>(null);

export function useGroup(): GroupState {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error("useGroup outside GroupProvider");
  return ctx;
}

export function activityText(a: Activity): T {
  switch (a.kind) {
    case "topic": {
      const topic = getTopic(a.grade, a.topicId);
      return topic
        ? { lv: `Mācās: ${topic.title.lv}`, ru: `Учит: ${topic.title.ru}` }
        : { lv: `Pēta ${a.grade}. klasi`, ru: `Изучает ${a.grade} класс` };
    }
    case "grade":
      return { lv: `Pēta ${a.grade}. klasi`, ru: `Изучает ${a.grade} класс` };
    case "chat":
      return { lv: "Sarunājas ar palīgu", ru: "Общается с помощником" };
    case "lobby":
      return { lv: "Gatavs sacensībām", ru: "Готов к соревнованию" };
    case "duel":
      return { lv: "Sacensībās", ru: "Соревнуется" };
    default:
      return { lv: "Sākumlapā", ru: "На главной" };
  }
}

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<GroupSession | null>(null);
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [online, setOnline] = useState<PresenceView[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [available, setAvailableState] = useState(true);
  const [removed, setRemoved] = useState(false);
  const pathRef = useRef(path);
  pathRef.current = path;
  const availableRef = useRef(available);
  availableRef.current = available;

  useEffect(() => {
    setSession(storedGroup());
    setAdmin(storedAdmin());
    try {
      setAvailableState(localStorage.getItem("ciparini.available") !== "false");
    } catch {
      /* ignore */
    }
  }, []);

  const beat = useCallback(async (s: GroupSession) => {
    try {
      const r = await groupApi.heartbeat(s, activityFromPath(pathRef.current), availableRef.current);
      setOnline(r.online);
      setInvites(r.invites);
    } catch (e) {
      if (e instanceof DuelApiError && (e.message === "forbidden" || e.message === "not_found")) {
        saveGroup(null);
        setSession(null);
        setOnline([]);
        setInvites([]);
        setRemoved(true);
      }
    }
  }, []);

  // Heartbeat while the app is visible; a hidden tab simply goes offline.
  useEffect(() => {
    if (!session) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (timer) return;
      void beat(session);
      timer = setInterval(() => void beat(session), HEARTBEAT_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [session, beat]);

  // Report a new screen right away, so friends see it without waiting for the next beat.
  useEffect(() => {
    if (session && document.visibilityState === "visible") void beat(session);
  }, [path, available, session, beat]);

  const setAvailable = useCallback((v: boolean) => {
    setAvailableState(v);
    try {
      localStorage.setItem("ciparini.available", String(v));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<GroupState>(
    () => ({
      session,
      admin,
      online,
      available,
      setAvailable,
      removed,
      join: async (code, name, grade) => {
        const r = await groupApi.join(code, name, grade);
        const s: GroupSession = { code: r.code, groupName: r.groupName, memberId: r.memberId, token: r.token, name, grade };
        saveGroup(s);
        setRemoved(false);
        setSession(s);
      },
      create: async (name) => {
        const r = await groupApi.create(name);
        const a: AdminSession = { code: r.code, name: r.name, adminToken: r.adminToken };
        saveAdmin(a);
        setAdmin(a);
        return a;
      },
      leave: async () => {
        if (session) await groupApi.leave(session).catch(() => undefined);
        saveGroup(null);
        setSession(null);
        setOnline([]);
        setInvites([]);
      },
      forgetAdmin: () => {
        saveAdmin(null);
        setAdmin(null);
      },
      challenge: async (target, grade, duration) => {
        if (!session) return;
        const r = await groupApi.challenge(session, target.id, grade, duration);
        saveToken(r.duelCode, r.duelToken);
        try {
          sessionStorage.setItem(`ciparini.duel.${r.duelCode}.invitee`, target.name);
        } catch {
          /* ignore */
        }
        router.push(`/sacensibas/${r.duelCode}`);
      },
    }),
    [session, admin, online, available, setAvailable, removed, router],
  );

  return (
    <GroupContext.Provider value={value}>
      {children}
      {session && invites[0] && (
        <InviteToast
          key={invites[0].id}
          invite={invites[0]}
          onAnswer={async (accept) => {
            const inv = invites[0];
            setInvites((list) => list.filter((i) => i.id !== inv.id));
            try {
              const r = await groupApi.respond(session, inv.id, accept);
              if (accept && r.duelToken) {
                saveToken(r.duelCode, r.duelToken);
                router.push(`/sacensibas/${r.duelCode}`);
              }
            } catch {
              /* the invitation expired meanwhile */
            }
          }}
        />
      )}
    </GroupContext.Provider>
  );
}

function InviteToast({ invite, onAnswer }: { invite: Invite; onAnswer: (accept: boolean) => void }) {
  const { t } = useApp();
  const [busy, setBusy] = useState(false);
  const answer = (accept: boolean) => {
    if (busy) return;
    setBusy(true);
    onAnswer(accept);
  };
  return (
    <div className="invite-toast" role="alertdialog" aria-live="assertive" aria-labelledby={`invite-${invite.id}`}>
      <Mascot size={48} grade={invite.fromGrade} color={getGrade(invite.fromGrade)?.color} mood="cheer" />
      <div className="invite-text">
        <strong id={`invite-${invite.id}`}>
          {t({ lv: `${invite.fromName} tevi izaicina!`, ru: `${invite.fromName} вызывает тебя!` })}
        </strong>
        <small>
          {t({
            lv: `${invite.grade}. klase · ${invite.duration / 60} min`,
            ru: `${invite.grade} класс · ${invite.duration / 60} мин`,
          })}
        </small>
      </div>
      <div className="invite-actions">
        <button type="button" className="btn ghost small" onClick={() => answer(false)} disabled={busy}>
          {t({ lv: "Ne tagad", ru: "Не сейчас" })}
        </button>
        <button type="button" className="btn primary small" onClick={() => answer(true)} disabled={busy}>
          {t({ lv: "Pieņemt", ru: "Принять" })}
        </button>
      </div>
    </div>
  );
}
