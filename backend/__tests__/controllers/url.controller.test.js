import { jest, describe, test, expect, beforeEach } from "@jest/globals"

let UrlModelMock
let generateShortCodeMock
let fetchMetadataMock

jest.unstable_mockModule("../../src/models/url.model.js", () => {
  UrlModelMock = {
    getUrlByShortCode: jest.fn(),
    createUrl: jest.fn(),
    getUrlsByUser: jest.fn(),
    getUrlById: jest.fn(),
    deleteUrl: jest.fn(),
  }
  return { UrlModel: UrlModelMock }
})

jest.unstable_mockModule("../../src/utils/shortCodeGenerator.js", () => {
  generateShortCodeMock = jest.fn()
  return { generateShortCode: (...args) => generateShortCodeMock(...args) }
})

jest.unstable_mockModule("../../src/utils/fetchMeta.js", () => {
  fetchMetadataMock = jest.fn()
  return { fetchMetadata: (...args) => fetchMetadataMock(...args) }
})

const { ApiError } = await import("../../src/utils/ApiError.js")
const urlController = await import("../../src/controllers/url.controller.js")

function makeRes() {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(() => res),
  }
  return res
}

describe("Controller: url.controller.js", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("createUrl -> 400 when originalUrl missing", async () => {
    const req = { user: { id: 1 }, body: {} }
    const res = makeRes()

    await expect(urlController.createUrl(req, res)).rejects.toBeInstanceOf(ApiError)
  })

  test("createUrl -> 409 when customAlias already taken", async () => {
    UrlModelMock.getUrlByShortCode.mockResolvedValue({ id: 99 })

    const req = { user: { id: 1 }, body: { originalUrl: "https://x.com", customAlias: "taken" } }
    const res = makeRes()

    await expect(urlController.createUrl(req, res)).rejects.toMatchObject({ statusCode: 409 })
  })

  test("createUrl -> 403 when customAlias is 'api'", async () => {
    UrlModelMock.getUrlByShortCode.mockResolvedValue(null)

    const req = { user: { id: 1 }, body: { originalUrl: "https://x.com", customAlias: "api" } }
    const res = makeRes()

    await expect(urlController.createUrl(req, res)).rejects.toMatchObject({ statusCode: 403 })
  })

  test("createUrl -> retries short code on collision", async () => {
    generateShortCodeMock.mockReturnValueOnce("AAAAAA").mockReturnValueOnce("BBBBBB")
    UrlModelMock.getUrlByShortCode.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce(null)

    UrlModelMock.createUrl.mockResolvedValue({ id: 10, short_code: "BBBBBB", original_url: "https://x.com" })

    const req = { user: { id: 1 }, body: { originalUrl: "https://x.com" } }
    const res = makeRes()

    await urlController.createUrl(req, res)

    expect(UrlModelMock.createUrl).toHaveBeenCalledWith(1, "https://x.com", "BBBBBB", null, null, null)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  test("createUrl -> propagates DB failure (will become 500 via errorHandler in routes)", async () => {
    generateShortCodeMock.mockReturnValue("ABCDEF")
    UrlModelMock.getUrlByShortCode.mockResolvedValue(null)
    UrlModelMock.createUrl.mockRejectedValue(new Error("db down"))

    const req = { user: { id: 1 }, body: { originalUrl: "https://x.com" } }
    const res = makeRes()

    await expect(urlController.createUrl(req, res)).rejects.toThrow(/db down/)
  })

  test("getUserUrls -> 200 returns urls", async () => {
    UrlModelMock.getUrlsByUser.mockResolvedValue([{ id: 1 }, { id: 2 }])

    const req = { user: { id: 1 } }
    const res = makeRes()

    await urlController.getUserUrls(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  test("deleteUrl -> 404 when the url does not exist", async () => {
    UrlModelMock.getUrlById.mockResolvedValue(null)

    const req = { user: { id: 1 }, params: { id: "999" } }
    const res = makeRes()

    await expect(urlController.deleteUrl(req, res)).rejects.toMatchObject({ statusCode: 404 })
  })

  test("deleteUrl -> 403 when the url belongs to someone else", async () => {
    UrlModelMock.getUrlById.mockResolvedValue({ id: 999, user_id: 2 })

    const req = { user: { id: 1 }, params: { id: "999" } }
    const res = makeRes()

    await expect(urlController.deleteUrl(req, res)).rejects.toMatchObject({ statusCode: 403 })
    expect(UrlModelMock.deleteUrl).not.toHaveBeenCalled()
  })

  test("deleteUrl -> 200 and deletes when the caller owns the url", async () => {
    UrlModelMock.getUrlById.mockResolvedValue({ id: 5, user_id: 1 })
    UrlModelMock.deleteUrl.mockResolvedValue({ message: "URL 5 deleted" })

    const req = { user: { id: 1 }, params: { id: "5" } }
    const res = makeRes()

    await urlController.deleteUrl(req, res)

    expect(UrlModelMock.deleteUrl).toHaveBeenCalledWith(5)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  test("createUrl -> 400 when the destination is not a valid http(s) URL", async () => {
    const req = { user: { id: 1 }, body: { originalUrl: "not-a-url" } }
    const res = makeRes()

    await expect(urlController.createUrl(req, res)).rejects.toMatchObject({ statusCode: 400 })
  })

  test("createUrl -> persists the supplied title", async () => {
    generateShortCodeMock.mockReturnValue("ABCDEF")
    UrlModelMock.getUrlByShortCode.mockResolvedValue(null)
    UrlModelMock.createUrl.mockResolvedValue({ id: 11, short_code: "ABCDEF" })

    const req = {
      user: { id: 1 },
      body: { originalUrl: "https://x.com", title: "  My link  " },
    }
    const res = makeRes()

    await urlController.createUrl(req, res)

    expect(UrlModelMock.createUrl).toHaveBeenCalledWith(1, "https://x.com", "ABCDEF", null, null, "My link")
  })

  test("getMetafromUrl -> 200 returns title from fetchMetadata", async () => {
    fetchMetadataMock.mockResolvedValue({ title: "Hello" })

    const req = { body: { url: "https://example.com" } }
    const res = makeRes()

    await urlController.getMetafromUrl(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })
})
