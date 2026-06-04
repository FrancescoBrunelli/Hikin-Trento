const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/index");
const User = require("../src/models/User");
const Structure = require("../src/models/Structure");
const ManagedStructure = require("../src/models/ManagedStructure");

describe("Auth and Login Endpoints", () => {
  let testUser = {
    name: "Test",
    surname: "User",
    username: "testuser_" + Date.now(),
    date_of_birth: "1990-01-01",
    password: "password123",
  };

  let testStructure;
  let testManagedStructure = {
    name: "Managed Test Structure",
    name_owner: "Owner",
    surname_owner: "Surname",
    telephone: "+39 123 4567890",
    password: "structurepass",
  };

  beforeAll(async () => {
    // Ensure DB is connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Try to drop indexes on ManagedStructure to avoid E11000 from old/mismatched indexes
    try {
      await ManagedStructure.collection.dropIndexes();
    } catch (err) {
      // Ignore if collection doesn't exist or other errors
    }

    // Create a dummy structure for testing register_structure
    testStructure = await Structure.create({
      odh_id: "TEST_ODH_ID_" + Date.now(),
      name: "Test Structure",
      coordinates: { latitude: 46.0, longitude: 11.0, altitude: 1000 },
      managed: false,
      type: "Rifugio",
    });
    testManagedStructure.Structure_id = testStructure._id.toString();
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      await User.deleteOne({ username: testUser.username });
      await ManagedStructure.deleteOne({
        telephone: testManagedStructure.telephone,
      });
      if (testStructure) {
        await Structure.deleteOne({ _id: testStructure._id });
      }
    } catch (err) {
      console.error("Cleanup error:", err);
    } finally {
      await mongoose.connection.close();
    }
  });

  describe("User Registration and Login", () => {
    test("POST /api/auth/register - should register a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.user).toHaveProperty("username", testUser.username);
    });

    test("POST /api/auth/register - should fail if username taken", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("username already taken");
    });

    test("POST /api/auth/login - should login successfully", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: testUser.username,
        password: testUser.password,
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.username).toBe(testUser.username);
    });

    test("POST /api/auth/login - should fail with wrong password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: testUser.username,
        password: "wrongpassword",
      });
      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid username or password");
    });

    test("POST /api/auth/login - should fail with non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "nonexistent_user_" + Date.now(),
          password: "password123",
        });
      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid username or password");
    });
  });

  describe("Structure Registration and Login", () => {
    test("POST /api/auth/register_structure - should fail if structure not found", async () => {
      const response = await request(app)
        .post("/api/auth/register_structure")
        .send({
          ...testManagedStructure,
          Structure_id: new mongoose.Types.ObjectId().toString(),
        });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Structure not found");
    });

    test("POST /api/auth/register_structure - should register a structure as managed", async () => {
      const response = await request(app)
        .post("/api/auth/register_structure")
        .send(testManagedStructure);

      if (response.status !== 201) {
        console.log("Error response:", response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Structure registered successfully");
      expect(response.body.structure.telephone).toBe(
        testManagedStructure.telephone,
      );
    });

    test("POST /api/auth/register_structure - should fail if structure already managed", async () => {
      const response = await request(app)
        .post("/api/auth/register_structure")
        .send(testManagedStructure);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Structure already managed");
    });

    test("POST /api/auth/login_structure - should login structure successfully", async () => {
      const response = await request(app)
        .post("/api/auth/login_structure")
        .send({
          telephone: testManagedStructure.telephone,
          password: testManagedStructure.password,
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.manager.telephone).toBe(
        testManagedStructure.telephone,
      );
    });

    test("POST /api/auth/login_structure - should fail with wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login_structure")
        .send({
          telephone: testManagedStructure.telephone,
          password: "wrongpassword",
        });
      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid telephone or password");
    });

    test("POST /api/auth/login_structure - should fail with non-existent telephone", async () => {
      const response = await request(app)
        .post("/api/auth/login_structure")
        .send({
          telephone: "+39 000 0000000",
          password: "anypassword",
        });
      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid telephone or password");
    });
  });
});
