const request = require('supertest');
const mongoose = require('mongoose');
const app = require("../src/index");
const structureService = require("../src/services/structuresService");
const trailsService = require("../src/services/trailsService");
const pisService = require("../src/services/pisService");

describe("Structure search end points", () => {
    beforeAll(async () => {
        // Ensure DB is connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
    });

    afterAll(async () => {
        // Close DB connection
        await mongoose.connection.close();
    })

    describe("Single filters", () => {
        test("GET /api/structures/search?q=Oberettes - Should return structure with name similar or that contains 'Oberettes'", async () => {
            const response = await request(app)
                .get("/api/structures/search")
                .query({ q: "Oberettes" })
            expect(response.status).toBe(200);
            expect(response.body.structures.length).toBeGreaterThan(0);
            response.body.structures.forEach(structure => {expect(structure.name).toMatch(/Oberettes/i)});
        })

        test("GET /api/structures/search?q=RandomName - Should return 200 and 0 results", async () => {
            const response = await request(app)
                .get("/api/structures/search")
                .query({ q:"RandomName" })
            expect(response.status).toBe(200);
            expect(response.body.structures.length).toBe(0);
        })

        test("GET /api/structures/search?managed=true - Should show only managed structures", async () => {
            const response = await request(app)
                .get("/api/structures/search")
                .query({ managed: true })
            expect(response.status).toBe(200);
            expect(response.body.structures.length).toBeGreaterThan(0);
            response.body.structures.forEach(structure => {expect(structure.managed).toBe(true)});
        })

        test("GET /api/structures/search?managed=false - Should show only unmanaged structures", async () => {
            const response = await request(app)
                .get("/api/structures/search")
                .query({ managed: false })
            expect(response.status).toBe(200);
            expect(response.body.structures.length).toBeGreaterThan(0);
            response.body.structures.forEach(structure => {expect(structure.managed).toBe(false)});
        })
    })

    describe("Multiple filters", () => {
        test("GET /api/structures/search?q=Oberettes?managed=true - Should return structure with name similar or that contains 'Oberettes' and managed set to true", async () => {
            const response = await request(app)
                .get("/api/structures/search")
                .query({ q: "Oberettes", managed: true })
            expect(response.status).toBe(200);
            expect(response.body.structures.length).toBeGreaterThan(0);
            response.body.structures.forEach(structure => {
                expect(structure.name).toMatch(/Oberettes/i);
                expect(structure.managed).toBe(true);
            });
        })

        test("GET /api/structures/search?q=Sesvenna?managed=false - Should return structure with name similar or that contains 'Sesvenna' and managed set to false", async () => {
            const response = await request(app)
                .get("/api/structures/search")
                .query({ q: "Sesvenna", managed: false })
            expect(response.status).toBe(200);
            expect(response.body.structures.length).toBeGreaterThan(0);
            response.body.structures.forEach(structure => {
                expect(structure.name).toMatch(/sesvenna/i);
                expect(structure.managed).toBe(false);
            });
        })
    })

    describe("Search error handling", () => {
        beforeAll(async () => {
            jest
                .spyOn(structureService, "search")
                .mockRejectedValue(new Error("DB crashed"));
        })

        afterAll(async () => {
            jest.restoreAllMocks();
        })

        test("GET /api/structures/search?q=Oberettes - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/structures/search")
                .query({ q: "Oberettes" })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/structures/search?managed=true - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/structures/search")
                .query({ managed: true })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/structures/search?managed=false - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/structures/search")
                .query({ managed: false })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/structures/search?q=Oberettes?managed=true - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/structures/search")
                .query({ q: "Oberettes", managed: true })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/structures/search?q=Sesvenna?managed=false - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/structures/search")
                .query({ q: "Sesvenna", managed: false })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })
})

