import Footer from "./Footer";
import LatestNews from "./LatestNews";
import { listBlogPostSummaries } from "../lib/blog";
import WerewolfGame from "./WerewolfGame";

type Props = {
  id: number;
  gameData: unknown;
};

export default async function GamePageShell({ id, gameData }: Props) {
  const posts = await listBlogPostSummaries();
  const latestPosts = posts.slice(0, 5);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--paper)",
        color: "#e8e8e8",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        .card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .card:hover:not(.revealed) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .btn { border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 100; }
        .modal { background: linear-gradient(145deg, #1e1e2f, #252538); border-radius: 16px; padding: 20px; max-width: 360px; width: 100%; border: 1px solid rgba(255,255,255,0.1); }
        .clue-text { font-size: 0.65rem; color: #d1d5db; margin-top: 6px; line-height: 1.3; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px; }
      `}</style>

      <WerewolfGame id={id} gameData={gameData} />

      <LatestNews posts={latestPosts} />

      <Footer className="game-footer" navClassName="game-footer-nav" linkClassName="footer-link" />
    </div>
  );
}
