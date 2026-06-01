export default defineAppConfig({
  title: 'Sink',
  github: 'https://github.com/',
  coffee: 'https://en.wikipedia.org/wiki/Coffee',
  twitter: 'https://x.com/',
  telegram: 'https://t.me/',
  description: 'A Simple / Speedy / Secure Link Shortener with Analytics, 100% run on Cloudflare.',
  image: 'https://raw.githubusercontent.com/braboobssiere/Sink/refs/heads/master/public/banner.png',
  previewTTL: 300, // 5 minutes
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
