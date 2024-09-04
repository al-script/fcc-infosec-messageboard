// Test forum database. Using JS object to avoid having to monitor and periodically flush potentially inflammatory posts

const testDate = new Date().toUTCString();
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

module.exports = forumDatabase;
