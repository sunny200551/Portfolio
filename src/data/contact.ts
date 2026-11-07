import { SOCIAL_LINKS } from './socials';

export const CONTACT_INFO = {
  email: SOCIAL_LINKS.email.handle,
  name: 'Sunny Pasumarthi',
  location: 'Nellore, Andhra Pradesh, India',
  country: 'India',
  social: {
    linkedin: {
      name: 'LINKEDIN',
      handle: SOCIAL_LINKS.linkedin.handle,
      url: SOCIAL_LINKS.linkedin.url,
    },
    github: {
      name: 'GITHUB',
      handle: SOCIAL_LINKS.github.handle,
      url: SOCIAL_LINKS.github.url,
    },
    instagram: {
      name: 'INSTAGRAM',
      handle: SOCIAL_LINKS.instagram.handle,
      url: SOCIAL_LINKS.instagram.url,
    },
    youtube: {
      name: 'YOUTUBE',
      handle: SOCIAL_LINKS.youtube.handle,
      url: SOCIAL_LINKS.youtube.url,
    },
  },
} as const;

export default CONTACT_INFO;
