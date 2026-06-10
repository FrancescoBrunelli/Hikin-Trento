const request = require("supertest");
const mongoose = require("mongoose");
const axios = require("axios");

const app = require("../src/index");
const User = require("../src/models/User");
const Plan = require("../src/models/Plan");

describe("Planning Endpoints", () => {
let token;
let testUser;
let testPlan;

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }

    testUser = {
        name: "Planning",
        surname: "Tester",
        username: "planning_" + Date.now(),
        date_of_birth: "1990-01-01",
        password: "password123"
    };

    await request(app)
        .post("/api/auth/register")
        .send(testUser);

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            username: testUser.username,
            password: testUser.password
        });

    token = loginResponse.body.token;

    const user = await User.findOne({
        username: testUser.username
    });

    testPlan = await Plan.create({
        user: user._id,
        name: "Test Plan",
        description: "Test Description",
        start: {
            coordinates: {
                longitude: 11.0,
                latitude: 46.0,
                altitude: 1000
            }
        },
        end: {
            coordinates: {
                longitude: 11.2,
                latitude: 46.2,
                altitude: 1200
            }
        },
        route: {
            distance: 1000,
            duration: 600,
            ascent: 100,
            descent: 50,
            geometry: "test_geometry",
            segments: []
        }
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

afterAll(async () => {
    try {
        await Plan.deleteMany({
            name: { $in: ["Test Plan", "New Plan", "Updated Plan"] }
        });

        await User.deleteOne({
            username: testUser.username
        });
    } finally {
        await mongoose.connection.close();
    }
});

describe("Save Plan", () => {

    test("POST /api/planning/save - should save a plan", async () => {

        const response = await request(app)
            .post("/api/planning/save")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "New Plan",
                description: "New Description",
                start: [11.0, 46.0, 1000],
                end: [11.2, 46.2, 1200],
                route: {
                    distance: 1000,
                    duration: 600,
                    ascent: 100,
                    descent: 50,
                    geometry: "test",
                    segments: []
                }
            });

        expect(response.status).toBe(201);
        expect(response.body.message)
            .toBe("Plan saved successfully");
    });

    test("POST /api/planning/save - should fail with missing fields", async () => {

        const response = await request(app)
            .post("/api/planning/save")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Invalid Plan"
            });

        expect(response.status).toBe(400);
        expect(response.body.error)
            .toBe("Name, start, end and route are required");
    });

describe("Get User Plans", () => {

    test("GET /api/planning - should return plans", async () => {

        const response = await request(app)
            .get("/api/planning")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.plans).toBeInstanceOf(Array);
    });

});

describe("Get Single Plan", () => {

    test("GET /api/planning/:id - should get plan", async () => {

        const response = await request(app)
            .get(`/api/planning/${testPlan._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.plan.name).toBe("Test Plan");
    });

    test("GET /api/planning/:id - should fail if plan not found", async () => {

        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/api/planning/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Plan not found");
    });

});

describe("Update Plan", () => {

    test("PUT /api/planning/:id - should update plan", async () => {

        const response = await request(app)
            .put(`/api/planning/${testPlan._id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Updated Plan",
                multiDay: true,
                days: 2
            });

        expect(response.status).toBe(200);
        expect(response.body.message)
            .toBe("Plan updated successfully");
    });

    test("PUT /api/planning/:id - should fail if plan not found", async () => {

        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/planning/${fakeId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Updated Plan"
            });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Plan not found");
    });

});

describe("Delete Plan", () => {

    test("DELETE /api/planning/:id - should delete plan", async () => {

        const tempPlan = await Plan.create({
            user: testPlan.user,
            name: "Delete Me",
            start: {
                coordinates: {
                    longitude: 11,
                    latitude: 46,
                    altitude: 1000
                }
            },
            end: {
                coordinates: {
                    longitude: 12,
                    latitude: 47,
                    altitude: 1100
                }
            },
            route: {
                distance: 100
            }
        });

        const response = await request(app)
            .delete(`/api/planning/${tempPlan._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message)
            .toBe("Plan deleted successfully");
    });

    test("DELETE /api/planning/:id - should fail if plan not found", async () => {

        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .delete(`/api/planning/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Plan not found");
    });

});

describe("Calculate Route", () => {

    test("POST /api/planning/route - should calculate route", async () => {

        jest.spyOn(axios, "post")
            .mockResolvedValueOnce({
                data: {
                    routes: [{
                        summary: {
                            distance: 1000,
                            duration: 600,
                            ascent: 100,
                            descent: 50
                        },
                        geometry: "encoded_polyline",
                        segments: []
                    }]
                }
            });

        const response = await request(app)
            .post("/api/planning/route")
            .set("Authorization", `Bearer ${token}`)
            .send({
                start: [11.0, 46.0],
                end: [11.2, 46.2]
            });

        expect(response.status).toBe(200);
        expect(response.body.route.distance).toBe(1000);
    });

    test("POST /api/planning/route - should fail with missing coordinates", async () => {

        const response = await request(app)
            .post("/api/planning/route")
            .set("Authorization", `Bearer ${token}`)
            .send({
                start: [11.0, 46.0]
            });

        expect(response.status).toBe(400);
    });

});
});
});
