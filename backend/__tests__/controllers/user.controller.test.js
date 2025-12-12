import { jest, describe, test, expect, beforeEach } from "@jest/globals";

let UserModelMock;
let bcryptMock;
let jwtMock;
let verifyIdTokenMock;

jest.unstable_mockModule("../../src/models/user.model.js", () => {
  UserModelMock = {
    getUserByEmail: jest.fn(),
    getUserByUsername: jest.fn(),
    createUser: jest.fn(),
    createGoogleUser: jest.fn(),
    updateTokens: jest.fn(),
    clearTokens: jest.fn(),
  };
  return { UserModel: UserModelMock };
});

jest.unstable_mockModule("bcrypt", () => {
  bcryptMock = {
    hash: jest.fn(),
    compare: jest.fn(),
  };
  return { default: bcryptMock };
});

jest.unstable_mockModule("jsonwebtoken", () => {
  jwtMock = {
    sign: jest.fn(),
    verify: jest.fn(),
  };
  return { default: jwtMock };
});

jest.unstable_mockModule("google-auth-library", () => {
  verifyIdTokenMock = jest.fn();

  class OAuth2Client {
    constructor() {}
    verifyIdToken(...args) {
      return verifyIdTokenMock(...args);
    }
  }

  return { OAuth2Client };
});

const { ApiError } = await import("../../src/utils/ApiError.js");
const userController = await import("../../src/controllers/user.controller.js");

function makeRes() {
  const res = {
    status: jest.fn(() => res),
    cookie: jest.fn(() => res),
    clearCookie: jest.fn(() => res),
    json: jest.fn(() => res),
  };
  return res;
}

describe("Controller: user.controller.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "unit_test_secret";
  });

  test("generateTokens -> returns accessToken + refreshToken", () => {
    jwtMock.sign.mockReturnValueOnce("access").mockReturnValueOnce("refresh");

    const tokens = userController.generateTokens({ id: 1, email: "a@b.com" });

    expect(tokens).toEqual({ accessToken: "access", refreshToken: "refresh" });
    expect(jwtMock.sign).toHaveBeenCalledTimes(2);
  });

  test("generateTokens -> throws ApiError(500) if jwt.sign fails", () => {
    jwtMock.sign.mockImplementation(() => {
      throw new Error("sign failed");
    });

    expect(() => userController.generateTokens({ id: 1, email: "a@b.com" })).toThrow(ApiError);
    try {
      userController.generateTokens({ id: 1, email: "a@b.com" });
    } catch (e) {
      expect(e.statusCode).toBe(500);
    }
  });

  test("registerUser -> 400 when any field blank", async () => {
    const req = { body: { username: "", email: "", password: "" } };
    const res = makeRes();

    await expect(userController.registerUser(req, res)).rejects.toBeInstanceOf(ApiError);
  });

  test("registerUser -> 409 when username already exists", async () => {
    UserModelMock.getUserByEmail.mockResolvedValue(null);
    UserModelMock.getUserByUsername.mockResolvedValue({ id: 2 });

    const req = { body: { username: "taken", email: "x@y.com", password: "p" } };
    const res = makeRes();

    await expect(userController.registerUser(req, res)).rejects.toMatchObject({ statusCode: 409 });
  });

  test("registerUser -> 200 and sets cookies on success", async () => {
    UserModelMock.getUserByEmail.mockResolvedValue(null);
    UserModelMock.getUserByUsername.mockResolvedValue(null);
    bcryptMock.hash.mockResolvedValue("hash");

    UserModelMock.createUser.mockResolvedValue({ id: 10, email: "x@y.com" });
    jwtMock.sign.mockReturnValueOnce("access").mockReturnValueOnce("refresh");
    UserModelMock.updateTokens.mockResolvedValue({});

    const req = { body: { username: "u", email: "x@y.com", password: "p" } };
    const res = makeRes();

    await userController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("loginUser -> 401 when user not found", async () => {
    UserModelMock.getUserByEmail.mockResolvedValue(null);

    const req = { body: { email: "x@y.com", password: "p" } };
    const res = makeRes();

    await expect(userController.loginUser(req, res)).rejects.toMatchObject({ statusCode: 401 });
  });

  test("loginUser -> 401 when provider not local", async () => {
    UserModelMock.getUserByEmail.mockResolvedValue({ id: 1, email: "x@y.com", provider: "google" });

    const req = { body: { email: "x@y.com", password: "p" } };
    const res = makeRes();

    await expect(userController.loginUser(req, res)).rejects.toMatchObject({ statusCode: 401 });
  });

  test("loginUser -> 401 when password invalid", async () => {
    UserModelMock.getUserByEmail.mockResolvedValue({
      id: 1,
      email: "x@y.com",
      provider: "local",
      password_hash: "hash",
    });

    bcryptMock.compare.mockResolvedValue(false);

    const req = { body: { email: "x@y.com", password: "wrong" } };
    const res = makeRes();

    await expect(userController.loginUser(req, res)).rejects.toMatchObject({ statusCode: 401 });
  });

  test("loginUser -> 200 on success", async () => {
    UserModelMock.getUserByEmail.mockResolvedValue({
      id: 1,
      email: "x@y.com",
      provider: "local",
      password_hash: "hash",
    });

    bcryptMock.compare.mockResolvedValue(true);
    jwtMock.sign.mockReturnValueOnce("access").mockReturnValueOnce("refresh");
    UserModelMock.updateTokens.mockResolvedValue({});

    const req = { body: { email: "x@y.com", password: "ok" } };
    const res = makeRes();

    await userController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("loginUserWithGoogle -> 401 when provider invalid", async () => {
    const req = { body: { provider: "github", idToken: "x" } };
    const res = makeRes();

    await expect(userController.loginUserWithGoogle(req, res)).rejects.toMatchObject({ statusCode: 401 });
  });

  test("loginUserWithGoogle -> 401 when verifyIdToken throws", async () => {
    verifyIdTokenMock.mockRejectedValue(new Error("bad"));

    const req = { body: { provider: "google", idToken: "bad" } };
    const res = makeRes();

    await expect(userController.loginUserWithGoogle(req, res)).rejects.toMatchObject({ statusCode: 401 });
  });

  test("loginUserWithGoogle -> 201 when new user", async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => ({ sub: "gid", email: "g@e.com", name: "Google User" }),
    });

    UserModelMock.getUserByEmail.mockResolvedValue(null);
    UserModelMock.createGoogleUser.mockResolvedValue({ id: 12, email: "g@e.com", provider: "google" });
    jwtMock.sign.mockReturnValueOnce("access").mockReturnValueOnce("refresh");
    UserModelMock.updateTokens.mockResolvedValue({});

    const req = { body: { provider: "google", idToken: "ok" } };
    const res = makeRes();

    await userController.loginUserWithGoogle(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
