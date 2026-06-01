import { LinkSchema } from '#shared/schemas/link'

defineRouteMeta({
  openAPI: {
    description: 'Create or update a short link (upsert)',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['url'],
            properties: {
              url: { type: 'string', description: 'The target URL' },
              slug: { type: 'string', description: 'Custom slug (auto-generated if not provided)' },
              comment: { type: 'string', description: 'Optional comment' },
              expiration: { type: 'integer', description: 'Expiration timestamp (unix seconds)' },
              title: { type: 'string', description: 'Custom title for link preview' },
              description: { type: 'string', description: 'Custom description for link preview' },
              image: { type: 'string', description: 'Custom image for link preview' },
              apple: { type: 'string', description: 'Apple App Store redirect URL' },
              google: { type: 'string', description: 'Google Play Store redirect URL' },
              unsafe: { type: 'boolean', description: 'Mark link as unsafe, showing a warning page before redirect' },
              geo: { type: 'object', additionalProperties: { type: 'string' }, description: 'Geo-routing rules (country code to URL)' },
            },
          },
        },
      },
    },
  },
})

export default eventHandler(async (event) => {
  const link = await readValidatedBody(event, LinkSchema.parse)
  await prepareIncomingLink(event, link)

  // 1. First check if a link with this destination URL already exists (any slug)
  const existingByUrl = await getLinkByUrl(event, link.url)
  if (existingByUrl) {
    return {
      status: 'existing',
      link: buildLinkResponse(event, existingByUrl),
    }
  }

  // 2. Otherwise, check if slug already exists 
  const existingBySlug = await getLink(event, link.slug)
  if (existingBySlug) {
    return {
      status: 'existing',
      link: buildLinkResponse(event, existingBySlug),
    }
  }

  // 3. Create new link
  await hashLinkPasswordForCreate(link)
  await putLink(event, link)
  return {
    status: 'created',
    link: buildLinkResponse(event, link),
  }
})
