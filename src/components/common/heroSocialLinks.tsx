import type { SocialSettings } from "@/services/settings";
import type { SocialLink } from "@/components/common/VideoHeroSection";
import FacebookIcon from "@/assets/social-facebook";
import LinkedInIcon from "@/assets/social-linkedin";
import socialInstagram from "@/assets/products/social-instagram.svg";
import twitterIcon from "@/assets/footer/twitter-icon.svg";

export function buildHeroSocialLinks(
  social: SocialSettings | null,
): SocialLink[] {
  const links: Array<SocialLink | null> = [
    social?.x
      ? {
          href: social.x,
          icon: (
            <img
              src={twitterIcon}
              width="24"
              height="24"
              className="w-6 h-6"
              alt=""
            />
          ),
          label: "X (Twitter)",
        }
      : null,
    social?.facebook
      ? {
          href: social.facebook,
          icon: <FacebookIcon />,
          label: "Facebook",
        }
      : null,
    social?.instagram
      ? {
          href: social.instagram,
          icon: (
            <img
              src={socialInstagram}
              width="24"
              height="24"
              className="w-6 h-6"
              alt=""
            />
          ),
          label: "Instagram",
        }
      : null,
    social?.linkedin
      ? {
          href: social.linkedin,
          icon: <LinkedInIcon />,
          label: "LinkedIn",
        }
      : null,
  ];

  return links.filter((link): link is SocialLink => link !== null);
}
