const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/index");
const User = require("../src/models/User");

describe("User Account Management", () => {
  const testUser = {
    name: "AccountTest",
    surname: "User",
    username: "acc_test_" + Date.now(),
    date_of_birth: "1990-01-01",
    password: "password123",
  };

  let authToken;
  let testUserOtherUsername;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    // Register and login to get token
    await request(app).post("/api/auth/register").send(testUser);
    const loginRes = await request(app).post("/api/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });
    authToken = loginRes.body.token;

    // Create another user to test username collision
    const otherUser = {
      name: "Other",
      surname: "User",
      username: "otheruser_" + Date.now(),
      date_of_birth: "1990-01-01",
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(otherUser);
    testUserOtherUsername = otherUser.username;
  });

  afterAll(async () => {
    try {
      await User.deleteOne({ username: testUser.username });
      await User.deleteOne({ username: "new_username" });
      await User.deleteOne({ username: testUserOtherUsername });
    } finally {
      await mongoose.connection.close();
    }
  });

  test("GET /api/user/basicInfo - should fail with invalid token", async () => {
    const response = await request(app)
      .get("/api/user/basicInfo")
      .set("Authorization", "Bearer invalidtoken");
    expect(response.status).toBe(401);
  });

  test("PUT /api/user/basicInfo - should update user details", async () => {
    const updatedData = {
      name: "NewName",
      surname: "NewSurname",
      username: "new_username"
    };
    const response = await request(app)
      .put("/api/user/basicInfo")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.user.name).toBe("NewName");
    expect(response.body.user.username).toBe("new_username");
    
    testUser.username = "new_username";
  });

  test("PUT /api/user/basicInfo - should fail if username is already taken", async () => {
    const response = await request(app)
      .put("/api/user/basicInfo")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "SomeName",
        surname: "SomeSurname",
        username: testUserOtherUsername,
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/duplicate key/i);
  });

  test("PUT /api/user/password - should fail if current password is wrong", async () => {
    const response = await request(app)
      .put("/api/user/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        curr_password: "wrongpassword",
        new_password: "NewPassword123!",
        confirm_password: "NewPassword123!",
      });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Current password is not correct. Try again");
  });

  test("PUT /api/user/password - should fail if new passwords do not match", async () => {
    const response = await request(app)
      .put("/api/user/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        curr_password: "password123",
        new_password: "NewPassword123!",
        confirm_password: "MismatchedPassword!",
      });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("New password is different from confirm new password");
  });

  test("PUT /api/user/password - should update password", async () => {
    const response = await request(app)
      .put("/api/user/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        curr_password: "password123",
        new_password: "newPassword123!",
        confirm_password: "newPassword123!"
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    testUser.password = "newPassword123!";
  });

  test("DELETE /api/user/account - should fail with invalid token", async () => {
    const response = await request(app)
      .delete("/api/user/account")
      .set("Authorization", "Bearer invalidtoken")
      .send({ password: testUser.password });
    expect(response.status).toBe(401);
  });

  test("DELETE /api/user/account - should fail with wrong password", async () => {
    const response = await request(app)
      .delete("/api/user/account")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ password: "wrongpassword" });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("The password is not correct");
  });

  test("DELETE /api/user/account - should delete account", async () => {
    const response = await request(app)
      .delete("/api/user/account")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ password: testUser.password });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Account deleted successfully");

    const user = await User.findOne({ username: testUser.username });
    expect(user).toBeNull();
  });
});
