const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/index");
const User = require("../src/models/User");
const Structure = require("../src/models/Structure");
const Trail = require("../src/models/Trail");

describe("Favourites Endpoints", () => {
  let userToken;
  let userId;
  let testStructure;
  let testTrail;

  const testUser = {
    name: "FavUser",
    surname: "Test",
    username: "fav_user_" + Date.now(),
    date_of_birth: "1990-01-01",
    password: "password123",
  };

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
    userToken = loginRes.body.token;
    userId = loginRes.body.user.id;

    // Create a test structure
    testStructure = await Structure.create({
      odh_id: "STR_FAV_" + Date.now(),
      name: "Fav Test Structure",
      coordinates: { latitude: 46.0, longitude: 11.0, altitude: 1000 },
      managed: false,
      type: "Rifugio",
    });

    // Create a test trail
    testTrail = await Trail.create({
      osm_id: 12345 + Date.now(),
      name: "Fav Test Trail",
      roundtrip: false,
      bounds: { minlat: 46.0, minlon: 11.0, maxlat: 46.1, maxlon: 11.1 },
      geometry: {
        type: "LineString",
        coordinates: [[11.0, 46.0], [11.1, 46.1]],
      },
      type: "trail",
    });
  });

  afterAll(async () => {
    try {
      await User.deleteOne({ _id: userId });
      await Structure.deleteOne({ _id: testStructure._id });
      await Trail.deleteOne({ _id: testTrail._id });
    } finally {
      await mongoose.connection.close();
    }
  });

  describe("Favourite Structures", () => {
    test("PUT /api/favourites/structures - should add structure to favourites", async () => {
      const response = await request(app)
        .put("/api/favourites/structures")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ _id: testStructure._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("added item in the list");
      expect(response.body.fav_structures.some(s => s._id === testStructure._id.toString())).toBe(true);
    });

    test("PUT /api/favourites/structures - should not add same structure twice", async () => {
      const response = await request(app)
        .put("/api/favourites/structures")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ _id: testStructure._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("item was already in the list");
    });

    test("GET /api/favourites/structures - should get favourite structures", async () => {
      const response = await request(app)
        .get("/api/favourites/structures")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.fav_structures)).toBe(true);
      expect(response.body.fav_structures.some(s => s._id === testStructure._id.toString())).toBe(true);
    });

    test("DELETE /api/favourites/structures - should remove structure from favourites", async () => {
      const response = await request(app)
        .delete("/api/favourites/structures")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ _id: testStructure._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("Removed item from the list");
      expect(response.body.fav_structures.some(s => s._id === testStructure._id.toString())).toBe(false);
    });

    test("DELETE /api/favourites/structures - should fail if structure not in list", async () => {
      const response = await request(app)
        .delete("/api/favourites/structures")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ _id: testStructure._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("Item not in the list");
    });
  });

  describe("Favourite Trails", () => {
    test("PUT /api/favourites/trails - should add trail to favourites", async () => {
      const response = await request(app)
        .put("/api/favourites/trails")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ _id: testTrail._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("added item in the list");
      expect(response.body.fav_trails.some(t => t._id === testTrail._id.toString())).toBe(true);
    });

    test("PUT /api/favourites/trails - should not add same trail twice", async () => {
      const response = await request(app)
        .put("/api/favourites/trails")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ _id: testTrail._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("item was already in the list");
    });

    test("GET /api/favourites/trails - should get favourite trails", async () => {
      const response = await request(app)
        .get("/api/favourites/trails")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.fav_trails)).toBe(true);
      expect(response.body.fav_trails.some(t => t._id === testTrail._id.toString())).toBe(true);
    });

    test("DELETE /api/favourites/trails - should remove trail from favourites", async () => {
      const response = await request(app)
        .delete("/api/favourites/trails")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ _id: testTrail._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("Removed item from the list");
      expect(response.body.fav_trails.some(t => t._id === testTrail._id.toString())).toBe(false);
    });

    test("DELETE /api/favourites/trails - should fail if trail not in list", async () => {
      const response = await request(app)
        .delete("/api/favourites/trails")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ _id: testTrail._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("Item not in the list");
    });
  });

  describe("Security", () => {
    test("should fail to get favourites without token", async () => {
      const response = await request(app).get("/api/favourites/structures");
      expect(response.status).toBe(401);
    });

    test("should fail to add favourite with invalid token", async () => {
      const response = await request(app)
        .put("/api/favourites/structures")
        .set("Authorization", "Bearer invalidtoken")
        .send({ _id: testStructure._id.toString() });
      expect(response.status).toBe(401);
    });
  });
});
