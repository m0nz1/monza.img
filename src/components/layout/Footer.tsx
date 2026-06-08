import { Flame, Github, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t-3 border-brand-black dark:border-white bg-brand-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-yellow border-3 border-white flex items-center justify-center">
              <Flame size={16} className="text-brand-black" />
            </div>
            <span className="font-display text-lg text-brand-yellow">
              FF GIVEAWAY
            </span>
          </div>

          <p className="font-mono text-xs text-zinc-400 text-center">
            © {new Date().getFullYear()} FF Giveaway — Bukan afiliasi resmi
            Garena Free Fire
          </p>

          <div className="flex items-center gap-3">
            {[
              { Icon: Github, href: "#", label: "GitHub" },
              { Icon: Twitter, href: "#", label: "Twitter" },
              { Icon: Instagram, href: "#", label: "Instagram" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 border-2 border-zinc-600 hover:border-white flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
