const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const api = require("../routes/api")(server);

chai.use(chaiHttp);

const testBoard = "test";
const testThread = "id";
const testThreadReplyCount = 5;
const testThreadToDelete = "id2";
const testReply = "reply1";

// TODO: check database actions, it("should properly affect the forum database")

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

    it("should properly affect the forum database", async function () {
      const forumDatabase = api.getForumDatabase()
      
    });
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
      const threads = result.body;
      // 0 - 10 threads
      assert.isAtMost(threads.length, 10);
      threads.forEach((thread) => {
        // Contains _id, text, created_on, bumped_on, replies [], replyCount, 0 - 3 replies
        assert.property(thread, "_id");
        assert.property(thread, "text");
        assert.property(thread, "created_on");
        assert.property(thread, "bumped_on");
        assert.property(thread, "replies");
        assert.isAtMost(thread.replies.length, 3);
        assert.property(thread, "replyCount");

        thread.replies.forEach((reply) => {
          // Contains _id, text, created_on
          // Does not contain reported or delete_password on replies
          assert.property(reply, "_id");
          assert.property(reply, "text");
          assert.property(reply, "created_on");
          assert.notProperty(reply, "delete_password");
          assert.notProperty(reply, "reported");
        });
      });
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

    it("should return the proper status code to the client", async function () {
      assert.equal(result.status, 200);
    });

    it("should return the proper message to the client", async function () {
      assert.equal(result.text, "incorrect password");
    });

    it("should properly affect the forum database", async function () {
      const forumDatabase = api.getForumDatabase()
      
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

    it("should properly affect the forum database", async function () {
      const forumDatabase = api.getForumDatabase()
      
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

    it("should properly affect the forum database", async function () {
      const forumDatabase = api.getForumDatabase()
      
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

    it("should properly affect the forum database", async function () {
      const forumDatabase = api.getForumDatabase()
      
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

    it("returns the proper data", function () {
      const thread = result.body;
      // Contains _id, text, created_on, bumped_on, replies [], replyCount
      assert.property(thread, "_id");
      assert.property(thread, "text");
      assert.property(thread, "created_on");
      assert.property(thread, "bumped_on");
      assert.property(thread, "replies");
      assert.equal(thread.replies.length, testThreadReplyCount);
      assert.property(thread, "replyCount");

      thread.replies.forEach((reply) => {
        // Contains _id, text, created_on
        // Does not contain reported or delete_password on replies
        assert.property(reply, "_id");
        assert.property(reply, "text");
        assert.property(reply, "created_on");
        assert.notProperty(reply, "delete_password");
        assert.notProperty(reply, "reported");
      });
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
      assert.equal(result.text, "incorrect password");
    });

    it("should properly affect the forum database", async function () {
      const forumDatabase = api.getForumDatabase()
      
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

    it("should properly affect the forum database", async function () {
      const forumDatabase = api.getForumDatabase()
      
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

    it("should properly affect the forum database", async function () {
      const forumDatabase = api.getForumDatabase()
      
    });
  });
});
