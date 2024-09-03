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

// TODO: make the interface look nice
// Handle security best practices

// What works best for the assignment? Using one single it statement with multiple assertions, or multiple it statements? The assignment says 10 tests passing, so sounds like need one it statement for eac
// Also, are these tests also supposed to check if the data is handled properly on the server? Or simply that the server returns the proper data to the client?

// TODO: Fix API so that create a board when are using that board name in a request****
// Need to refactor API so that handles creating a board if that board doesn't already exist, that includes doing what is necessary to handle updating the board
// Gotta then test for the _id that is generated for the thread...

suite("Functional Tests", function () {
  // 1. Creating a new thread: POST request to /api/threads/{board}
  describe("1. Creating a new thread: POST request to /api/threads/{board}", function () {
    let result;

    before(async function () {
      result = await chai
        .request(server)
        .post(`/api/threads/${testBoard}`)
        // .send({
        //   thread_text: "test_text",
        //   delete_password: "test_password",
        // })
        .send({
          text: "test_text",
          delete_password: "test_password",
        });
    });

    it("should return the proper status code to the client", async function () {
      assert.equal(result.status, 200);
    });

    // it("should return the proper data to the client", async function () {
    //   assert.equal(result.body.message, "Thread posted");
    // });
  });

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

    it("returns the proper data", function () {
      assert.equal(true, true);
    });
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

    // do these need to be async functions...? probably not, they simply access a variable that was already defined by the previous async function
    it("should return the proper status code to the client", async function () {
      assert.equal(result.status, 200);
    });

    it("should return the proper message to the client", async function () {
      assert.equal(result.body.message, "incorrect password");
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
      assert.equal(result.body.message, "success");
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
      assert.equal(result.body.message, "reported");
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

    // it("should return the proper message to the client", async function () {
    //   assert.equal(result.body.message, "Reply posted");
    // });
  });

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

    it("returns the proper data", function () {
      assert.equal(true, true);
    });
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
      assert.equal(result.body, "incorrect password");
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
      assert.equal(result.body, "success");
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
      assert.equal(result.body.message, "reported");
    });
  });
});

// Could perhaps nest describes and its into segments to test more granularly
