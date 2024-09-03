"use strict";
// TODO:
// Handle reporting error back to client, what is the best practice? Return error.message or could that be used as an exploit?
// Password encrpytion and good data handling practices
// Handle remaining vailidation on client side, for all views
// Redo the db so that store things by ID so dont have to iterate over everything, change how functions work as well
// Redo the db so that dont need to make a shallow copy of it every time perform certain functions, handle that in a way that can scale
// TODO: perhaps prepend a code to each request for the type as well as a code that is generated for each request so can keep track of which set of logs are for what request ************
// Enforce better password requirements
// Handle having too many requests at once
// Use unique ID prefixes for logging all requests
// Add refresh button and other UI tweaks to the destructive actions on clientside

// |||||||||||||||||

// NEVERMIND, DONT NEED TO ESCAPE THE ID BUT PERHAPS NEED TO ESCAPE THE THREAD NAMES AND OTHER USER SUBMITTED VALUES ON CREATION!
// MAKE SURE ESCAPING USER SUBMITTED NAMES AND TEXT AND THAT PASSWORD IS SUBMITTED PROPERLY AND THEN SANTIZIED AND RETURNED WITH PROPER ERROR MESSAGE IF ARENT ABLE TO STORE THE PASSWORD DUE TO INVALIDATION ON THE SERVER!
// TODO: FIX ESCAPING GENERATED IDS!!!!!!!!!!! probably simply need to escape them upon creation *****************
// if dont escape them, will they ever generate something that needs to be escaped...? doesn't seem like it
// make sure understand what is escaped, proabably not alphas and -
// See how that works

// Password encrptions and decryption and safe handling when requesting from client
// Handle validating and sanitizing and only allowing to submit if proper format, handle those best practices, make sure works with whatever tests the test suite will run on fccs side

// TODO: client-side: make sure only able to submit with proper format, do some soft sanitizing and formatting on client-side

// TODO: add a function that populates the forum with test data from a corpus

// TODO: break into modules?
// Make it clear which section is which, make nice and easy to navigate

// TODO: sanitize and format each request:
// make sure the request is in the proper format, eg. the object with proper fields
// make sure those fields are in the proper format
// make sure that the format that they are in is handled properly throughout the process that it can't be used to execute malicious code, eg if is a string make sure the string isn't executed in such a way that a sql command within the string could be executed or otherwise a hidden command in the string that attemps to 'break out' of the sting and execute commands on the server

// Start from scratch, no need to use the boilerplate code for the forum, make it something pleasing to use
// Start with the basic framework and design for each and create a function that populates each element based on an object
// that can be generated using the post request

// TODO: learn how need to use app.route and app.get etc... in combination
// Be careful of path, leading /

// TODO: reformat board such that everything can be easily accessed by index instead of filter and map, use ID as the index, and then when returning the data in api gotta reshape it so is returned properly
// TODO: add library for generating uuids
// TODO: add try catch to everything that may error out, find best practices for this, best practices for handling functions that may fail and how to structure if statements around those to catch the failure, handle how to return the failure to a function above it as well as structure entire function chain to handle that in a graceful way
// TODO: use proper error codes
// TODO: handle encrpyting passwords
// TODO: handle everything securely, don't reveal anything to user or admins that don't need to

// TODO: nice pleasing interface, material design
// Security best practices

// TODO: if load board, return list of threads
// TODO: if load index, return list of boards, perhaps alphabetical or in order of bumps or something that make sense

// TODO: perhaps could have a single validate function where pass in the validation paramters eg: [toValidate, {type: 'string', minLength: 5, etc...}] and then return the validated data

// |||||||||||||||||

// TODO: handle escaping the thread title and board title when creating them **** and then unescape them safely for display, is that possible or does that happen automatically inthe html...?
// TODO: give ability to create a new board
// TODO: make sure everything has error handling
// TODO: make sure everything in a nice consistent neat format
// TODO: perhaps document the format that are using

// TODO: use mySql, proper database structure, proper CRUD procedure
// TODO: all nice and clean and readable and best practices

// TODO: handle ddos etc... too many requests

// TODO: handle thread text not title

// TODO: handle creating boards and in such a way where if multiple words then doesn't break the api requests

// TODO: fix inconsistent naming camel vs _

