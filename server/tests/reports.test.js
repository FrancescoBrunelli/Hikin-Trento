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
  let structureId;
  let testReportId;

  const testUser = {
    name: "ReportUser",
    surname: "Test",
    username: "report_user_" + Date.now(),
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

    // Setup Structure
    const struct = await Structure.create(testStructureData);
    testManagedStructure.Structure_id = struct._id.toString();
    await request(app)
      .post("/api/auth/register_structure")
      .send(testManagedStructure);
    
    const structLogin = await request(app).post("/api/auth/login_structure").send({
      telephone: testManagedStructure.telephone,
      password: testManagedStructure.password,
    });

    structureToken = structLogin.body.token;
  });

  afterAll(async () => {
    try {
      await Report.deleteMany({ userId: userId });
      await User.deleteOne({ _id: userId });
      const ms = await ManagedStructure.findOne({ telephone: testManagedStructure.telephone });
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
    testReportId = response.body._id;
  });

  test("GET /api/reports - should return reports within radius", async () => {
    const response = await request(app)
      .get("/api/reports")
      .query({ latitude: 46.0, longitude: 11.0, radius: 500 }); // 500 meters

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

  test("DELETE /api/reports/:report_id - should delete own report", async () => {
    const response = await request(app)
      .delete(`/api/reports/${testReportId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Report deleted successfully");

    const deleted = await Report.findById(testReportId);
    expect(deleted).toBeNull();
  });
});
