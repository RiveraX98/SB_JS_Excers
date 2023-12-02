/** Tests for invoices. */

process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const { createData } = require("./_test-setup");
const db = require("../db");

beforeEach(createData);

afterAll(async () => {
  await db.end();
});

describe("GET /", function () {
  test("Should get all invoices", async function () {
    const response = await request(app).get("/invoices");
    expect(response.body).toEqual({
      invoices: [
        { id: 1, comp_code: "apple" },
        { id: 3, comp_code: "ibm" },
      ],
    });
  });
});

describe("GET /1", function () {
  test("Should return specified invoice info", async function () {
    const response = await request(app).get("/invoices/1");
    expect(response.body).toEqual({
      invoice: {
        id: 1,
        comp_code: "apple",
        amt: 200,
        paid: true,
        add_date: "2018-02-01",
        paid_date: "2018-02-02",
        company: {
          code: "apple",
          name: "Apple Computer",
          description: "Maker of OSX.",
        },
      },
    });
  });

  test("It should return 404 for invalid invoice", async function () {
    const response = await request(app).get("/invoices/999");
    expect(response.status).toEqual(404);
  });
});

describe("POST /", function () {
  test("Should create an invoice", async function () {
    const response = await request(app)
      .post("/invoices")
      .send({ amt: 400, comp_code: "ibm" });

    expect(response.body).toEqual({
      invoice: {
        id: 4,
        comp_code: "ibm",
        amt: 400,
        add_date: expect.any(String),
        paid: false,
        paid_date: null,
      },
    });
  });
});

describe("PATCH /", function () {
  test("Should update an existing invoice", async function () {
    const response = await request(app)
      .put("/invoices/1")
      .send({ amt: 1000, paid: false });

    expect(response.body).toEqual({
      invoice: {
        id: 1,
        comp_code: "apple",
        paid: false,
        amt: 1000,
        add_date: expect.any(String),
        paid_date: null,
      },
    });
  });

  test("Should return 404 for a non-existing invoice", async function () {
    const response = await request(app)
      .put("/invoices/9999")
      .send({ amt: 1000 });

    expect(response.status).toEqual(404);
  });
});

describe("DELETE /", function () {
  test("Should delete specified invoice", async function () {
    const response = await request(app).delete("/invoices/1");

    expect(response.body).toEqual({ status: "Deleted" });
  });

  test("It should return 404 for no-such-invoices", async function () {
    const response = await request(app).delete("/invoices/999");

    expect(response.status).toEqual(404);
  });
});