module.exports = function (app) {
  const { v4: uuidv4, validate } = require("uuid");
  const getNewId = () => {
    return uuidv4();
  };

  // store as date string or date object?
  const getCurrentDateString = () => {
    return new Date().toUTCString();
  };

  const bcrypt = require("bcrypt");
  const saltRounds = 10;

  // TODO: fix so is actually escaping.... ***************
  const escapeHtml = (input) => {
    // double check these
    // need to escape \?
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

    // this the best way to handle the regex replacement? ***
    const escapeValues = /[&<>"'/`=]/g;
    return input.replace(escapeValues, (e) => {
      return escapeMap[e];
    });
  };

  let testDate = getCurrentDateString();
  let testPasswordHashed =
    "$2b$10$aRYFZIJdFaKrzLhQXohPDuJF2fYCfu2Ylz9rY4j0DMwhaqROhBU7u";

  // Test forum database. Using JS object to avoid having to keep a db perpetually active
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

  async function createBoardIfUndefined(boardName, currentTime) {
    if (!forumDatabase[boardName]) {
      console.log("creating new board");
      currentTime = currentTime || getCurrentDateString();
      forumDatabase[boardName] = {
        title: boardName,
        createdOn: currentTime,
        lastReply: currentTime,
        threads: [],
      };
    }
  }

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
      // Is it safe to send the error message itself from the server...? Perhaps just send some canned error response instead ***
      // res.status(500).json({ error: error.message });
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

    // Make sure handle escaping when creating the board name ****
    // How are handling the creation of a thread? Are making sure that the board exists? are creating it if it doesnt? ******
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
      // Do need to include the prefix here if are also displaying this error with the prefix above?
      console.log(requestLogPrefix, "Failure: Bad board name");
      throw new Error(requestLogPrefix, "Failure: Bad board name");
    }
  };

  // TODO: handle thread content in addition to title
  // You can send a POST request to /api/threads/{board} with form data including text and delete_password. The saved database record will have at least the fields _id, text, created_on(date & time), bumped_on(date & time, starts same as created_on), reported (boolean), delete_password, & replies (array).
  app.post("/api/threads/:board", (req, res) => {
    const requestLogPrefix = `${getNewId()} | POST THREAD REQ |`;
    console.log(requestLogPrefix, "Begin function");

    // make sure in proper format, make sure then format it properly
    // if able to be formatted then return the formatted values and work with those values
    // if not able to be formatted properly then return an error to client and do nothing else with the data, perhaps log the request somewhere

    // **** IMPLIMENT ON CLIENT: Limit max/min length on clientside and enforce here, as well as acceptable characters, tell the limit and give a pop up or other status that says that are using restricted characters and to try again and give what the unacceptable character list is ****

    // any way to sanitize a request before it even hits the route? in between? like automatically throw away any bad requests eg those over a certain length and with certain types?

    // NEW METHOD:
    const validateRequest = () => {
      const thread_text = req.body.thread_text || req.body.text;
      if (
        // Do also need to check that no other params and body etc... exist? Probably not if aren't doing anythign with them, but perhaps there is something that can be executed without referencing it that need to be mindful of?
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
        // TODO: handle escaping password, restrict characters in such a way that cannot be used for an attack, or find whatever the best practices are ***
        let boardId, threadText, deletePassword;
        boardId = escapeHtml(req.params.board);
        threadText = escapeHtml(thread_text);
        // *************** TODO: ENFORCE SYMBOL RULES AND MAKE SURE NOT AN INJECTION ATTACK VECTOR****
        // deletePassword = escapeHtml(req.body.delete_password); // hmmmmmm perhaps dont do it for the password, but how then handle if the password is some sort of injection attack? ***********
        deletePassword = req.body.delete_password;
        return [boardId, threadText, deletePassword];
      } else {
        return false; // ends the parent function
      }
    };

    // Perhaps try catch isnt the best practice, because results in a false not an error, but perhaps it is best because it aligns with the request being in error...? but then make sure that returning false in the else makes sense, and that isnt a more readable way to handle that logic

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
  // TODO: FIX inconsistent boardId and board_id
  const postThread = (board_id, thread_text, delete_password) => {
    try {
      const currentTime = getCurrentDateString();

      createBoardIfUndefined(board_id, currentTime);

      bcrypt.hash(delete_password, saltRounds, function (err, hash) {
        forumDatabase[board_id].threads.push({
          _id: getNewId(),
          text: thread_text,
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

  // ****************************
  // TODO: TIDY UP and use consistent naming scheme and add in password encryption/decryption and add proper comments
  // Add way to create new board
  // Add way to populate board with random data programatically
  // Create an admin system to administer board
  // Add features to protect the board against attacks, ensure that user is not overflowing the requests, etc...
  // Add feature to allow to distrubte resources and scale
  // Make sure can throttle or handle high volumes of requests

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
  // TODO: FIX ESCAPING GENERATED IDS!!!!!!!!!!! probably simply need to escape them upon creation *****************
  // make sure are checking the reply length against the possible reply length **** what is max possible length of id generated by current methods?
  // Make sure that are escaping the ID when are creating it so that will align with the escaping process here ********************** make sure the escaping process wont conflict with the id generation
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
        res.status(200).json({ message: "reported" });
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
    // TODO: handle checking if reply_id even exists and if not then return an error
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

      // Checking if reported
      // forumDatabase[board_id].threads
      //   .filter((thread) => thread._id === thread_id)[0]
      //   .replies.map((reply) => {
      //     if (reply._id === reply_id) {
      //       console.log(reply);
      //     }
      //   });
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

        res.status(200).json({ message: "reported" });
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
    // TODO: handle checking if thread even exists and if not then return an error
    // TODO: Lot of time complexity here, is it possible to setup the db so can directly access the index of these? *** what are the tradeoffs of that?
    // how can end the map? doesn't seem like can, so is there any reason to use return?
    // probably need to put this in a try/catch block *************

    try {
      createBoardIfUndefined(board_id);
      forumDatabase[board_id].threads.map((thread) => {
        if (thread._id === thread_id) {
          return (thread.reported = true);
        }
      });

      // TEST:
      // forumDatabase[board_id].threads.map((thread) => {
      //   if (thread._id === thread_id) {
      //     console.log("Reported:", thread.reported);
      //   }
      // });
    } catch (error) {
      console.log(requestLogPrefix, "Bad thread/board");
      throw new Error(requestLogPrefix, "Bad thread/board");
    }
  };

  // ||||| REPLY ROUTES AND SUPPORTING FUNCTIONS |||||
  // | TODOS:
  // Need to enforce a length for reply_id and thread_id?
  // TODO: use consistent naming schemes
  // *************** TODO: ENFORCE SYMBOL RULES AND MAKE SURE NOT AN INJECTION ATTACK VECTOR****
  // deletePassword = escapeHtml(req.body.delete_password); // hmmmmmm perhaps dont do it for the password, but how then handle if the password is some sort of injection attack? ***********
  // Escape and return the inputs
  // TODO: WAIT, do I need to escape the boardId and the thread_id? Will that cause problems in accessing a boardid or thread_id that uses escaped characters...? Will need to check for those when are accessing the get function.......?????? and will that create any vulnerabilities?
  // TODO: handle escaping password, restrict characters in such a way that cannot be used for an attack, or find whatever the best practices are ***

  // ||| POST REPLY ROUTE |||
  // || USER STORY: ...
  // | TODOS: ..
  app.post("/api/replies/:board", (req, res) => {
    const requestLogPrefix = `${getNewId()} | POST REPLY REQ |`;
    console.log(requestLogPrefix, "Begin function");

    const validateRequest = () => {
      if (
        // Check existance
        req.params.board &&
        req.body.thread_id &&
        req.body.reply_text &&
        req.body.delete_password &&
        // Check types
        typeof req.params.board == "string" &&
        typeof req.body.thread_id == "string" &&
        typeof req.body.reply_text == "string" &&
        typeof req.body.delete_password == "string" &&
        // Check lengths
        // TODO: check thread_id length?
        // TODO: make sure are handling correct lengths
        req.params.board.length < 101 &&
        req.params.board.length > 3 &&
        req.body.reply_text.length < 255 &&
        req.body.reply_text.length > 3 &&
        req.body.delete_password.length < 255 &&
        req.body.delete_password.length > 3
      ) {
        let boardId, threadId, replyText, deletePassword;
        boardId = escapeHtml(req.params.board);
        threadId = escapeHtml(req.body.thread_id);
        replyText = escapeHtml(req.body.reply_text);
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

  // ||| DELETE REPLY ROUTE |||
  // || USER STORY: You can send a DELETE request to /api/replies/{board} and pass along the thread_id, reply_id, & delete_password. Returned will be the string incorrect password or success. On success, the text of the reply_id will be changed to [deleted].
  // | TODOS: ...
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
            res.status(200).json({ message: "incorrect password" });
            console.log(requestLogPrefix, "Failure, incorrect password");
          } else {
            handleDeleteReply(board_id, thread_id, reply_id, requestLogPrefix);
            res.status(200).json({ message: "success" });
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

  // ||||||||||||||||||||||| SANITIZED
  // You can send a DELETE request to /api/threads/{board} and pass along the thread_id & delete_password to delete the thread. Returned will be the string incorrect password or success.
  // TODO: handle password encryption, make sure arent displaying it in console, and decrypt where necessary
  // Test for thread_id length? also enforce password restrictions? how handle to scale if then change restrictions after a password has been created and are then testing for the old ones here?
  // TODO: make sure consistent tests and format and is scalable and reusable

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
            res.status(200).json({ message: "incorrect password" });
            console.log(requestLogPrefix, "Failure, incorrect password");
          } else {
            handleDeleteThread(board_id, thread_id, requestLogPrefix);
            res.status(200).json({ message: "success" });
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
  // hmmm, if split these into two functions then will have to filter/map twice, but if change to index-based then will be much simpler, less complexity to access
  const handleDeleteThread = (board_id, thread_id, requestLogPrefix) => {
    try {
      // TODO: *************
      // How want to handle?
      // A flag that says deleted, and only return the thread in the GET functions if deleted is false?
      // Actually delete the thread from the DB object?
      // Delete the text and the replies?

      // Soft delete:
      // const thread = forumDatabase[board_id].threads.filter(
      //   (thread) => thread._id === thread_id
      // )[0];
      // thread.text = "deleted";
      // thread.replies = [];

      // Hard delete:
      // Could go wrong if multiple requests at the same time, need to be able to handle that***
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

      // Delete flag:
      // TODO
    } catch {
      throw new Error(requestLogPrefix, "Failure to delete thread");
    }
  };
};
