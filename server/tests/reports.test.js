const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/index");
const Report = require("../src/models/Report");
const User = require("../src/models/User");
const ManagedStructure = require("../src/models/ManagedStructure");
const Structure = require("../src/models/Structure");

describe("User Reports Endpoints", () => {
  let userToken;
  let userId;
  let structureToken;
  let secondUserToken;
  let secondUserId;
  let structureId;
  let testReportId;

  const testUser = {
    name: "ReportUser",
    surname: "Test",
    username: "report_user_" + Date.now(),
    date_of_birth: "1990-01-01",
    password: "password123",
  };

  const secondUser = {
    name: "SecondUser",
    surname: "Test",
    username: "report_user2_ext_" + Date.now(),
    date_of_birth: "1990-01-01",
    password: "password123",
  };

  const testStructureData = {
    odh_id: "STR_REPORT_" + Date.now(),
    name: "Report Test Structure",
    coordinates: { latitude: 46.0, longitude: 11.0, altitude: 1000 },
    managed: false,
    type: "Rifugio",
  };

  const testManagedStructure = {
    name_owner: "Owner",
    surname_owner: "Surname",
    telephone: "+39 " + (Date.now() % 100000000),
    password: "password123",
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Setup User
    await request(app).post("/api/auth/register").send(testUser);
    const userLogin = await request(app).post("/api/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });
    userToken = userLogin.body.token;
    userId = userLogin.body.user.id;

    // Setup Second User
    await request(app).post("/api/auth/register").send(secondUser);
    const secondLogin = await request(app).post("/api/auth/login").send({
      username: secondUser.username,
      password: secondUser.password,
    });
    secondUserToken = secondLogin.body.token;
    secondUserId = secondLogin.body.user.id;

    // Setup Structure
    const struct = await Structure.create(testStructureData);
    testManagedStructure.Structure_id = struct._id.toString();
    await request(app)
      .post("/api/auth/register_structure")
      .send(testManagedStructure);

    const structLogin = await request(app)
      .post("/api/auth/login_structure")
      .send({
        telephone: testManagedStructure.telephone,
        password: testManagedStructure.password,
      });

    structureToken = structLogin.body.token;

    // Create a test report to use in multiple tests
    const reportRes = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Test Report",
        description: "Test description",
        coordinates: { latitude: 46.001, longitude: 11.001, altitude: 1050 },
      });
    testReportId = reportRes.body._id;
  });

  afterAll(async () => {
    try {
      await Report.deleteMany({ userId: userId });
      await Report.deleteMany({ userId: secondUserId });
      await Report.deleteOne({ _id: testReportId });
      await User.deleteOne({ _id: userId });
      await User.deleteOne({ _id: secondUserId });
      const ms = await ManagedStructure.findOne({
        telephone: testManagedStructure.telephone,
      });
      if (ms) {
        await Structure.deleteOne({ _id: ms.structure._id });
        await ManagedStructure.deleteOne({ _id: ms._id });
      }
    } finally {
      await mongoose.connection.close();
    }
  });

  test("POST /api/reports - should create a new report", async () => {
    const reportData = {
      title: "Broken Sign",
      description: "The trail sign at the junction is broken.",
      coordinates: { latitude: 46.001, longitude: 11.001, altitude: 1050 },
    };
    const response = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${userToken}`)
      .send(reportData);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(reportData.title);
    expect(response.body.userId).toBe(userId);
  });

  test("POST /api/reports - should fail without authentication", async () => {
    const response = await request(app)
      .post("/api/reports")
      .send({
        title: "Unauthorized Report",
        description: "Should not be created",
        coordinates: { latitude: 46.0, longitude: 11.0, altitude: 1000 },
      });

    expect(response.status).toBe(401);
  });

  test("POST /api/reports - should fail with missing title", async () => {
    const response = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        description: "Missing title",
        coordinates: { latitude: 46.0, longitude: 11.0, altitude: 1000 },
      });

    expect(response.status).toBe(400);
  });

  test("POST /api/reports - should fail with missing description", async () => {
    const response = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Missing description",
        coordinates: { latitude: 46.0, longitude: 11.0, altitude: 1000 },
      });

    expect(response.status).toBe(400);
  });

  test("POST /api/reports - should fail with missing coordinates", async () => {
    const response = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Missing coordinates",
        description: "No coordinates provided",
      });

    expect(response.status).toBe(400);
  });

  test("GET /api/reports - should return reports within radius", async () => {
    const response = await request(app)
      .get("/api/reports")
      .query({ latitude: 46.0, longitude: 11.0, radius: 500 }); // 500 meters

    console.log(response.body);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]._id).toBe(testReportId);
  });

  test("GET /api/reports - should return empty if outside radius", async () => {
    const response = await request(app)
      .get("/api/reports")
      .query({ latitude: 45.0, longitude: 10.0, radius: 1000 });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("GET /api/reports/my - should return user's reports", async () => {
    const response = await request(app)
      .get("/api/reports/my")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.some((r) => r._id === testReportId)).toBe(true);
  });

  test("GET /api/reports/my - should fail without authentication", async () => {
    const response = await request(app).get("/api/reports/my");

    expect(response.status).toBe(401);
  });

  test("GET /api/reports/my - should return empty array if user has no reports", async () => {
    const response = await request(app)
      .get("/api/reports/my")
      .set("Authorization", `Bearer ${secondUserToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  test("GET /api/reports/my - should not return other users reports", async () => {
    const response = await request(app)
      .get("/api/reports/my")
      .set("Authorization", `Bearer ${secondUserToken}`);

    expect(response.status).toBe(200);
    const ids = response.body.map((r) => r._id);
    expect(ids).not.toContain(testReportId);
  });

  test("GET /api/reports/:report_id - should return a report by id", async () => {
    const response = await request(app).get(`/api/reports/${testReportId}`);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(testReportId);
    expect(response.body.title).toBe("Test Report");
  });

  test("GET /api/reports/:report_id - should return 404 for non-existent id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/api/reports/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Report not found");
  });

  test("GET /api/reports/:report_id - should return 400 for invalid id format", async () => {
    const response = await request(app).get("/api/reports/not-a-valid-id");

    expect(response.status).toBe(400);
  });

  test("PUT /api/reports/:report_id - should update own report", async () => {
    const response = await request(app)
      .put(`/api/reports/${testReportId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Very Broken Sign" });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Very Broken Sign");
  });

  test("PUT /api/reports/:report_id/status - should update status if structure is within 10km", async () => {
    const response = await request(app)
      .put(`/api/reports/${testReportId}/status`)
      .set("Authorization", `Bearer ${structureToken}`)
      .send({ status: "accepted" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("accepted");
  });

  test("PUT /api/reports/:report_id/status - should fail if structure is too far", async () => {
    // Create a report far away
    const farReport = await Report.create({
      userId: userId,
      title: "Far Report",
      description: "Far away issue",
      coordinates: { latitude: 47.0, longitude: 12.0, altitude: 500 },
      location: { type: "Point", coordinates: [12.0, 47.0] },
    });

    const response = await request(app)
      .put(`/api/reports/${farReport._id}/status`)
      .set("Authorization", `Bearer ${structureToken}`)
      .send({ status: "resolved" });

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/too far/i);

    await Report.deleteOne({ _id: farReport._id });
  });

  test("PUT /api/reports/:report_id - should fail without authentication", async () => {
    const response = await request(app)
      .put(`/api/reports/${testReportId}`)
      .send({ title: "Unauthorized update" });

    expect(response.status).toBe(401);
  });

  test("PUT /api/reports/:report_id - should fail if user is not the owner", async () => {
    const response = await request(app)
      .put(`/api/reports/${testReportId}`)
      .set("Authorization", `Bearer ${secondUserToken}`)
      .send({ title: "Should not update" });

    expect(response.status).toBe(404);
    expect(response.body.error).toMatch(/not found or not authorized/i);
  });

  test("PUT /api/reports/:report_id - should update coordinates and location together", async () => {
    const newCoords = { latitude: 46.002, longitude: 11.002, altitude: 1100 };
    const response = await request(app)
      .put(`/api/reports/${testReportId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ coordinates: newCoords });

    expect(response.status).toBe(200);
    expect(response.body.coordinates.latitude).toBe(newCoords.latitude);
    expect(response.body.location.coordinates[0]).toBe(newCoords.longitude);
    expect(response.body.location.coordinates[1]).toBe(newCoords.latitude);
  });

  test("PUT /api/reports/:report_id - should return 404 for non-existent report", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .put(`/api/reports/${fakeId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Non existent" });

    expect(response.status).toBe(404);
  });

  test("PUT /api/reports/:report_id/status - should fail without authentication", async () => {
    const response = await request(app)
      .put(`/api/reports/${testReportId}/status`)
      .send({ status: "accepted" });

    expect(response.status).toBe(401);
  });

  test("PUT /api/reports/:report_id/status - should fail with invalid status value", async () => {
    const response = await request(app)
      .put(`/api/reports/${testReportId}/status`)
      .set("Authorization", `Bearer ${structureToken}`)
      .send({ status: "invalid_status" });

    expect(response.status).toBe(400);
  });

  test("PUT /api/reports/:report_id/status - should fail if user token used instead of structure token", async () => {
    const response = await request(app)
      .put(`/api/reports/${testReportId}/status`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "accepted" });

    expect(response.status).toBe(401);
  });

  test("PUT /api/reports/:report_id/status - should update to resolved", async () => {
    const response = await request(app)
      .put(`/api/reports/${testReportId}/status`)
      .set("Authorization", `Bearer ${structureToken}`)
      .send({ status: "resolved" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("resolved");
  });

  test("DELETE /api/reports/:report_id - should fail without authentication", async () => {
    const response = await request(app).delete(`/api/reports/${testReportId}`);

    expect(response.status).toBe(401);
  });

  test("DELETE /api/reports/:report_id - should fail if user is not the owner", async () => {
    const response = await request(app)
      .delete(`/api/reports/${testReportId}`)
      .set("Authorization", `Bearer ${secondUserToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toMatch(/not found or not authorized/i);
  });

  test("DELETE /api/reports/:report_id - should return 404 for non-existent report", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .delete(`/api/reports/${fakeId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });

  test("DELETE /api/reports/:report_id - should delete own report", async () => {
    const response = await request(app)
      .delete(`/api/reports/${testReportId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Report deleted successfully");

    const deleted = await Report.findById(testReportId);
    expect(deleted).toBeNull();
  });

  test("POST /api/reports - new report should have pending status by default", async () => {
    const response = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Status check report",
        description: "Checking default status",
        coordinates: { latitude: 46.001, longitude: 11.001, altitude: 1050 },
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("pending");

    // cleanup
    await Report.deleteOne({ _id: response.body._id });
  });

  test("GET /api/reports - should return all reports when no filters provided", async () => {
    const response = await request(app).get("/api/reports");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("GET /api/reports - should return empty array for radius of 1 meter", async () => {
    const response = await request(app)
      .get("/api/reports")
      .query({ latitude: 46.0, longitude: 11.0, radius: 1 });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });
});
