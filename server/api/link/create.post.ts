export default eventHandler(async (event) => {
  const link = await readValidatedBody(event, LinkSchema.parse)
  await prepareIncomingLink(event, link)

  // 1. Check for slug conflict 
  const existingLinkBySlug = await getLink(event, link.slug)
  if (existingLinkBySlug) {
    throw createError({ status: 409, statusText: 'Link already exists' })
  }

  // 2. Check for duplicate destination URL
  const existingLinkByUrl = await getLinkByUrl(event, link.url)
  if (existingLinkByUrl) {
    // Return the existing short link instead of creating a duplicate
    setResponseStatus(event, 200) 
    return buildLinkResponse(event, existingLinkByUrl)
  }

  await hashLinkPasswordForCreate(link)
  await putLink(event, link)
  setResponseStatus(event, 201)
  return buildLinkResponse(event, link)
})
