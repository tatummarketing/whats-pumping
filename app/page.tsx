import Image from "next/image";
import PumpingBoard from "@/components/organisms/PumpingBoard";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[#e6e8ef] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <a
            href="https://tatum.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Image src="/tatum.svg" alt="Tatum" width={84} height={20} priority />
            <span className="hidden text-sm font-semibold text-[#111827] sm:inline">
              What&apos;s Pumping?
            </span>
          </a>
          <div className="flex items-center gap-2">
            <a
              href="https://docs.tatum.io/reference/gettrendingtokensv4"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-xl border border-[#dfe3ee] px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#f7f8fc] sm:inline-flex"
            >
              Read Docs
            </a>
            <a
              href="https://dashboard.tatum.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-xl bg-[#4f37fd] px-3 py-2 text-sm font-semibold text-white hover:bg-[#3f2ae6]"
            >
              Get API Key
            </a>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 md:px-6 md:py-8">
        <PumpingBoard />
      </div>

      <footer className="border-t border-[#e6e8ef] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-[#6b7280] md:flex-row md:items-center md:justify-between md:px-6">
          <p>
            Built with Tatum Data API ·{" "}
            <code className="rounded bg-[#f3f4f8] px-1.5 py-0.5 text-xs text-[#4f37fd]">
              GET /v4/data/tokens/trending
            </code>
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 font-medium">
            <a
              href="https://docs.tatum.io/reference/gettrendingtokensv4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4f37fd] hover:underline"
            >
              Trending docs
            </a>
            <a
              href="https://docs.tatum.io/docs/notifications"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4f37fd] hover:underline"
            >
              Notifications
            </a>
            <a
              href="https://dashboard.tatum.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4f37fd] hover:underline"
            >
              Dashboard
            </a>
            <a
              href="https://github.com/tatumio/example-apps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4f37fd] hover:underline"
            >
              Example apps
            </a>
            <a
              href="https://status.tatum.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4f37fd] hover:underline"
            >
              Status
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
