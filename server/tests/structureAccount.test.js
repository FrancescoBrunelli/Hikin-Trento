const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/index");
const ManagedStructure = require("../src/models/ManagedStructure");
const Structure = require("../src/models/Structure");

describe("Structure Account Management", () => {
  let testStructure;
  const testManagedStructure = {
    name: "Account Test Structure",
    name_owner: "Owner",
    surname_owner: "Surname",
    telephone: "+39 " + (Date.now() % 100000000),
    password: "password123",
  };

  let authToken;
  let otherStructure;
  let otherManagedStructure;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    try {
      await ManagedStructure.collection.dropIndexes();
      await ManagedStructure.syncIndexes();
    } catch (err) {}

    // Create a dummy structure
    testStructure = await Structure.create({
      odh_id: "STR_ACC_" + Date.now(),
      name: "Account Base Structure",
      coordinates: { latitude: 46.0, longitude: 11.0, altitude: 1000 },
      managed: false,
      type: "Rifugio",
    });
    testManagedStructure.Structure_id = testStructure._id.toString();

    // Register and login
    await request(app).post("/api/auth/register_structure").send(testManagedStructure);
    const loginRes = await request(app).post("/api/auth/login_structure").send({
      telephone: testManagedStructure.telephone,
      password: testManagedStructure.password,
    });
    authToken = loginRes.body.token;

    // Create another managed structure to test telephone collision
    otherStructure = await Structure.create({
      odh_id: "STR_OTHER_" + Date.now(),
      name: "Other Structure",
      coordinates: { latitude: 47.0, longitude: 12.0, altitude: 2000 },
      managed: false,
      type: "Rifugio",
    });
    otherManagedStructure = {
      name: "Other Managed Structure",
      name_owner: "OtherOwner",
      surname_owner: "OtherSurname",
      telephone: "+39 " + ((Date.now() + 1) % 100000000),
      password: "password123",
      Structure_id: otherStructure._id.toString(),
    };
    await request(app).post("/api/auth/register_structure").send(otherManagedStructure);
  });

  afterAll(async () => {
    try {
      await ManagedStructure.deleteOne({ telephone: testManagedStructure.telephone });
      await ManagedStructure.deleteOne({ telephone: "+39 888 8888888" });
      await ManagedStructure.deleteOne({ telephone: otherManagedStructure.telephone });
      if (testStructure) {
        await Structure.deleteOne({ _id: testStructure._id });
      }
      if (otherStructure) {
        await Structure.deleteOne({ _id: otherStructure._id });
      }
    } finally {
      await mongoose.connection.close();
    }
  });

  test("GET /api/managedStructure/basicInfo - should fail with invalid token", async () => {
    const response = await request(app)
      .get("/api/managedStructure/basicInfo")
      .set("Authorization", "Bearer invalidtoken");
    expect(response.status).toBe(401);
  });

  test("PUT /api/managedStructure/basicInfo - should update structure details", async () => {
    const updatedData = {
      name_owner: "NewOwner",
      surname_owner: "NewSurname",
      telephone: "+39 888 8888888"
    };
    const response = await request(app)
      .put("/api/managedStructure/basicInfo")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.managedstructure.name_owner).toBe("NewOwner");
    expect(response.body.managedstructure.telephone).toBe("+39 888 8888888");
    
    testManagedStructure.telephone = "+39 888 8888888";
  });

  test("PUT /api/managedStructure/basicInfo - should fail if telephone is already taken", async () => {
    const response = await request(app)
      .put("/api/managedStructure/basicInfo")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name_owner: "SomeOwner",
        surname_owner: "SomeSurname",
        telephone: otherManagedStructure.telephone,
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/duplicate key/i);
  });

  test("PUT /api/managedStructure/password - should fail if current password is wrong", async () => {
    const response = await request(app)
      .put("/api/managedStructure/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        curr_password: "wrongpassword",
        new_password: "NewStrPass123!",
        confirm_password: "NewStrPass123!",
      });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Current password is not correct. Try again");
  });

  test("PUT /api/managedStructure/password - should fail if new passwords do not match", async () => {
    const response = await request(app)
      .put("/api/managedStructure/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        curr_password: "password123",
        new_password: "NewStrPass123!",
        confirm_password: "MismatchedPassword!",
      });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("New password is different from confirm new password");
  });

  test("PUT /api/managedStructure/password - should update password", async () => {
    const response = await request(app)
      .put("/api/managedStructure/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        curr_password: "password123",
        new_password: "newStrPass123!",
        confirm_password: "newStrPass123!"
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    testManagedStructure.password = "newStrPass123!";
  });

  test("DELETE /api/managedStructure/account - should fail with invalid token", async () => {
    const response = await request(app)
      .delete("/api/managedStructure/account")
      .set("Authorization", "Bearer invalidtoken")
      .send({ password: testManagedStructure.password });
    expect(response.status).toBe(401);
  });

  test("DELETE /api/managedStructure/account - should fail with wrong password", async () => {
    const response = await request(app)
      .delete("/api/managedStructure/account")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ password: "wrongpassword" });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("The password is not correct");
  });

  test("DELETE /api/managedStructure/account - should delete account", async () => {
    const response = await request(app)
      .delete("/api/managedStructure/account")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ password: testManagedStructure.password });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Account deleted successfully");

    const manager = await ManagedStructure.findOne({ telephone: testManagedStructure.telephone });
    expect(manager).toBeNull();

    const structure = await Structure.findById(testStructure._id);
    expect(structure.managed).toBe(false);
  });
});
