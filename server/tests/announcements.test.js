const request = require('supertest');
const mongoose = require('mongoose');
const app = require("../src/index");
const Announcement = require('../src/models/Announcement');
const Structure = require('../src/models/Structure');
const ManagedStructure = require('../src/models/ManagedStructure');
const announcementsService = require("../src/services/announcementsService");

describe("Announcements end points", () => {
    let testStructure1;
    let testStructure2;
    let ownerToken;
    let otherToken;
    let ownerStructure;
    let otherStructure;
    let testAnnouncement1;
    let testAnnouncement2;
    const fakeId = new mongoose.Types.ObjectId();

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
        await Structure.deleteMany({ odh_id: /^ANN_TEST_ODH_ID/ });

        testStructure1 = await Structure.create({
            odh_id: "ANN_TEST_ODH_ID_1_" + Date.now(),
            name: "Owner Event Structure",
            coordinates: { latitude: 46.0, longitude: 11.0, altitude: 1000 },
            managed: false,
            type: "Rifugio",
        });

        testStructure2 = await Structure.create({
            odh_id: "ANN_TEST_ODH_ID_2_" + Date.now(),
            name: "Other Structure",
            coordinates: { latitude: 46.0, longitude: 11.0, altitude: 1000 },
            managed: false,
            type: "Rifugio",
        })

        // Register both as managedStructures
        await request(app).post("/api/auth/register_structure").send({
            name: "Event Owner Structure",
            name_owner: "Owner",
            surname_owner: "One",
            telephone: "+39 101 0101010",
            password: "ownerpass",
            Structure_id: testStructure1._id.toString(),
        })
        ownerStructure = await ManagedStructure.findOne({
            telephone: "+39 101 0101010",
        })
        if (!ownerStructure) throw new Error("Owner structure not created");

        await request(app).post("/api/auth/register_structure").send({
            name: "Other Structure",
            name_owner: "Other",
            surname_owner: "Two",
            telephone: "+39 202 0202020",
            password: "otherpass",
            Structure_id: testStructure2._id.toString(),
        })
        otherStructure = await ManagedStructure.findOne({
            telephone: "+39 202 0202020",
        })
        if (!otherStructure) throw new Error("Other structure not created");

        // Login both structures to get tokens
        const ownerLoginResponse = await request(app)
            .post("/api/auth/login_structure")
            .send({
                telephone: "+39 101 0101010",
                password: "ownerpass",
            });
        ownerToken = ownerLoginResponse.body.token;
        //if (!ownerToken) throw new Error("Owner token not set");
        const otherLoginResponse = await request(app)
            .post("/api/auth/login_structure")
            .send({
                telephone: "+39 202 0202020",
                password: "otherpass",
            })
        otherToken = otherLoginResponse.body.token;

        // Create test Announcement for edit and delete tests
        testAnnouncement1 = await Announcement.create({
            structure_id: ownerStructure._id,
            title: "Seed Announcement",
            description: "A pre-existing announcement",
        })
        testAnnouncement2 = await Announcement.create({
            structure_id: ownerStructure._id,
            title: "Another Test Announcement",
            description: "A pre-existing announcement",
        })
    })

    afterEach(async () => {
        jest.restoreAllMocks();
    })

    afterAll(async () => {
        // Cleanup test data
        try {
            await Announcement.deleteMany({ structure_id: { $in: [ownerStructure._id, otherStructure._id] } })
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

    describe("Create Announcement", () => {
        test("POST /api/managedStructure/announcements - Should create an announcement", async () => {
            const response = await request(app)
                .post("/api/managedStructure/announcements")
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Test Announcement",
                    description: "A test announcement",
                });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Announcement created successfully");
            expect(response.body.announcement).toHaveProperty("title", "Test Announcement");
            expect(response.body.announcement).toHaveProperty("description", "A test announcement");
        })

        test("POST /api/managedStructure/announcements - Should fail if not logged in", async () => {
            const response = await request(app)
                .post("/api/managedStructure/announcements")
                .send({
                    title: "Test Announcement",
                    description: "A test announcement",
                });
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Access denied. No token provided.");
        })

        test("POST /api/managedStructure/announcement - Should fail if one or more fields are empty", async () => {
            const response = await request(app)
                .post("/api/managedStructure/announcements")
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Test Announcement",
                    // Missing description
                });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe("All fields are required");
        })

        test("POST /api/managedStructure/announcements - Should return 500 on service failure", async () => {
            jest
                .spyOn(announcementsService, "createAnnouncement")
                .mockRejectedValueOnce(new Error("DB crashed"));
            const response = await request(app)
                .post("/api/managedStructure/announcements")
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Test Announcement",
                    description: "A test announcement",
                });
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })

    describe("Get Announcements for Structure", () => {
        test("GET /api/managedStructure/announcements - Should get all announcements for the structure", async () => {
            const response = await request(app)
                .get("/api/managedStructure/announcements")
                .set("Authorization", `Bearer ${ownerToken}`)
            expect(response.status).toBe(200);
            expect(response.body.announcements).toBeInstanceOf(Array);
            expect(response.body.count).toBeGreaterThan(0);
            expect(response.body.announcements[0]).toHaveProperty("title", "Seed Announcement");
            expect(response.body.announcements[0]).toHaveProperty("description", "A pre-existing announcement");
        })

        test("GET /api/managedStructure/announcements - Should fail if not logged in", async () => {
            const response = await request(app)
                .get("/api/managedStructure/announcements")
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Access denied. No token provided.");
        })

        test ("GET /api/managedStructure/announcements - Should return 500 on service failure", async () => {
            jest
                .spyOn(announcementsService, "getAnnouncements")
                .mockRejectedValueOnce(new Error("DB crashed"));
            const response = await request(app)
                .get("/api/managedStructure/announcements")
                .set("Authorization", `Bearer ${ownerToken}`)
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })

    describe("Get Announcements for User", () => {
        test("GET /api/structures/:id/announcements - Should get all announcements of a structure for the user", async () => {
            const response = await request(app)
                .get(`/api/structures/${ownerStructure._id}/announcements`)
            expect(response.status).toBe(200);
            expect(response.body.announcements).toBeInstanceOf(Array);
            expect(response.body.count).toBeGreaterThan(0);
            expect(response.body.announcements[0]).toHaveProperty("title", "Seed Announcement");
            expect(response.body.announcements[0]).toHaveProperty("description", "A pre-existing announcement");
        })

        test("GET /api/structures/:id/announcements - Should fail if structure not found", async () => {
            const response = await request(app)
                .get(`/api/structures/${fakeId}/announcements`)
            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Structure not found");
        })

        test("GET /api/structures/:id/announcements - Should return 500 on service failure", async () => {
            jest
                .spyOn(announcementsService, "getAnnouncements")
                .mockRejectedValueOnce(new Error("DB crashed"));
            const response = await request(app)
                .get(`/api/structures/${ownerStructure._id}/announcements`)
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })

    describe("Edit Announcement", () => {
        test("PUT /api/managedStructure/announcements/:id - Should edit an announcement", async () => {
            const response = await request(app)
                .put(`/api/managedStructure/announcements/${testAnnouncement1._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Updated Announcement",
                    description: "This announcement has been updated",
                });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Announcement updated successfully");
            expect(response.body.announcement).toHaveProperty("title", "Updated Announcement");
            expect(response.body.announcement).toHaveProperty("description", "This announcement has been updated");
        })

        test("PUT /api/managedStructure/announcements/:id - Should fail if not logged in", async () => {
            const response = await request(app)
                .put(`/api/managedStructure/announcements/${testAnnouncement1._id}`)
                .send({
                    title: "Updated Announcement",
                    description: "This announcement has been updated",
                });
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Access denied. No token provided.");
        })

        test("PUT /api/managedStructure/announcements/:id - Should fail if announcement not found", async () => {
            const response = await request(app)
                .put(`/api/managedStructure/announcements/${fakeId}`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Updated Announcement",
                    description: "This announcement has been updated",
                });
            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Announcement not found");
        })

        test("PUT /api/managedStructure/announcements/:id - Should fail if announcement belongs to another structure", async () => {
            const response = await request(app)
                .put(`/api/managedStructure/announcements/${testAnnouncement1._id}`)
                .set("Authorization", `Bearer ${otherToken}`)
                .send({
                    title: "Updated Announcement",
                    description: "This announcement has been updated",
                });
            expect(response.status).toBe(403);
            expect(response.body.error).toBe("Forbidden");
        })

        test("PUT /api/managedStructure/announcements/:id - Should fail if all fields are empty", async () => {
            const response = await request(app)
                .put(`/api/managedStructure/announcements/${testAnnouncement1._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({});      // Empty fields
            expect(response.status).toBe(400);
            expect(response.body.error).toBe("No fields to update");
        })

        test("PUT /api/managedStructure/announcements/:id - Should return 500 on service failure", async () => {
            jest
                .spyOn(announcementsService, "updateAnnouncement")
                .mockRejectedValueOnce(new Error("DB crashed"));
            const response = await request(app)
                .put(`/api/managedStructure/announcements/${testAnnouncement1._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    title: "Updated Announcement",
                    description: "This announcement has been updated",
                });
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })

    describe("Delete Announcement", () => {
        test("DELETE /api/managedStructure/announcements/:id - Should fail if announcement belongs to another structure", async () => {
            const response = await request(app)
                .delete(`/api/managedStructure/announcements/${testAnnouncement1._id}`)
                .set("Authorization", `Bearer ${otherToken}`)
            expect(response.status).toBe(403);
            expect(response.body.error).toBe("Forbidden");
        })

        test("DELETE /api/managedStructure/announcements/:id - Should fail if announcement not found", async () => {
            const response = await request(app)
                .delete(`/api/managedStructure/announcements/${fakeId}`)
                .set("Authorization", `Bearer ${ownerToken}`)
            expect(response.status).toBe(404);
        })

        test("DELETE /api/managedStructure/announcements/:id - Should fail if not logged in", async () => {
            const response = await request(app)
                .delete(`/api/managedStructure/announcements/${testAnnouncement1._id}`)
            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Access denied. No token provided.");
        })

        test("DELETE /api/managedStructure/announcements/:id - Should delete an announcement", async () => {
            const response = await request(app)
                .delete(`/api/managedStructure/announcements/${testAnnouncement1._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Announcement deleted successfully");
        })

        test("DELETE /api/managedStructure/announcements/:id - Should return 500 on service failure", async () => {
            jest
                .spyOn(announcementsService, "deleteAnnouncement")
                .mockRejectedValueOnce(new Error("DB crashed"));
            const response = await request(app)
                .delete(`/api/managedStructure/announcements/${testAnnouncement2._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })
})