describe("Trail search end points", () => {
    beforeAll(async () => {
        // Ensure DB is connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
    });

    afterAll(async () => {
        // Close DB connection
        await mongoose.connection.close();
    })

    describe("Single filters", () => {
        test("GET /api/trails?name=Pace - Should return trail with name similar or that contains 'Pace'", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ name: "Pace" })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {expect(trail.name).toMatch(/pace/i)});
        })

        test("GET /api/trails?name=RandomName - Should return 200 and 0 results", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ name:"RandomName" })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBe(0);
        })

        test("GET /api/trails?distance_km=10 - Should return trails with distance greater than 10 km", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ distance_km: 10 })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {expect(trail.distance_km).toBeGreaterThan(10)})
        })

        test("GET /api/trails?ascent_m=1000 - Should return trails with ascent greater than 1000 m", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ ascent_m: 1000 })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {expect(trail.ascent_m).toBeGreaterThanOrEqual(1000)})
        })

        test("GET /api/trails?descent_m=500 - Should return trails with descent greater than 500 m", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ descent_m: 500 })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {expect(trail.descent_m).toBeGreaterThan(500)})
        })

        test("GET /api/trails?duration_h=6 - Should return trails with duration greater than 6 hours", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ duration_h: 6 })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {
                const forward = trail.duration_forward ?? "00:00";
                const backward = trail.duration_backward ?? "00:00";
                const meetsForward = forward >= "06:00";
                const meetsBackward = backward >= "06:00";
                expect(meetsForward || meetsBackward).toBe(true);
            })
        })

        test("GET /api/trails?from=Mattarello - Should return trails starting in 'Mattarello'", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ from: "Mattarello" })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {expect(trail.from).toMatch(/mattarello/i)});
        })

        test("GET /api/trails?to=Campogrosso - Should return trails ending in 'Campogrosso'", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ to: "Campogrosso" })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {expect(trail.to).toMatch(/campogrosso/i)});
        })

        test("GET /api/trails?roundtrip=true - Should return trails with roundtrip set to true", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ roundtrip: true })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {expect(trail.roundtrip).toBe(true)});
        })

        test("GET /api/trails?roundtrip=false - Should return trails with roundtrip set to false", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ roundtrip: false })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {expect(trail.roundtrip).toBe(false)});
        }, 15000)   // Wait for 15 seconds
    })

    describe("Multiple filters", () => {
        test("GET /api/trails?name=Pace?distance_km=9 - Should return trails with name that contains or is similar to 'Pace' and distance greater than 9 km", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ name: "Pace", distance_km: 9 })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {
                expect(trail.name).toMatch(/pace/i)
                expect(trail.distance_km).toBeGreaterThan(9);
            });
        })
        test("GET /api/trails?ascent_m=100?descent_m=100 - Should return trails with minimum ascent of 100 m and minimum descent of 100 m", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ ascent_m: 100, descent_m: 100 })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {
                expect(trail.ascent_m).toBeGreaterThanOrEqual(100);
                expect(trail.descent_m).toBeGreaterThanOrEqual(100);
            });
        }, 15000) // Wait for 15 seconds
        test("GET /api/trails?from=Fugazze&to=Campogrosso?roundtrip=false  - Should return trails starting in 'Fugazze' and ending in 'Campogrosso' with roundtrip set to false", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ from: "Fugazze", to: "Campogrosso", roundtrip: false })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {
                expect(trail.from).toMatch(/fugazze/i);
                expect(trail.to).toMatch(/campogrosso/i);
                expect(trail.roundtrip).toBe(false);
            });
        })
        test("GET /api/trails?from=Varone&to=Prai?roundtrip=true  - Should return trails starting in 'Varone' and ending in 'Prai' with roundtrip set to true", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ from: "Varone", to: "Prai", roundtrip: true })
            expect(response.status).toBe(200);
            expect(response.body.trails.length).toBeGreaterThan(0);
            response.body.trails.forEach(trail => {
                expect(trail.from).toMatch(/varone/i);
                expect(trail.to).toMatch(/prai/i);
                expect(trail.roundtrip).toBe(true);
            });
        })
    })

    describe("Search error handling", () => {
        beforeAll(async () => {
            jest
                .spyOn(trailsService, "getTrails")
                .mockRejectedValue(new Error("DB crashed"));
        })

        afterAll(async () => {
            jest.restoreAllMocks();
        })

        test("GET /api/trails?name=Pace - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ name: "Pace" })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/trails?distance_km=10 - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ distance_km: 10 })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/trails?ascent_m=1000 - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ ascent_m: 1000 })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/trails?descent_m=500 - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ descent_m: 500 })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/trails?duration_h=6 - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ duration_h: 6 })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/trails?from=Mattarello - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ from: "Mattarello" })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/trails?to=Campogrosso - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ to: "Campogrosso" })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/trails?roundtrip=true - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ roundtrip: true })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/trails?roundtrip=false - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/trails")
                .query({ roundtrip: false })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })
})

describe("POI search end points", () => {
    beforeAll(async () => {
        // Ensure DB is connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
    });

    afterAll(async () => {
        // Close DB connection
        await mongoose.connection.close();
    })

    describe("Single filters", () => {
        test("GET /api/pis?name=Palone - Should return POI with name similar or that contains 'Palone'", async () => {
            const response = await request(app)
                .get("/api/pis")
                .query({ name: "Palone" })
            expect(response.status).toBe(200);
            expect(response.body.PIs.length).toBeGreaterThan(0);
            response.body.PIs.forEach(poi => {expect(poi.name).toMatch(/palone/i)});
        })

        test("GET /api/pis?name=RandomName - Should return 200 and 0 results", async () => {
            const response = await request(app)
                .get("/api/pis")
                .query({ name:"RandomName" })
            expect(response.status).toBe(200);
            expect(response.body.PIs.length).toBe(0);
        })

        test("GET /api/pis?shelter_type=picnic - Should return POI with shelter type 'picnic' or similar", async () => {
            const response = await request(app)
                .get("/api/pis")
                .query({ shelter_type: "picnic" })
            expect(response.status).toBe(200);
            expect(response.body.PIs.length).toBeGreaterThan(0);
            response.body.PIs.forEach(poi => {expect(poi.shelter_type).toMatch(/picnic/i)});
        })
    })

    describe("Multiple filters", () => {
        test("GET /api/pis?name=Antonio&shelter_type=picnic - Should return POI with name similar or that contains 'Antonio' and shelter type 'picnic'", async () => {
            const response = await request(app)
                .get("/api/pis")
                .query({ name: "Antonio", shelter_type: "picnic" })
            expect(response.status).toBe(200);
            expect(response.body.PIs.length).toBeGreaterThan(0);
            response.body.PIs.forEach(poi => {
                expect(poi.name).toMatch(/antonio/i);
                expect(poi.shelter_type).toMatch(/picnic/i);
            });
        })
    })

    describe("Search error handling", () => {
        beforeAll(async () => {
            jest
                .spyOn(pisService, "getPIs")
                .mockRejectedValue(new Error("DB crashed"));
        })

        afterAll(async () => {
            jest.restoreAllMocks();
        })

        test("GET /api/pis?name=Palone - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/pis")
                .query({ name: "Palone" })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/pis?shelter_type=picnic - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/pis")
                .query({ shelter_type: "picnic" })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })

        test("GET /api/pis?shelter_type=picnic&name=Antonio - Should return 500 on service failure", async () => {
            const response = await request(app)
                .get("/api/pis")
                .query({ shelter_type: "picnic", name: "Antonio" })
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        })
    })
})
