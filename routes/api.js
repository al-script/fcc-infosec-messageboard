"use strict";

module.exports = function (app) {
  const { v4: uuidv4, validate } = require("uuid");

  const bcrypt = require("bcrypt");
  const saltRounds = 10;

  // Common supporting functions
  const getNewId = () => {
    return uuidv4();
  };

  const getCurrentDateString = () => {
    return new Date().toUTCString();
  };

  const escapeHtml = (input) => {
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
      "`": "&#x60;",
      "=": "&#x3D;",
    };

    const escapeValues = /[&<>"'/`=]/g;
    return input.replace(escapeValues, (e) => {
      return escapeMap[e];
    });
  };

  function createBoardIfUndefined(boardName, currentTime) {
    if (!forumDatabase[boardName]) {
      currentTime = currentTime || getCurrentDateString();
      forumDatabase[boardName] = {
        title: boardName,
        createdOn: currentTime,
        lastReply: currentTime,
        threads: [],
      };
    }
  }

  // Test forum database. Using JS object to avoid having to monitor and periodically flush potentially inflammatory posts
  const testDate = getCurrentDateString();
  const testPasswordHashed =
    "$2b$10$aRYFZIJdFaKrzLhQXohPDuJF2fYCfu2Ylz9rY4j0DMwhaqROhBU7u";

  let forumDatabase = {
    test: {
      title: "test",
      createdOn: testDate,
      lastReply: testDate,
      threads: [
        {
          _id: "id",
          text: "text",
          created_on: testDate,
          bumped_on: testDate,
          reported: false,
          delete_password: testPasswordHashed,
          replies: [
            {
              _id: "reply1",
              text: "reply text",
              created_on: testDate,
              delete_password: testPasswordHashed,
              reported: false,
            },
            {
              _id: "reply2",
              text: "reply text",
              created_on: testDate,
              delete_password: testPasswordHashed,
              reported: false,
            },
            {
              _id: "reply3",
              text: "reply text",
              created_on: testDate,
              delete_password: testPasswordHashed,
              reported: false,
            },
            {
              _id: "reply4",
              text: "reply text",
              created_on: testDate,
              delete_password: testPasswordHashed,
              reported: false,
            },
          ],
        },
        {
          _id: "id2",
          text: "text2",
          created_on: testDate,
          bumped_on: testDate,
          reported: false,
          delete_password: testPasswordHashed,
          replies: [
            {
              _id: "reply1",
              text: "reply text",
              created_on: testDate,
              delete_password: testPasswordHashed,
              reported: false,
            },
            {
              _id: "reply2",
              text: "reply text",
              created_on: testDate,
              delete_password: testPasswordHashed,
              reported: false,
            },
            {
              _id: "reply3",
              text: "reply text",
              created_on: testDate,
              delete_password: testPasswordHashed,
              reported: false,
            },
          ],
        },
      ],
    },
    test2: {
      title: "test2",
      createdOn: testDate,
      lastReply: testDate,
      threads: [
        {
          _id: "id",
          text: "text",
          created_on: testDate,
          bumped_on: testDate,
          reported: false,
          delete_password: testPasswordHashed,
          replies: [
            {
              _id: "reply id",
              text: "reply text",
              created_on: testDate,
              delete_password: testPasswordHashed,
              reported: false,
            },
            {
              _id: "reply id",
              text: "reply text",
              created_on: testDate,
              delete_password: testPasswordHashed,
              reported: false,
            },
            {
              _id: "reply id",
              text: "reply text",
              created_on: testDate,
              delete_password: testPasswordHashed,
              reported: false,
            },
          ],
        },
      ],
    },
  };

  // GET index request
  app.get("/api/boards", (req, res) => {
    const requestLogPrefix = `${getNewId()} | GET INDEX REQ |`;
    console.log(requestLogPrefix, "Begin function");

    try {
      const boardList = getBoardList();
      res.status(200).json(boardList);
      console.log(requestLogPrefix, "Success");
    } catch (error) {
      console.log(requestLogPrefix, "Error");
      console.error(error);
      res.status(500).json({ error: "Error" });
    }
  });
  const getBoardList = () => {
    let boardList = [];

    for (let board in forumDatabase) {
      let title = forumDatabase[board].title;
      let lastReply = forumDatabase[board].lastReply;
      let createdOn = forumDatabase[board].createdOn;

      let threads = forumDatabase[board].threads;
      let threadCount = threads.length;

      let replyCount = 0;
      threads.forEach((thread) => {
        replyCount += thread.replies.length;
      });

      boardList.push({
        title: title,
        lastReply: lastReply,
        createdOn: createdOn,
        replyCount: replyCount,
        threadCount: threadCount,
      });
    }
    return boardList;
  };

  // You can send a GET request to /api/threads/{board}. Returned will be an array of the most recent 10 bumped threads on the board with only the most recent 3 replies for each. The reported and delete_password fields will not be sent to the client.
  app.get("/api/threads/:board", (req, res) => {
    const requestLogPrefix = `${getNewId()} | GET BOARD REQ |`;
    console.log(requestLogPrefix, "Begin function");

    const validateRequest = () => {
      if (
        req.params.board &&
        typeof req.params.board == "string" &&
        req.params.board.length < 1000
      ) {
        let boardId = escapeHtml(req.params.board);
        return boardId;
      } else {
        return false;
      }
    };

    try {
      const validatedBoard = validateRequest();
      if (!validatedBoard) {
        console.log(requestLogPrefix, "Validation: Failure");
        res.status(400).json({ error: "Bad Request" });
        return false;
      } else {
        const board = getBoard(validatedBoard, requestLogPrefix);
        res.status(200).json(board);
        console.log(requestLogPrefix, "Success |", "Name:", validatedBoard);
      }
    } catch (error) {
      console.log(requestLogPrefix, "Error");
      console.error(error);
      res.status(500).json({ error: "Error" });
    } finally {
      return;
    }
  });
  const getBoard = (board_id, requestLogPrefix) => {
    try {
      createBoardIfUndefined(board_id);
      // TODO: more efficient way to handle this rather than making a copy of the entire board each time...?
      const boardCopy = JSON.parse(
        JSON.stringify(forumDatabase[board_id].threads)
      );
      boardCopy.sort(
        (a, b) => Date.parse(b.bumped_on) - Date.parse(a.bumped_on)
      ); // descending order, most recent first; parsing date string
      boardCopy.splice(10);
      boardCopy.forEach((thread) => {
        thread.replyCount = thread.replies.length;
        delete thread.delete_password;
        delete thread.reported;
        thread.replies.splice(0, thread.replies.length - 3);
        thread.replies.forEach((reply) => {
          delete reply.delete_password;
          delete reply.reported;
        });
      });
      return boardCopy;
    } catch (error) {
      console.log(requestLogPrefix, "Failure: Bad board name");
      throw new Error(requestLogPrefix, "Failure: Bad board name");
    }
  };

  // You can send a POST request to /api/threads/{board} with form data including text and delete_password. The saved database record will have at least the fields _id, text, created_on(date & time), bumped_on(date & time, starts same as created_on), reported (boolean), delete_password, & replies (array).
  app.post("/api/threads/:board", (req, res) => {
    const requestLogPrefix = `${getNewId()} | POST THREAD REQ |`;
    console.log(requestLogPrefix, "Begin function");

    const validateRequest = () => {
      const thread_text = req.body.thread_text || req.body.text;
      if (
        // Check existance
        req.params.board &&
        thread_text &&
        req.body.delete_password &&
        // Check types
        typeof req.params.board == "string" &&
        typeof thread_text == "string" &&
        typeof req.body.delete_password == "string" &&
        // Check lengths
        req.params.board.length < 101 &&
        req.params.board.length > 3 &&
        thread_text.length < 255 &&
        thread_text.length > 3 &&
        req.body.delete_password.length < 255 &&
        req.body.delete_password.length > 3
      ) {
        // Escape and return the inputs
        let boardId, threadText, deletePassword;
        boardId = escapeHtml(req.params.board);
        threadText = escapeHtml(thread_text);
        deletePassword = req.body.delete_password;
        return [boardId, threadText, deletePassword];
      } else {
        return false; // ends the parent function
      }
    };

    try {
      const validated = validateRequest();
      if (!validated) {
        console.log(requestLogPrefix, "Validation: False");
        res.status(400).json({ error: "Bad Request" });
        return false;
      } else {
        const [boardId, threadText, deletePassword] = validated;
        postThread(boardId, threadText, deletePassword);
        res.status(200).json({ message: "Thread posted" });
        console.log(requestLogPrefix, "Success");
      }
    } catch (error) {
      console.log(requestLogPrefix, "Error");
      console.error(error);
      res.status(500).json({ error: error.message });
      return false;
    } finally {
      return;
    }
  });
  const postThread = (boardId, threadText, deletePassword) => {
    try {
      const currentTime = getCurrentDateString();

      createBoardIfUndefined(boardId, currentTime);

      bcrypt.hash(deletePassword, saltRounds, function (err, hash) {
        forumDatabase[boardId].threads.push({
          _id: getNewId(),
          text: threadText,
          created_on: currentTime,
          bumped_on: currentTime,
          reported: false,
          delete_password: hash,
          replies: [],
        });
      });
      // TODO: do I want to update the board to have a lastReply for this time?
      // forumDatabase[board_id].lastReply = currentTime;
    } catch (error) {
      console.log(requestLogPrefix, "Posting reply failed");
      throw new Error(requestLogPrefix, "Posting reply failed");
    }
  };

  // GET request to view thread /api/replies/{board}?thread_id={thread_id}
  app.get("/api/replies/:board", (req, res) => {
    const requestLogPrefix = `${getNewId()} | GET THREAD REQ |`;
    console.log(requestLogPrefix, "Begin function");

    const validateRequest = () => {
      if (
        req.params.board &&
        req.query.thread_id &&
        typeof req.params.board == "string" &&
        typeof req.query.thread_id == "string"
      ) {
        let board_id, thread_id;
        board_id = escapeHtml(req.params.board);
        thread_id = escapeHtml(req.query.thread_id);
        return [board_id, thread_id];
      } else {
        return false;
      }
    };

    try {
      const validated = validateRequest();
      if (!validated) {
        console.log(requestLogPrefix, "Validation: Failure");
        res.status(400).json({ error: "Bad Request" });
        return false;
      } else {
        const [board_id, thread_id] = validated;
        console.log(
          requestLogPrefix,
          "Viewing thread:",
          thread_id,
          "on",
          board_id
        );
        const thread = getThread(board_id, thread_id, requestLogPrefix);
        res.status(200).json(thread);
        console.log(requestLogPrefix, "Success");
      }
    } catch (error) {
      console.log(requestLogPrefix, "Error");
      console.error(error);
      res.status(500).json({ error: error.message });
      return false;
    } finally {
      return;
    }
  });
  const getThread = (board_id, thread_id, requestLogPrefix) => {
    try {
      createBoardIfUndefined(board_id);
      const threadCopy = JSON.parse(
        JSON.stringify(
          forumDatabase[board_id].threads.filter(
            (thread) => thread._id === thread_id
          )[0]
        )
      );
      threadCopy.replyCount = threadCopy.replies.length;
      delete threadCopy.delete_password;
      delete threadCopy.reported;
      threadCopy.replies.forEach((reply) => {
        delete reply.delete_password;
        delete reply.reported;
      });
      return threadCopy;
    } catch (error) {
      console.log(requestLogPrefix, "Bad thread");
      throw new Error(requestLogPrefix, "Bad thread");
    }
  };

  // You can send a PUT request to /api/replies/{board} and pass along the thread_id & reply_id. Returned will be the string reported. The reported value of the reply_id will be changed to true.
  app.put("/api/replies/:board", (req, res) => {
    const requestLogPrefix = `${getNewId()} | PUT REPORT REPLY REQ |`;
    console.log(requestLogPrefix, "Begin function");

    const validateRequest = () => {
      if (
        req.params.board &&
        req.body.thread_id &&
        req.body.reply_id &&
        typeof req.params.board == "string" &&
        typeof req.body.thread_id == "string" &&
        typeof req.body.reply_id == "string"
      ) {
        let board_id, thread_id, reply_id;
        board_id = escapeHtml(req.params.board);
        thread_id = escapeHtml(req.body.thread_id);
        reply_id = escapeHtml(req.body.reply_id);
        return [board_id, thread_id, reply_id];
      } else {
        return false;
      }
    };

    try {
      const validated = validateRequest();
      if (!validated) {
        console.log(requestLogPrefix, "Validation: failed");
        res.status(400).json({ error: "Bad Request" });
        return false;
      } else {
        const [board_id, thread_id, reply_id] = validated;
        handleReportReply(board_id, thread_id, reply_id, requestLogPrefix);
        res.status(200).send("reported");
        console.log(requestLogPrefix, "Success");
      }
    } catch (error) {
      console.log(requestLogPrefix, "Error");
      console.error(error);
      res.status(500).json({ error: error.message });
      return false;
    } finally {
      return;
    }
  });
  const handleReportReply = (
    board_id,
    thread_id,
    reply_id,
    requestLogPrefix
  ) => {
    // TODO: Lot of time complexity here, is it possible to setup the db so can directly access the index of these? *** what are the tradeoffs of that?
    try {
      createBoardIfUndefined(board_id);
      forumDatabase[board_id].threads
        .filter((thread) => thread._id === thread_id)[0]
        .replies.map((reply) => {
          if (reply._id === reply_id) {
            reply.reported = true;
          }
        });
    } catch (error) {
      console.log(requestLogPrefix, "Reply/thread not found");
      throw new Error("Bad reply/thread");
    }
  };

  // You can send a PUT request to /api/threads/{board} and pass along the thread_id. Returned will be the string reported. The reported value of the thread_id will be changed to true.
  app.put("/api/threads/:board", (req, res) => {
    const requestLogPrefix = `${getNewId()} | PUT REPORT THREAD REQ |`;
    console.log(requestLogPrefix, "Begin function");

    const validateRequest = () => {
      if (
        req.params.board &&
        typeof req.params.board == "string" &&
        req.body.thread_id &&
        typeof req.body.thread_id == "string" &&
        req.params.board.length < 101 &&
        req.params.board.length > 3
      ) {
        let board_id, thread_id;
        board_id = escapeHtml(req.params.board);
        thread_id = escapeHtml(req.body.thread_id);
        return [board_id, thread_id];
      } else {
        return false;
      }
    };

    try {
      const validated = validateRequest();
      if (!validated) {
        console.log(requestLogPrefix, "Validation: False");
        res.status(400).json({ error: "Bad Request" });
        return false;
      } else {
        console.log(requestLogPrefix, "Validation: True");
        const [board_id, thread_id] = validated;

        handleReportThread(board_id, thread_id, requestLogPrefix);

        res.status(200).send("reported");
        console.log(requestLogPrefix, "Success");
      }
    } catch (error) {
      console.log(requestLogPrefix, "Error");
      console.error(error);
      res.status(500).json({ error: error.message });
    } finally {
      return;
    }
  });
  const handleReportThread = (board_id, thread_id, requestLogPrefix) => {
    // TODO: Lot of time complexity here, is it possible to setup the db so can directly access the index of these? *** what are the tradeoffs of that?

    try {
      createBoardIfUndefined(board_id);
      // Use some instead?
      forumDatabase[board_id].threads.map((thread) => {
        if (thread._id === thread_id) {
          return (thread.reported = true);
        }
      });
    } catch (error) {
      console.log(requestLogPrefix, "Bad thread/board");
      throw new Error(requestLogPrefix, "Bad thread/board");
    }
  };

  // You can send a POST request to /api/replies/{board} with form data including text, delete_password, & thread_id. This will update the bumped_on date to the comment's date. In the thread's replies array, an object will be saved with at least the properties _id, text, created_on, delete_password, & reported.
  app.post("/api/replies/:board", (req, res) => {
    const requestLogPrefix = `${getNewId()} | POST REPLY REQ |`;
    console.log(requestLogPrefix, "Begin function");

    const validateRequest = () => {
      const reply_text = req.body.reply_text || req.body.text;
      if (
        // Check existance
        req.params.board &&
        req.body.thread_id &&
        reply_text &&
        req.body.delete_password &&
        // Check types
        typeof req.params.board == "string" &&
        typeof req.body.thread_id == "string" &&
        typeof reply_text == "string" &&
        typeof req.body.delete_password == "string" &&
        // Check lengths
        // TODO: check thread_id length?
        // TODO: make sure are handling correct lengths
        req.params.board.length < 101 &&
        req.params.board.length > 3 &&
        reply_text.length < 255 &&
        reply_text.length > 3 &&
        req.body.delete_password.length < 255 &&
        req.body.delete_password.length > 3
      ) {
        let boardId, threadId, replyText, deletePassword;
        boardId = escapeHtml(req.params.board);
        threadId = escapeHtml(req.body.thread_id);
        replyText = escapeHtml(reply_text);
        deletePassword = req.body.delete_password;
        return [boardId, threadId, replyText, deletePassword];
      } else {
        return false; // ends the parent function
      }
    };

    try {
      const validated = validateRequest();
      if (!validated) {
        console.log(requestLogPrefix, "Validation: False");
        res.status(400).json({ error: "Bad Request" });
        return false;
      } else {
        const [boardId, threadId, replyText, deletePassword] = validated;
        postReply(boardId, threadId, replyText, deletePassword);
        res.status(200).json({ message: "Reply posted" });
        console.log(requestLogPrefix, "Success");
      }
    } catch (error) {
      console.log(requestLogPrefix, "Error");
      console.error(error);
      res.status(500).json({ error: error.message });
      return false;
    } finally {
      return;
    }
  });
  const postReply = (
    board_id,
    thread_id,
    reply_text,
    delete_password,
    requestLogPrefix
  ) => {
    try {
      createBoardIfUndefined(board_id);
      const currentTime = getCurrentDateString();
      const targetThread = forumDatabase[board_id].threads.filter(
        (thread) => thread._id === thread_id
      )[0];

      // Hash password and add reply to thread
      bcrypt.hash(delete_password, saltRounds, function (err, hash) {
        targetThread.replies.push({
          _id: getNewId(),
          text: reply_text,
          created_on: currentTime,
          delete_password: hash,
          reported: false,
        });
      });

      // Update thread and board to reflect the newly created reply's creation time
      targetThread.bumped_on = currentTime;
      forumDatabase[board_id].lastReply = currentTime;
    } catch {
      throw new Error(requestLogPrefix, "Posting reply failed");
    }
  };

  // You can send a DELETE request to /api/replies/{board} and pass along the thread_id, reply_id, & delete_password. Returned will be the string incorrect password or success. On success, the text of the reply_id will be changed to [deleted].
  app.delete("/api/replies/:board", (req, res) => {
    const requestLogPrefix = `${getNewId()} | DELETE REPLY REQ |`;
    console.log(requestLogPrefix, "Begin function");

    const validateRequest = () => {
      if (
        req.params.board &&
        typeof req.params.board == "string" &&
        req.body.thread_id &&
        typeof req.body.thread_id == "string" &&
        req.body.reply_id &&
        typeof req.body.reply_id == "string" &&
        req.body.delete_password &&
        typeof req.body.delete_password == "string" &&
        req.params.board.length < 101 &&
        req.params.board.length > 3 &&
        req.body.delete_password.length < 255 &&
        req.body.delete_password.length > 3
      ) {
        let board_id, thread_id, reply_id, delete_password;
        board_id = escapeHtml(req.params.board);
        thread_id = escapeHtml(req.body.thread_id);
        reply_id = escapeHtml(req.body.reply_id);
        delete_password = req.body.delete_password;
        return [board_id, thread_id, reply_id, delete_password];
      } else {
        return false;
      }
    };

    try {
      const validated = validateRequest();
      if (!validated) {
        console.log(requestLogPrefix, "Validation: False");
        res.status(400).json({ error: "Bad Request" });
        return false;
      } else {
        const [board_id, thread_id, reply_id, delete_password] = validated;
        console.log(requestLogPrefix, "Validation: True");

        const reply_hash = forumDatabase[board_id].threads
          .filter((thread) => thread._id === thread_id)[0]
          .replies.filter((reply) => reply._id === reply_id)[0].delete_password;

        bcrypt.compare(delete_password, reply_hash, function (err, result) {
          if (!result) {
            res.status(200).send("incorrect password");
            console.log(requestLogPrefix, "Failure, incorrect password");
          } else {
            handleDeleteReply(board_id, thread_id, reply_id, requestLogPrefix);
            res.status(200).send("success");
            console.log(requestLogPrefix, "Success");
          }
          return;
        });
      }
    } catch (error) {
      console.log(requestLogPrefix, "Error");
      console.error(error);
      res.status(500).json({ error: error.message });
      return false;
    } finally {
      // console.log(requestLogPrefix, "Function end");
      return;
    }
  });
  const handleDeleteReply = (
    board_id,
    thread_id,
    reply_id,
    requestLogPrefix
  ) => {
    try {
      createBoardIfUndefined(board_id);
      forumDatabase[board_id].threads
        .filter((thread) => thread._id === thread_id)[0]
        .replies.map((reply) => {
          if (reply._id === reply_id) {
            reply.text = "[deleted]";
          }
        });
    } catch {
      throw new Error(requestLogPrefix, "Failure to delete reply");
    }
  };

  // You can send a DELETE request to /api/threads/{board} and pass along the thread_id & delete_password to delete the thread. Returned will be the string incorrect password or success.
  app.delete("/api/threads/:board", (req, res) => {
    const requestLogPrefix = `${getNewId()} | DELETE THREAD REQ |`;
    console.log(requestLogPrefix, "Begin function");

    const validateRequest = () => {
      if (
        req.params.board &&
        typeof req.params.board == "string" &&
        req.body.thread_id &&
        typeof req.body.thread_id == "string" &&
        req.body.delete_password &&
        typeof req.body.delete_password == "string" &&
        req.params.board.length < 101 &&
        req.params.board.length > 3 &&
        req.body.delete_password.length < 255 &&
        req.body.delete_password.length > 3
      ) {
        let board_id, thread_id, delete_password;
        board_id = escapeHtml(req.params.board);
        thread_id = escapeHtml(req.body.thread_id);
        delete_password = req.body.delete_password;
        return [board_id, thread_id, delete_password];
      } else {
        return false;
      }
    };

    try {
      const validated = validateRequest();
      if (!validated) {
        console.log(requestLogPrefix, "Validation: False");
        res.status(400).json({ error: "Bad Request" });
        return false;
      } else {
        const [board_id, thread_id, delete_password] = validated;
        console.log(requestLogPrefix, "Validation: True");
        console.log(
          requestLogPrefix,
          "Handling deletion request for:",
          thread_id,
          "on:",
          board_id
        );

        const thread_hash = forumDatabase[board_id].threads.filter(
          (thread) => thread._id === thread_id
        )[0].delete_password;

        bcrypt.compare(delete_password, thread_hash, function (err, result) {
          if (!result) {
            res.status(200).send("incorrect password");
            console.log(requestLogPrefix, "Failure, incorrect password");
          } else {
            handleDeleteThread(board_id, thread_id, requestLogPrefix);
            res.status(200).send("success");
            console.log(requestLogPrefix, "Success");
          }
          return;
        });
      }
    } catch (error) {
      console.log(requestLogPrefix, "Delete thread: Error");
      console.error(error);
      res.status(500).json({ error: error.message });
      return false;
    } finally {
      console.log(requestLogPrefix, "Delete thread: function end");
      return;
    }
  });
  const handleDeleteThread = (board_id, thread_id, requestLogPrefix) => {
    try {
      // Hard delete
      createBoardIfUndefined(board_id);
      forumDatabase[board_id].threads = forumDatabase[board_id].threads.filter(
        (thread) => thread._id !== thread_id
      );

      console.log(
        requestLogPrefix,
        "Deleted:",
        forumDatabase[board_id].threads.filter(
          (thread) => thread._id === thread_id
        ).length === 0
      );
    } catch {
      throw new Error(requestLogPrefix, "Failure to delete thread");
    }
  };

  return {
    getForumDatabase() {
      return forumDatabase;
    }
  }
};
