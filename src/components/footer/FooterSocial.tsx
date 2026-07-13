interface SocialLink {
  href: string;
  icon: string;
  alt: string;
  label: string;
  rel?: string;
}

interface FooterSocialProps {
  links: SocialLink[];
}

export function FooterSocial({ links }: FooterSocialProps) {
  return (
    <div className="flex items-center gap-4">
      {links.map(({ href, icon, alt, label, rel }) => (
        <a
          key={label}
          href={href || "#"}
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full border border-black/8 bg-white transition-colors hover:bg-black/4 ${!href ? "opacity-50 pointer-events-none" : ""}`}
          aria-label={label}
          target="_blank"
          rel={rel || "noopener noreferrer"}
        >
          <img
            src={icon}
            alt={alt}
            width="20"
            height="20"
            className="w-5 h-5"
            loading="lazy"
            decoding="async"
          />
        </a>
      ))}
    </div>
  );
}
