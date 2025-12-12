import { jest, describe, test, expect, beforeEach } from "@jest/globals";

let jwtMock;
let UserModelMock;

jest.unstable_mockModule("jsonwebtoken", () => {
  jwtMock = {
    verify: jest.fn(),
  };
  return { default: jwtMock };
});

jest.unstable_mockModule("../../src/models/user.model.js", () => {
  UserModelMock = {
    getUserByEmail: jest.fn(),
  };
  return { UserModel: UserModelMock };
});

const { ApiError } = await import("../../src/utils/ApiError.js");
const { verifyJWT } = await import("../../src/middlewares/auth.middleware.js");

describe("Middleware: verifyJWT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "unit_test_secret";
  });

  test("throws 401 when token missing", async () => {
    const req = { cookies: {}, header: () => null };
    const res = {};
    const next = jest.fn();

    await expect(verifyJWT(req, res, next)).rejects.toBeInstanceOf(ApiError);
  });

  test("throws 401 when jwt.verify throws (invalid/expired)", async () => {
    jwtMock.verify.mockImplementation(() => {
      throw new Error("jwt expired");
    });

    const req = {
      cookies: {},
      header: () => "Bearer bad",
    };

    const res = {};
    const next = jest.fn();

    await expect(verifyJWT(req, res, next)).rejects.toBeInstanceOf(ApiError);
  });

  test("throws 401 when token valid but user not found", async () => {
    jwtMock.verify.mockReturnValue({ email: "x@y.com" });
    UserModelMock.getUserByEmail.mockResolvedValue(null);

    const req = {
      cookies: {},
      header: () => "Bearer good",
    };

    const res = {};
    const next = jest.fn();

    await expect(verifyJWT(req, res, next)).rejects.toBeInstanceOf(ApiError);
  });

  test("sets req.user and calls next on success", async () => {
    jwtMock.verify.mockReturnValue({ email: "x@y.com" });
    UserModelMock.getUserByEmail.mockResolvedValue({ id: 1, email: "x@y.com" });

    const req = {
      cookies: {},
      header: () => "Bearer good",
    };

    const res = {};
    const next = jest.fn();

    await verifyJWT(req, res, next);

    expect(req.user).toEqual({ id: 1, email: "x@y.com" });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
