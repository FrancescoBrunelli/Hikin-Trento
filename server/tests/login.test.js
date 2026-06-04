const request = require("supertest");
const app = require("../src/index");

// tests/login.test.js

describe("POST /api/auth/login", () => {
  test("should login successfully", async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "giulia_rossi",
      password: "giulia_rossi!",
    });

    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
