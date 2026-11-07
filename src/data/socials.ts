export interface SocialLink {
  id: string;
  name: string;
  handle: string;
  url: string;
  ariaLabel: string;
  isExternal: boolean;
}

export const SOCIAL_LINKS = {
  github: {
    id: 'github',
    name: 'GitHub',
    handle: 'sunny200551',
    url: 'https://github.com/sunny200551',
    ariaLabel: 'Visit Sunny Pasumarthi GitHub profile',
    isExternal: true,
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'sunny-pasumarthi',
    url: 'https://www.linkedin.com/in/sunny-pasumarthi-357615333/',
    ariaLabel: 'Connect with Sunny Pasumarthi on LinkedIn',
    isExternal: true,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    handle: 'sunny_pasumarthi',
    url: 'https://instagram.com/sunny_pasumarthi',
    ariaLabel: 'Follow Sunny Pasumarthi on Instagram',
    isExternal: true,
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    handle: '@sunny-pasumarthi-21',
    channelId: 'UCDWRiLe6mzIiaI14NjTbm_g',
    url: 'https://www.youtube.com/@sunny-pasumarthi-21',
    ariaLabel: 'Subscribe to Sunny Pasumarthi YouTube channel',
    isExternal: true,
  },
  email: {
    id: 'email',
    name: 'Email',
    handle: 'sunnypasumarthi9@gmail.com',
    url: 'mailto:sunnypasumarthi9@gmail.com',
    ariaLabel: 'Send an email to Sunny Pasumarthi',
    isExternal: false,
  },
} as const;

export const SOCIAL_LIST = [
  SOCIAL_LINKS.github,
  SOCIAL_LINKS.linkedin,
  SOCIAL_LINKS.instagram,
  SOCIAL_LINKS.youtube,
] as const;

export default SOCIAL_LINKS;

