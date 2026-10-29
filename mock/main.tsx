import { createRoot } from "react-dom/client";
import NotFound from "@/app/not-found";
import { AppProvider } from "@/components/AppProvider";
import { GroupProvider } from "@/components/group/GroupProvider";
import { ChatView } from "@/components/ChatView";
import { GradeView } from "@/components/GradeView";
import { HomeView } from "@/components/HomeView";
import { TopicView } from "@/components/TopicView";
import { DuelHome } from "@/components/duel/DuelHome";
import { DuelRoom } from "@/components/duel/DuelRoom";
import { cleanCode } from "@/lib/duel";
import { getGrade, getTopic } from "@/lib/curriculum";
import { installChatBridge } from "./chat-bridge";
import { installDuelBridge } from "./duel-bridge";
import { RouterProvider, parseHref } from "./router";

/**
 * Clickable mock: the real app components, rendered as a single page with an
 * in-memory router instead of the Next.js server. Built by mock/build.mjs.
 */
installChatBridge();
installDuelBridge();

const scroller = document.getElementById("app-scroll")!;
let navigateTo: ((href: string) => void) | null = null;

function route(location: ReturnType<typeof parseHref>) {
  const { path, href } = location;
  if (path === "/") return <HomeView key="home" />;
  if (path === "/chat") return <ChatView key={href} />;
  if (path === "/sacensibas") return <DuelHome key={href} />;
  const duel = path.match(/^\/sacensibas\/(\d{6})$/);
  if (duel && cleanCode(duel[1])) return <DuelRoom key={href} code={duel[1]} />;
  const topic = path.match(/^\/klase\/(\d)\/([a-z0-9-]+)$/);
  if (topic && getTopic(Number(topic[1]), topic[2])) {
    return <TopicView key={href} grade={Number(topic[1])} topicId={topic[2]} />;
  }
  const grade = path.match(/^\/klase\/(\d)$/);
  if (grade && getGrade(Number(grade[1]))) return <GradeView key={href} grade={Number(grade[1])} />;
  return <NotFound />;
}

const onNavigate = (location: ReturnType<typeof parseHref>) => {
  scroller.scrollTo(0, 0);
  document.dispatchEvent(new CustomEvent("ciparini:navigate", { detail: location.path }));
};

createRoot(document.getElementById("app")!).render(
  <AppProvider>
    <RouterProvider onNavigate={onNavigate}>
      {(location, navigate) => {
        navigateTo = navigate;
        return <GroupProvider>{route(location)}</GroupProvider>;
      }}
    </RouterProvider>
  </AppProvider>,
);

/** Lets the presentation shell around the device jump to a screen. */
(window as unknown as { ciparini: { navigate: (href: string) => void } }).ciparini = {
  navigate: (href) => navigateTo?.(href),
};
