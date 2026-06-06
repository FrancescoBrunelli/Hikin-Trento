const request = require('supertest');
const mongoose = require('mongoose');
const app = require("../src/index");
const Event = require('../src/models/Event');
const Structure = require('../src/models/Structure');
const ManagedStructure = require('../src/models/ManagedStructure');
const eventsService = require("../src/services/eventsService");

describe("Events end points", () => {
    let testStructure1;
    let testStructure2;
    let ownerToken;
    let otherToken;
    let ownerStructure;
    let otherStructure;
    let testEvent1;
    let testEvent2;

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

        // Clean up any leftover data from previous failed runs
        await ManagedStructure.deleteMany({ telephone: { $in: ["+39 888 8888888", "+39 777 7777777"] } });
        await Structure.deleteMany({ odh_id: /^EVT_TEST_ODH_ID/ });

        testStructure1 = await Structure.create({
            odh_id: "EVT_TEST_ODH_ID_1_" + Date.now(),
            name: "Owner Event Structure",
            coordinates: { latitude: 46.0, longitude: 11.0, altitude: 1000 },
            managed: false,
            type: "Rifugio",
        });

        testStructure2 = await Structure.create({
            odh_id: "EVT_TEST_ODH_ID_2_" + Date.now(),
            name: "Other Structure",
            coordinates: { latitude: 46.0, longitude: 11.0, altitude: 1000 },
            managed: false,
            type: "Rifugio",
        });

        // Register both as managedStructures
        await request(app).post("/api/auth/register_structure").send({
            name: "Event Owner Structure",
            name_owner: "Owner",
            surname_owner: "One",
            telephone: "+39 888 8888888",
            password: "ownerpass",
            Structure_id: testStructure1._id.toString(),
        });
        ownerStructure = await ManagedStructure.findOne({
            telephone: "+39 888 8888888",
        })
        if (!ownerStructure) throw new Error("Owner structure not created");

        await request(app).post("/api/auth/register_structure").send({
            name: "Other Structure",
            name_owner: "Other",
            surname_owner: "Two",
            telephone: "+39 777 7777777",
            password: "otherpass",
            Structure_id: testStructure2._id.toString(),
        });
        otherStructure = await ManagedStructure.findOne({
            telephone: "+39 777 7777777",
        })
        if (!otherStructure) throw new Error("Other structure not created");

        // Login both structures to get tokens
        const ownerLoginResponse = await request(app)
            .post("/api/auth/login_structure")
            .send({
                telephone: "+39 888 8888888",
                password: "ownerpass",
            });
        ownerToken = ownerLoginResponse.body.token;
        //if (!ownerToken) throw new Error("Owner token not set");
        const otherLoginResponse = await request(app)
            .post("/api/auth/login_structure")
            .send({
                telephone: "+39 777 7777777",
                password: "otherpass",
            });
        otherToken = otherLoginResponse.body.token;

        // Create test Event for edit and delete tests
        testEvent1 = await Event.create({
            structure_id: ownerStructure._id,
            title: "Seed Event",
            description: "A pre-existing event",
            start_date: new Date("2025-05-01"),
            end_date: new Date("2025-05-02"),
        });
        testEvent2 = await Event.create({
            structure_id: ownerStructure._id,
            title: "Another Test Event",
            description: "A pre-existing event",
            start_date: new Date("2026-05-01"),
            end_date: new Date("2026-05-02"),
        });
    });

    afterEach(async () => {
        jest.restoreAllMocks();
    })

    afterAll(async () => {
        // Cleanup test data
        try {
            await Event.deleteMany({ structure_id: { $in: [ownerStructure._id, otherStructure._id] } })
            await ManagedStructure.deleteOne({ telephone: ownerStructure.telephone });
            await ManagedStructure.deleteOne({ telephone: otherStructure.telephone });
            await Structure.deleteOne({_id: testStructure1._id})
            await Structure.deleteOne({_id: testStructure2._id})
        } catch (err) {
            console.error("Cleanup error:", err);
        } finally {
            await mongoose.connection.close();
        }
    })

    describe("Create Event", () => {
        test("POST /api/managedStructure/events - Should create an event", async () => {
            const response = await request(app)
                .post("/api/managedStructure/events")
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Test Event",
                    description: "A test event",
                    start_date: new Date("2025-06-01"),
                    end_date: new Date("2025-06-02"),
                });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Event created successfully");
            expect(response.body.event).toHaveProperty("title", "Test Event");
            expect(response.body.event).toHaveProperty("description", "A test event");
            expect(response.body.event.start_date).toBe(new Date("2025-06-01").toISOString());
            expect(response.body.event.end_date).toBe(new Date("2025-06-02").toISOString());

            testEvent1 = response.body.event;    // Save the created event for later use
        })

        test("POST /api/managedStructure/events - Should fail if not logged in", async () => {
            const response = await request(app)
                .post("/api/managedStructure/events")
                .send({
                    title: "Test Event",
                    description: "A test event",
                    start_date: new Date("2025-06-01"),
                    end_date: new Date("2025-06-02"),
                });
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Access denied. No token provided.");
        })

        test("POST /api/managedStructure/events - Should fail if one or more fields are empty", async () => {
            const response = await request(app)
                .post("/api/managedStructure/events")
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Test Event",
                    // Missing description, start_date, end_date
                });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe("All fields are required");
        })

        // For Error 500:
        test("POST /api/managedStructure/events - Should return 500 on service failure", async () => {
            jest
                .spyOn(eventsService, "createEvent")
                .mockRejectedValueOnce(new Error("DB crashed"));
            const response = await request(app)
                .post("/api/managedStructure/events")
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Test Event",
                    description: "A test event",
                    start_date: new Date("2025-06-01"),
                    end_date: new Date("2025-06-02"),
                });
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })

    describe("Get Events for Structure", () => {
        test("GET /api/managedStructure/events - Should get all events for the structure", async () => {
            const response = await request(app)
                .get("/api/managedStructure/events")
                .set("Authorization", `Bearer ${ownerToken}`)
            expect(response.status).toBe(200);
            expect(response.body.events).toBeInstanceOf(Array);
            expect(response.body.count).toBeGreaterThan(0);
            expect(response.body.events[0].title).toBe("Seed Event");
            expect(response.body.events[0]).toHaveProperty("description", "A pre-existing event");
            expect(response.body.events[0].start_date).toBe(new Date("2025-05-01").toISOString());
            expect(response.body.events[0].end_date).toBe(new Date("2025-05-02").toISOString());
        })
        // For Error 500:
        test("GET /api/managedStructure/events - Should return 500 on service failure", async () => {
            jest
                .spyOn(eventsService, "getEvents")
                .mockRejectedValueOnce(new Error("DB crashed"));
            const response = await request(app)
                .get("/api/managedStructure/events")
                .set("Authorization", `Bearer ${ownerToken}`)
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })
    describe("Get Events for User", () => {
        test("GET /api/structures/:id/events - Should get all events of a structure for the user", async () => {
            const response = await request(app)
                .get(`/api/structures/${ownerStructure._id}/events`)
            expect(response.status).toBe(200);
            expect(response.body.events).toBeInstanceOf(Array);
            expect(response.body.count).toBeGreaterThan(0);
            expect(response.body.events[0].title).toBe("Seed Event");
            expect(response.body.events[0]).toHaveProperty("description", "A pre-existing event");
            expect(response.body.events[0].start_date).toBe(new Date("2025-05-01").toISOString());
            expect(response.body.events[0].end_date).toBe(new Date("2025-05-02").toISOString());
        })
        // For Error 500:
        test("GET /api/structures/:id/events - Should return 500 on service failure", async () => {
            jest
                .spyOn(eventsService, "getEvents")
                .mockRejectedValueOnce(new Error("DB crashed"));
            const response = await request(app)
                .get(`/api/structures/${testStructure1._id}/events`);
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })

    describe("Edit Event", () => {
        test("PUT /api/managedStructure/events/:id - Should edit an event", async () => {
            const response = await request(app)
                .put(`/api/managedStructure/events/${testEvent1._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Updated Test Event",
                    description: "An updated test event",
                    start_date: new Date("2025-06-03"),
                    end_date: new Date("2025-06-04"),
                });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Event updated successfully");
            expect(response.body.event).toHaveProperty("title", "Updated Test Event");
            expect(response.body.event).toHaveProperty("description", "An updated test event");
            expect(response.body.event.start_date).toBe(new Date("2025-06-03").toISOString());
            expect(response.body.event.end_date).toBe(new Date("2025-06-04").toISOString());
        })

        test("PUT /api/managedStructure/events/:id - Should fail if event not found", async () => {
            const response = await request(app)
                .put(`/api/managedStructure/events/${otherStructure._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Updated Test Event",
                    description: "An updated test event",
                    start_date: new Date("2025-06-03"),
                    end_date: new Date("2025-06-04"),
                });
            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Event not found");
        })

        test("PUT /api/managedStructure/events/:id - Should fail if event belongs to another structure", async () => {
            const response = await request(app)
                .put(`/api/managedStructure/events/${testEvent1._id}`)
                .set("Authorization", `Bearer ${otherToken}`)
                .send({
                    title: "Updated Test Event",
                    description: "An updated test event",
                    start_date: new Date("2025-06-03"),
                    end_date: new Date("2025-06-04"),
                });
            expect(response.status).toBe(403);
            expect(response.body.error).toBe("Forbidden");
        })

        test("PUT /api/managedStructure/events/:id - Should fail if all fields are empty", async () => {
            const response = await request(app)
                .put(`/api/managedStructure/events/${testEvent1._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({});  // empty fields
            expect(response.status).toBe(400);
            expect(response.body.error).toBe("No fields to update");
        })

        test("PUT /api/managedStructure/events/:id - Should fail if not logged in", async () => {
            const response = await request(app)
                .put(`/api/managedStructure/events/${testEvent1._id}`)
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Access denied. No token provided.");
        })

        // For Error 500:
        test("PUT /api/managedStructure/events/:id - Should return 500 on service failure", async () => {
            jest
                .spyOn(eventsService, "updateEvent")
                .mockRejectedValueOnce(new Error("DB crashed"));
            const response = await request(app)
                .put(`/api/managedStructure/events/${testEvent1._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Updated Test Event",
                    description: "An updated test event",
                    start_date: new Date("2025-06-03"),
                    end_date: new Date("2025-06-04"),
                });
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })

    describe("Delete Event", () => {
        test("DELETE /api/managedStructure/events/:id - Should fail if event belongs to another structure", async () => {
            const response = await request(app)
                .delete(`/api/managedStructure/events/${testEvent1._id}`)
                .set("Authorization", `Bearer ${otherToken}`)
            expect(response.status).toBe(403);
            expect(response.body.error).toBe("Forbidden");
        })

        test("DELETE /api/managedStructure/events/:id - Should fail if not logged in", async () => {
            const response = await request(app)
                .delete(`/api/managedStructure/events/${testEvent1._id}`)
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Access denied. No token provided.");
        })

        test("DELETE /api/managedStructure/events/:id - Should fail if event not found", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/api/managedStructure/events/${fakeId}`)
                .set("Authorization", `Bearer ${ownerToken}`)
            expect(response.status).toBe(404)
            expect(response.body.error).toBe("Event not found");
        })

        test("DELETE /api/managedStructure/events/:id - Should delete an event", async () => {
            const response = await request(app)
                .delete(`/api/managedStructure/events/${testEvent1._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Event deleted successfully");
        })

        // For Error 500:
        test("DELETE /api/managedStructure/events/:id - Should return 500 on service failure", async () => {
            jest
                .spyOn(eventsService, "deleteEvent")
                .mockRejectedValueOnce(new Error("DB crashed"));
            const response = await request(app)
                .delete(`/api/managedStructure/events/${testEvent2._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

    })
})

