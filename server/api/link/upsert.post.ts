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
