const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const api = require("../routes/api");

chai.use(chaiHttp);

const testBoard = "test";
const testThread = "id";
const testThreadToDelete = "id2";
const testReply = "reply1";

suite("Functional Tests", function () {
  // 1. Creating a new thread: POST request to /api/threads/{board}
  describe("1. Creating a new thread: POST request to /api/threads/{board}", function () {
    let result;

    before(async function () {
      result = await chai
        .request(server)
        .post(`/api/threads/${testBoard}`)
        .send({
          text: "test_text",
          delete_password: "test_password",
        });
    });

    it("should return the proper status code to the client", async function () {
      assert.equal(result.status, 200);
    });

    it("should return the proper data to the client", async function () {
      assert.equal(result.body.message, "Thread posted");
    });
  });

  // TODO: make sure returns proper data
  // 2. Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}
  describe("2. Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function () {
    let result;

    before(async function () {
      result = await chai
        .request(server)
        .get(`/api/threads/${testBoard}`)
        .send();
    });

    it("returns the proper status code to client", async function () {
      assert.equal(result.status, 200);
    });

    // it("returns the proper data", function () {
    // });
  });

  // 3. Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password
  describe("3. Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", function () {
    let result;

    before(async function () {
      result = await chai
        .request(server)
        .delete(`/api/threads/${testBoard}`)
        .send({
          thread_id: testThreadToDelete,
          delete_password: "incorrect_password",
        });
    });

    it("should return the proper status code to the client", async function () {
      assert.equal(result.status, 200);
    });

    it("should return the proper message to the client", async function () {
      assert.equal(result.text, "incorrect password");
    });
  });

  // 4. Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password
  describe("4. Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", function () {
    let result;

    before(async function () {
      result = await chai
        .request(server)
        .delete(`/api/threads/${testBoard}`)
        .send({
          thread_id: testThreadToDelete,
          delete_password: "password",
        });
    });

    it("should return the proper status code to the client", async function () {
      assert.equal(result.status, 200);
    });

    it("should return the proper message to the client", async function () {
      assert.equal(result.text, "success");
    });
  });

  // 5. Reporting a thread: PUT request to /api/threads/{board}
  describe("5. Reporting a thread: PUT request to /api/threads/{board}", function () {
    let result;

    before(async function () {
      result = await chai
        .request(server)
        .put(`/api/threads/${testBoard}`)
        .send({
          thread_id: testThread,
        });
    });

    it("should return the proper status code to the client", async function () {
      assert.equal(result.status, 200);
    });

    it("should return the proper message to the client", async function () {
      assert.equal(result.text, "reported");
    });
  });

  // 6. Creating a new reply: POST request to /api/replies/{board}
  describe("6. Creating a new reply: POST request to /api/replies/{board}", function () {
    let result;

    before(async function () {
      result = await chai
        .request(server)
        .post(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThread,
          reply_text: "test_reply",
          delete_password: "test_password",
        });
    });

    it("should return the proper status code to the client", async function () {
      assert.equal(result.status, 200);
    });

    it("should return the proper message to the client", async function () {
      assert.equal(result.body.message, "Reply posted");
    });
  });

  // TODO: make sure returns proper data
  // 7. Viewing a single thread with all replies: GET request to /api/replies/{board}
  describe("7. Viewing a single thread with all replies: GET request to /api/replies/{board}", function () {
    let result;

    before(async function () {
      result = await chai
        .request(server)
        .get(`/api/replies/${testBoard}`)
        .query({ thread_id: testThread })
        .send(); // .send() necessary?
    });

    it("returns the proper response to the client", async function () {
      assert.equal(result.status, 200);
    });

    // it("returns the proper data", function () {
    // });
  });

  // 8. Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password
  describe("8. Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", function () {
    let result;

    before(async function () {
      result = await chai
        .request(server)
        .delete(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThread,
          reply_id: testReply,
          delete_password: "incorrect_password",
        });
    });

    it("should return the proper status code to the client", async function () {
      assert.equal(result.status, 200);
    });

    it("should return the proper message to the client", async function () {
      assert.equal(result.text, "incorrect password");
    });
  });

  // 9. Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password
  describe("9. Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", function () {
    let result;

    before(async function () {
      result = await chai
        .request(server)
        .delete(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThread,
          reply_id: testReply,
          delete_password: "password",
        });
    });

    it("should return the proper status code to the client", async function () {
      assert.equal(result.status, 200);
    });

    it("should return the proper message to the client", async function () {
      assert.equal(result.text, "success");
    });
  });

  // 10. Reporting a reply: PUT request to /api/replies/{board}
  describe("10. Reporting a reply: PUT request to /api/replies/{board}", function () {
    // const replyToReport = "reply1"; // using testReply variable now, even though deleted in eariler test, report functionality still works if deleted, hmm...

    let result;

    before(async function () {
      result = await chai
        .request(server)
        .put(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThread,
          reply_id: testReply,
        });
    });

    it("returns the proper status code to client", async function () {
      assert.equal(result.status, 200);
    });

    it("returns the proper data to the client", async function () {
      assert.equal(result.text, "reported");
    });
  });
});

// Could perhaps nest describes and its into segments to test more granularly
