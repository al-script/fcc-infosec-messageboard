// BUGS
// Fix thread address link not working properly, check how getting address, works fine with view all replies button

// RESEARCH
// Any downsides to marking a function as async if doesn't need to be?
// Should I pass in parameters to child functions if dont really need to, if already defined in parent?

// MINOR DESIGN FIXES
// Check through material design specs and update anything different to match if would work well
// fix active/hover classes, tweak the design
// status message, wrap in div and center the div
// perhaps remove check at the start of status message eg: [check] reply deleted successfully

// REFACTORING
// Refactoring functions so dont repeat self
// Break out into separate files?
// Consistent variable naming
// Could make forms be popout/popover
// could redo functions such that are getting elements by ID instead of class, would then need to append ID to relevant sections when drawing the page

// THEORETICAL
// TODO: perhaps add an X button to the top right of forms to dismiss them
// Screen reader and other accessibility features
// add header/footer
// could implement showing x hours ago if > 24hrs, and also give the proper date, if can find a clean way to do so
// is the way that are storing date in the database acceptable? does it take into account timezones properly when submitting a thread? seems like are...
// if close the toggle container, should that also close the associated forms? **** should add a little x button to close the form, or is that overkill, bad design because two ways to do same thing when only need one?

// POSSIBLE TODOS
// -- Fix displaying lastReply in thread if replies are 0
// -- Fix updating the last reply in thread header if last reply is simply a new thread
// -- It's possible that this is due to the requirement where must have the last reply date created when making a new thread? or is this not necessary?
// Perhaps make more things non selectable... like form titles?

// MAJOR FUTURE
// Get date formatting and form requirements from server
// Handle thread text content both serverside and clientside

// ONCE COMPLETE
// adapt for thread view: show full title
// adapt for forum index view
// Serve from the server, test all calls

// REFACTOR
// Make everything modular, break it all out into different files and simply pass in what is necessary so that way dont need to have so much repeated code

// TODO
// Handle max width of info bar below board name at large screen sizes, is too far apart 


handlePage();

async function handlePage() {
  // Need await here?
  const board = await getData();
  if (!board) {
    renderPageError();
  } else {
    const page = await drawPage(board);
    await renderPage(page);
    await handleHooks(board);
  }

  async function getData() {
    const boardId = await getBoardId();
    const threads = await getBoardData(boardId);

    if (!threads) {
      return false;
    } else {
      // If board data is good, construct board object that will be used for rendering the page
      const threadCount = threads.length;
      let replyCount = 0;
      let lastReply = 0;

      const dateFormatting = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short",
      };

      threads.forEach((thread) => {
        // Update thread's reply count
        replyCount += thread.replyCount;

        // Convert date string from database to date object
        thread.created_on = new Date(Date.parse(thread.created_on));
        thread.bumped_on = new Date(Date.parse(thread.bumped_on));

        // Update thread's last reply date
        if (thread.bumped_on > lastReply) {
          lastReply = thread.bumped_on;
        }

        // Update date formatting to simpler layout than default
        thread.created_on = new Intl.DateTimeFormat(
          undefined,
          dateFormatting
        ).format(thread.created_on);
        thread.bumped_on = new Intl.DateTimeFormat(
          undefined,
          dateFormatting
        ).format(thread.bumped_on);

        // Update each reply's date formatting
        thread.replies.forEach((reply) => {
          reply.created_on = new Intl.DateTimeFormat(
            undefined,
            dateFormatting
          ).format(new Date(Date.parse(reply.created_on)));
        });
      });

      if (replyCount == 0) {
        lastReply = "N/A";
      } else {
        lastReply = new Intl.DateTimeFormat(undefined, dateFormatting).format(
          lastReply
        );
      }

      const board = {
        header: {
          title: boardId,
          threads: threadCount,
          replies: replyCount,
          lastReply: lastReply,
        },
        threads: threads,
      };
      return board;
    }

    async function getBoardId() {
      const windowUrl = window.location.pathname.split("/");
      const boardId = windowUrl[2];
      return boardId;
    }

    async function getBoardData(boardId) {
      const url = `/api/threads/${boardId}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: { "content-type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Network response was not OK");
        }

        const threads = await response.json();

        return threads;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  }

  async function drawPage(board) {
    const page = `
      ${drawBoardHeader(board.header)}
      ${drawCreateNewThreadForm()}
      ${drawThreadView(board)}
    `;

    return page;

    function drawBoardHeader(header) {
      // Handle boardTitle size
      // Lazy solution, simply are cutting off size at 255
      // Perhaps could change the font size depending on certain cut offs in order to fit closer to the full length
      // <!-- TODO: handle at large sizes, either allow to scroll or simply cap the board length to a mobile friendly size or change the size of the font depending on the length of the board name, test what would fit for each length and cap at a length that works well at a small size that fills the screen,**** -->
      // <!-- Dynamically change font of title depending on the length of the title, set into a few groups depending on length, start at size 1 and see the maximum length and go from there into groups -->

      let title = header.title;
      const maxAcceptableTitleLength = 255;
      if (title > maxAcceptableTitleLength) {
        title = title.slice(0, 255);
      }

      return `
          <div class="flex flex-column gap-half flex-align-self-center width-100">
            <div class="justify-content-center flex-align-baseline flex gap-three-quarters">
              <div class="font-two address color-primary cursor-pointer" onclick="window.location.href='/'">b/</div>
              <div class="font-four overflow-hidden cursor-pointer hover-underline" onclick="window.location.href='/b/${title}'">${title}</div>
            </div>

            <div class="flex justify-content-space-between align-items-center flex-align-self-center gap-two">
              
                <div class="flex gap-one">
                  <div class="flex flex-column">
                    <div class="color-primary">Threads</div>
                    <div class="flex-align-self-end">${header.threads}</div>
                  </div>
                  <div class="flex flex-column">
                    <div class="color-primary">Replies</div>
                    <div class="flex-align-self-end">${header.replies}</div>
                  </div>
                  <div class="flex flex-column">
                    <div class="color-primary">Last Reply</div>
                    <div>${header.lastReply}</div>
                  </div>
                </div>

                <div
                  id="create-new-thread-toggle-button"
                  class="button-default button-color-secondary noselect cursor-pointer"
                >
                <i class="fa-solid fa-plus"></i> <div>New thread</div>
                </div>
              
            </div>
          </div>      
      `;
    }

    function drawCreateNewThreadForm() {
      return `
          <form
            id="create-new-thread-form"
            class="hidden form-default form-large"
          >
            <div class="form-header-default color-secondary">
              + Create new thread
            </div>
            <div class="form-section-default">
              <div
                class="form-section-description flex gap-half align-items-center"
              >
                Thread title
                <div id="thread-title-status-icon"></div>
              </div>
              <input
                type="text"
                id="user-input-thread-title"
                class="input-default"
                placeholder="Thread title (4 - 255 characters)"
                required
                minlength="4"
                maxlength="255"
              />
            </div>
            <div class="form-section-default">
              <div
                class="form-section-description flex gap-half align-items-center"
              >
                Thread content
                <div id="thread-content-status-icon"></div>
              </div>
              <textarea
                id="user-input-thread-content"
                placeholder="Thread content (4 - 255 characters)"
                class="input-default input-textarea"
                required
              ></textarea>
            </div>
            <div class="form-section-default">
              <div
                class="form-section-description flex gap-half align-items-center"
              >
                Password
                <div id="thread-password-status-icon"></div>
              </div>

              <input
                id="user-input-thread-password"
                type="password"
                class="input-default"
                placeholder="Password (4 - 255 characters)"
                required
                minlength="4"
                maxlength="255"
              />
            </div>
            <button
              type="submit"
              id="create-new-thread-form-submit-button"
              class="prevent-submit button-submit button-default button-color-primary no-border flex-align-self-end"
            >
              Submit
            </button>
            <div
              class="form-status-container flex flex-column flex-align-self-center hidden"
            >
              <div
                id="form-title-status"
                class="flex gap-half align-items-center"
              ></div>
              <div
                id="form-content-status"
                class="flex gap-half align-items-center"
              ></div>
              <div
                id="form-password-status"
                class="flex gap-half align-items-center"
              ></div>
              <div
                id="form-submit-status"
                class="flex gap-half align-items-center"
              ></div>
            </div>
          </form>      
      `;
    }

    function drawThreadView(board) {
      let threadView = `
      <div id="threads" class="flex flex-column">
        ${drawAllThreads(board.threads)}
      </div>
      `;
      return threadView;
    }

    function drawAllThreads(threads) {
      let temporaryThreadsView = ``;

      for (let threadToDraw of threads) {
        temporaryThreadsView += drawThread(threadToDraw);
      }

      return temporaryThreadsView;
    }

    function drawThread(threadToDraw) {
      let tempThread = `
        <div
          id="${threadToDraw._id}"
          class="thread-container thread-container-active flex flex-column gap-two"
        >

        ${drawThreadHeader(threadToDraw)}
        ${drawThreadContent(threadToDraw)}

        </div>
      `;
      return tempThread;

      function drawThreadHeader(threadToDraw) {
        // TODO: handle long thread title
        const header = `
          <div class="thread-header flex cursor-pointer">
            <div class="flex flex-column gap-three-quarters width-100">
              <div class="flex">
                <div class="address" onclick="window.location.href='/'">b/</div>
                <div class="address" onclick="window.location.href='/b/${board.header.title}'">${board.header.title}/</div>
                <div class="address" onclick="window.location.href='/b/${board.header.title}/${threadToDraw._id}/'">${threadToDraw._id}/</div>
              </div>
              <div class="thread-title font-two col">${threadToDraw.text}</div>
              <div class="flex gap-two">
                <div class="flex flex-column">
                  <div class="color-primary">Replies</div>
                  <div class="flex-align-self-end">${threadToDraw.replyCount}</div>
                </div>
                <div class="flex flex-column">
                  <div class="color-primary">Last reply</div>
                  <div>${threadToDraw.bumped_on}</div>
                </div>
                <div class="flex flex-column">
                  <div class="color-primary">Created</div>
                  <div>${threadToDraw.created_on}</div>
                </div>
              </div>
            </div>
            <div class="thread-toggle-button flex-align-self-center">
              <i class="fa-solid fa-plus color-primary"></i>
            </div>
          </div>        
        `;

        return header;
      }

      function drawThreadContent(threadToDraw) {
        // TODO: Area for thread text content:
        //   <div
        //     class="hidden thread-content-container flex flex-column gap-one"
        //   >
        //     <div class="thread-text-content">TODO: add thread text content, separate title from text content</div>
        //     ${drawThreadToggleButtons()}
        //     ${drawThreadForms()}
        //     ${drawReplies()}
        //   </div>
        // `;

        let temporaryThreadContent = `
          <div
            class="hidden thread-content-container flex flex-column"
          >
            ${drawThreadToggleButtons()}
            ${drawThreadForms()}
            ${drawReplies()}
          </div>
        `;

        return temporaryThreadContent;

        function drawThreadToggleButtons() {
          let temporaryView = `
            <div
              class="thread-actions-buttons-container flex justify-content-space-between align-items-flex-start"
            >
              <div class="padding-one">
                <div
                  class="noselect create-new-reply-toggle-button button-default button-color-primary flex align-items-center gap-half"
                >
                  <i class="fa-solid fa-plus"></i> Reply
                </div>
              </div>

              <div class="toggle-button-group flex gap-half">
                <div
                  class="hidden thread-destructive-actions-toggle-button-group-container flex flex-column gap-half"
                >
                  <div class="flex flex-column gap-half">
                    <button
                      class="thread-report-thread-toggle-button no-border button-default button-color-warning flex align-items-center gap-half"
                    >
                      <i class="fa-solid fa-triangle-exclamation"></i>
                      <div>Report thread</div>
                    </button>
                  </div>
                  <button
                    class="thread-delete-thread-toggle-button no-border button-default button-color-warning flex align-items-center gap-half"
                  >
                    <i class="fa-solid fa-trash"></i>
                    <div>Delete thread</div>
                  </button>
                  <div
                    class="thread-report-thread-status flex-align-self-end hidden padding-right-one"
                  ></div>
                  <div
                    class="thread-delete-thread-status flex-align-self-end hidden padding-right-one"
                  ></div>
                </div>
                <div
                  class="thread-destructive-actions-toggle-button-group-toggle-button button-default button-color-secondary"
                >
                  <i class="fa-solid fa-ellipsis"></i>
                </div>
              </div>
            </div>
          `;

          return temporaryView;
        }

        function drawThreadForms() {
          let temporaryView = `
            <div
              class="thread-actions-forms-container flex flex-column gap-three flex-align-self-center padding-one-plus-half width-90"
            >
              ${drawDeleteThreadForm()}
              ${drawThreadNewReplyForm()}
            </div>
          `;

          return temporaryView;

          function drawDeleteThreadForm() {
            let temporaryView = `
              <div class="hidden thread-delete-thread-form-container">
                <form class="thread-delete-thread-form form-default">
                  <div class="form-header-default color-secondary">
                    + Delete Thread
                  </div>
                  <div class="form-section-default">
                    <div
                      class="form-section-description flex gap-half align-items-center"
                    >
                      Password
                      <div class="thread-password-status-icon"></div>
                    </div>
                    <input
                      type="password"
                      class="input-default delete-thread-password-input"
                      placeholder="Password (4 - 255 characters)"
                      required
                      minlength="3"
                      maxlength="255"
                    />
                  </div>
                  <button
                    type="submit"
                    class="delete-thread-form-submit-button prevent-submit button-submit button-default button-color-primary no-border flex-align-self-end"
                  >
                    Submit
                  </button>
                  <div
                    class="form-status-container flex flex-column flex-align-self-center hidden"
                  >
                    <div
                      class="form-password-status flex gap-half align-items-center"
                    ></div>
                    <div
                      class="form-submit-status flex gap-half align-items-center"
                    ></div>
                  </div>
                </form>
              </div>
            `;

            return temporaryView;
          }
          function drawThreadNewReplyForm() {
            let temporaryView = `
              <div class="hidden thread-add-reply-form-container">
                <form class="thread-add-reply-form form-default">
                  <div class="form-header-default color-secondary">
                    + New reply
                  </div>
                  <div class="form-section-default">
                    <div
                      class="form-section-description flex gap-half align-items-center"
                    >
                      Reply content
                      <div class="reply-content-status-icon"></div>
                    </div>
                    <textarea
                      placeholder="Reply content (4 - 255 characters)"
                      class="input-default input-textarea new-reply-content-input"
                      required
                    ></textarea>
                  </div>
                  <div class="form-section-default">
                    <div
                      class="form-section-description flex gap-half align-items-center"
                    >
                      Deletion password
                      <div class="reply-password-status-icon"></div>
                    </div>
                    <input
                      type="password"
                      class="input-default new-reply-password-input"
                      placeholder="Deletion Password (4 - 255 characters)"
                      required
                      minlength="4"
                      maxlength="255"
                    />
                  </div>
                  <button
                    type="submit"
                    class="prevent-submit button-submit create-new-reply-form-submit-button button-default button-color-primary no-border flex-align-self-end"
                  >
                    Submit
                  </button>
                  <div
                    class="form-status-container flex flex-column flex-align-self-center hidden"
                  >
                    <div
                      class="form-content-status flex gap-half align-items-center"
                    ></div>
                    <div
                      class="form-password-status flex gap-half align-items-center"
                    ></div>
                    <div
                      class="form-submit-status flex gap-half align-items-center"
                    ></div>
                  </div>
                </form>
              </div>
            `;

            return temporaryView;
          }
        }

        function drawReplies() {
          let temporaryView = `
            <div class="thread-replies-container flex flex-column gap-two">
              ${drawRepliesHeader()}
              ${drawAllReplies()}
            </div>
          `;

          return temporaryView;

          function drawRepliesHeader() {
            // If greater than 3 replies then display link to view all replies
            if (threadToDraw.replyCount > 3) {
              let temporaryView = `
              <div
                class="flex justify-content-space-between align-items-center"
              >
                <div></div>
                <button
                  onclick="window.location.href='/b/${board.header.title}/${threadToDraw._id}/'"
                  class="thread-view-all-replies-link button button-default button-color-surface-container no-border"
                >
                <i class="fa-solid fa-plus color-secondary"></i> View all replies
                </button>
              </div>
              `;

              return temporaryView;
            } else {
              return ``;
            }
          }

          function drawAllReplies() {
            let temporaryView = ``;

            for (let replyToDraw of threadToDraw.replies) {
              temporaryView += drawReply(replyToDraw);
            }

            return temporaryView;
          }

          function drawReply(replyToDraw) {
            let temporaryView = `
            <div
              id="${replyToDraw._id}"
              class="thread-reply flex flex-column gap-one-point-five"
            >
              ${drawReplyContent(replyToDraw)}
              ${drawReplyDeleteForm(replyToDraw)}
            </div>
            `;

            return temporaryView;

            function drawReplyContent(replyToDraw) {
              let temporaryView = `
                <div class="flex flex-column gap-one">
                  <div>
                    <div class="address">${replyToDraw._id}</div>
                    <div class="reply-date">${replyToDraw.created_on}</div>
                  </div>
                  <div class="reply-text-content">${replyToDraw.text}</div>
                  <div
                    class="toggle-button-group flex gap-half width-fit-content flex-align-self-end"
                  >
                    <div
                      class="hidden thread-reply-destructive-actions-toggle-button-group-container flex flex-column gap-half flex-align-self-end"
                    >
                      <div class="flex flex-column gap-half">
                        <button
                          class="thread-report-reply-toggle-button no-border button-default button-color-warning flex align-items-center gap-half"
                        >
                          <i class="fa-solid fa-triangle-exclamation"></i>
                          Report reply
                        </button>
                      </div>
                      <button
                        class="thread-delete-reply-toggle-button no-border button-default button-color-warning flex align-items-center gap-half"
                      >
                        <i class="fa-solid fa-trash"></i>
                        <div>Delete reply</div>
                      </button>
                      <div
                        class="thread-report-reply-status flex-align-self-end hidden padding-right-one"
                      ></div>
                      <div
                        class="thread-delete-reply-status flex-align-self-end hidden padding-right-one"
                      ></div>
                    </div>
                    <div
                      class="thread-reply-destructive-actions-toggle-button-group-toggle-button button-default button-color-secondary"
                    >
                      <i class="fa-solid fa-ellipsis"></i>
                    </div>
                  </div>
                </div>
              `;

              return temporaryView;
            }

            function drawReplyDeleteForm(replyToDraw) {
              let temporaryView = `
                <div class="hidden thread-delete-reply-form-container">
                  <form class="thread-delete-reply-form form-default">
                    <div class="form-header-default color-secondary">
                      + Delete Reply
                    </div>
                    <div class="form-section-default">
                      <div
                        class="form-section-description flex gap-half align-items-center"
                      >
                        Password
                        <div class="reply-password-status-icon"></div>
                      </div>
                      <input
                        type="password"
                        class="input-default delete-reply-password-input"
                        placeholder="Password (4 - 255 characters)"
                        required
                        minlength="3"
                        maxlength="255"
                      />
                    </div>
                    <button
                      type="submit"
                      class="delete-reply-form-submit-button prevent-submit button-submit button-default button-color-primary no-border flex-align-self-end"
                    >
                      Submit
                    </button>
                    <div
                      class="form-status-container flex flex-column flex-align-self-center hidden"
                    >
                      <div
                        class="form-password-status flex gap-half align-items-center"
                      ></div>
                      <div
                        class="form-submit-status flex gap-half align-items-center"
                      ></div>
                    </div>
                  </form>
                </div>
              `;

              return temporaryView;
            }
          }
        }
      }
    }
  }

  async function renderPage(page) {
    const target = document.getElementById("board-container");
    target.innerHTML = page;

    document.title = `b/${board.header.title} | Anonymous Message Board | freeCodeCamp x al-script`;
  }

  async function renderPageError() {
    const target = document.getElementById("board-container");
    target.innerHTML = `<div>Error</div>`;
  }

  async function handleHooks(board) {
    handleNewThreadForm();
    handleAllThreads();

    async function handleNewThreadForm() {
      const createNewThreadForm = document.getElementById(
        "create-new-thread-form"
      );

      // Toggle form visibility on button press
      const createNewThreadToggleButton = document.getElementById(
        "create-new-thread-toggle-button"
      );
      createNewThreadToggleButton.addEventListener("click", (e) => {
        createNewThreadForm.classList.toggle("hidden");
      });

      // Handle validating inputs when user inputs on form
      // Currently validating everything on every input, but could refactor so that only testing the input section that was just inputted, and then update variables in upper scope so that won't have to reuse variable definitions in the submission section.
      // Would be more efficient, and wouldn't have to repeat self, but would be less simple
      createNewThreadForm.addEventListener("input", (e) => {
        const threadTitle = e.currentTarget.querySelector(
          "#user-input-thread-title"
        ).value;
        const titleStatus = e.currentTarget.querySelector("#form-title-status");
        const titleStatusIcon = e.currentTarget.querySelector(
          "#thread-title-status-icon"
        );

        const threadContent = e.currentTarget.querySelector(
          "#user-input-thread-content"
        ).value;
        const contentStatus = e.currentTarget.querySelector(
          "#form-content-status"
        );
        const contentStatusIcon = e.currentTarget.querySelector(
          "#thread-content-status-icon"
        );

        const threadPassword = e.currentTarget.querySelector(
          "#user-input-thread-password"
        ).value;
        const passwordStatus = e.currentTarget.querySelector(
          "#form-password-status"
        );
        const passwordStatusIcon = e.currentTarget.querySelector(
          "#thread-password-status-icon"
        );

        const submitButton = e.currentTarget.querySelector(
          "#create-new-thread-form-submit-button"
        );
        const submitStatus = e.currentTarget.querySelector(
          "#form-submit-status"
        );

        const statusContainer = e.currentTarget.querySelector(
          ".form-status-container"
        );

        submitStatus.innerHTML = ``;

        // Remove status messages if input is blank. Disallow submit. End function.
        if (
          threadTitle.length == 0 &&
          threadContent.length == 0 &&
          threadPassword.length == 0
        ) {
          statusContainer.classList.add("hidden");
          titleStatus.innerHTML = ``;
          titleStatusIcon.innerHTML = ``;
          contentStatus.innerHTML = ``;
          contentStatusIcon.innerHTML = ``;
          passwordStatus.innerHTML = ``;
          passwordStatusIcon.innerHTML = ``;
          submitStatus.innerHTML = ``;
          submitButton.classList.add("prevent-submit");
          return;
        } else {
          statusContainer.classList.remove("hidden");
        }

        // Validate input fields per requirements, display status of validation to user, allow submit if all validated, disallow submit if not all validated
        const validationRequirements = {
          threadTitle: {
            min: 3,
            max: 256,
          },
          threadContent: {
            min: 3,
            max: 256,
          },
          threadPassword: {
            min: 3,
            max: 256,
            charactersRequired: 0,
            charactersDisallowed: 0,
          },
        };

        function validateTitle() {
          if (
            threadTitle.length > validationRequirements.threadTitle.min &&
            threadTitle.length < validationRequirements.threadTitle.max
          ) {
            titleStatus.innerHTML = ``;
            titleStatusIcon.innerHTML = `<i class="fa-solid fa-check color-primary"></i>`;
            return true;
          } else {
            titleStatus.innerHTML = `<div><i class="fa-solid fa-xmark color-error"></i> Title must be between ${
              validationRequirements.threadTitle.min + 1
            } and ${
              validationRequirements.threadTitle.max - 1
            } characters</div>`;
            titleStatusIcon.innerHTML = `<i class="fa-solid fa-xmark color-error"></i>`;
            return false;
          }
        }

        function validateContent() {
          if (
            threadContent.length > validationRequirements.threadContent.min &&
            threadContent.length < validationRequirements.threadContent.max
          ) {
            contentStatus.innerHTML = ``;
            contentStatusIcon.innerHTML = `<i class="fa-solid fa-check color-primary"></i>`;
            return true;
          } else {
            contentStatus.innerHTML = `<div><i class="fa-solid fa-xmark color-error"></i> Content must be between ${
              validationRequirements.threadContent.min + 1
            } and ${
              validationRequirements.threadContent.max - 1
            } characters</div>`;
            contentStatusIcon.innerHTML = `<i class="fa-solid fa-xmark color-error"></i>`;
            return false;
          }
        }

        function validatePassword() {
          // TODO: handle validation for other rules than simply length
          if (
            threadPassword.length > validationRequirements.threadPassword.min &&
            threadPassword.length < validationRequirements.threadPassword.max
          ) {
            passwordStatus.innerHTML = ``;
            passwordStatusIcon.innerHTML = `<i class="fa-solid fa-check color-primary"></i>`;
            return true;
          } else {
            passwordStatus.innerHTML = `<div><i class="fa-solid fa-xmark color-error"></i> Password must be between ${
              validationRequirements.threadPassword.min + 1
            } and ${
              validationRequirements.threadPassword.max - 1
            } characters</div>`;
            passwordStatusIcon.innerHTML = `<i class="fa-solid fa-xmark color-error"></i>`;
            return false;
          }
        }

        let contentValidation = validateContent();
        let titleValidation = validateTitle();
        let passwordValidation = validatePassword();

        if (titleValidation && contentValidation && passwordValidation) {
          statusContainer.classList.add("hidden");
          submitButton.classList.remove("prevent-submit");
        } else {
          submitButton.classList.add("prevent-submit");
        }

        return;
      });

      // Handle submit behavior
      createNewThreadForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitButton = e.currentTarget.querySelector(
          "#create-new-thread-form-submit-button"
        );

        if (!submitButton.classList.contains("prevent-submit")) {
          const threadTitle = e.currentTarget.querySelector(
            "#user-input-thread-title"
          ).value;
          const titleStatusIcon = e.currentTarget.querySelector(
            "#thread-title-status-icon"
          );

          const threadContent = e.currentTarget.querySelector(
            "#user-input-thread-content"
          ).value;
          const contentStatusIcon = e.currentTarget.querySelector(
            "#thread-content-status-icon"
          );

          const threadPassword = e.currentTarget.querySelector(
            "#user-input-thread-password"
          ).value;
          const passwordStatusIcon = e.currentTarget.querySelector(
            "#thread-password-status-icon"
          );

          const submitStatus = e.currentTarget.querySelector(
            "#form-submit-status"
          );

          const statusContainer = e.currentTarget.querySelector(
            ".form-status-container"
          );

          // TODO: perhaps also escape it here just for the lolz

          const data = {
            board_id: board.header.title,
            thread_text: threadTitle,
            thread_content: threadContent,
            delete_password: threadPassword,
          };
          // Make sure async works here
          const request = await submitCreateNewThreadForm(data);

          if (!request) {
            submitStatus.innerHTML = `<i class="fa-solid fa-xmark color-error"></i><div>Submission unsuccessful</div>`;
          } else {
            // Reset on successful submit
            // createNewThreadForm.reset();
            statusContainer.classList.remove("hidden");
            submitButton.classList.add("prevent-submit");
            submitStatus.innerHTML = `<i class="fa-solid fa-check color-primary"></i><div>Thread submitted successfully</div><div onClick="handlePage()"><i class="fa-solid fa-arrows-rotate button-main refresh-button cursor-pointer color-primary"></i></div>`;
          }
        }

        return;
      });

      async function submitCreateNewThreadForm(data) {
        const url = `/api/threads/${data.board_id}`;
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error("Network response was not OK");
          }

          const thread = await response.json();

          if (thread.message == "Thread posted") {
            return true;
          } else {
            throw new Error("Submission failed");
          }
        } catch (error) {
          console.error(error);
          return false;
        }
      }
    }

    async function handleAllThreads() {
      const threads = document.getElementsByClassName("thread-container");

      for (let thread of threads) {
        handleThread(thread);
      }
    }

    async function handleThread(thread) {
      const thread_id = thread.id;

      handleToggles(thread);
      handleReportThread(thread);
      handleDeleteThread(thread);
      handleNewReply(thread);

      function handleToggles(thread) {
        handleThreadToggle(thread);
        handleReplyToggle(thread);
        handleDeleteToggle(thread);
        handleThreadDestructiveActionsToggle(thread);

        function handleThreadToggle(thread) {
          const toggleContainer = thread.getElementsByClassName(
            "thread-content-container"
          )[0];

          const toggleButton = thread.getElementsByClassName(
            "thread-toggle-button"
          )[0];

          const threadHeader =
            thread.getElementsByClassName("thread-header")[0];

          // Sample click on entire header, not just the toggle symbol
          threadHeader.addEventListener("click", (e) => {
            toggleContainer.classList.toggle("hidden");

            // Set toggle button status symbol
            if (toggleContainer.classList.contains("hidden")) {
              toggleButton.innerHTML = `<i class="fa-solid fa-plus color-primary"></i>`;
            } else {
              toggleButton.innerHTML = `<i class="fa-solid fa-minus color-primary"></i>`;
            }
          });
        }

        function handleReplyToggle(thread) {
          const toggleContainer = thread.getElementsByClassName(
            "thread-add-reply-form-container"
          )[0];

          const toggleButton = thread.getElementsByClassName(
            "create-new-reply-toggle-button"
          )[0];

          toggleButton.addEventListener("click", (e) => {
            toggleContainer.classList.toggle("hidden");
          });
        }

        function handleDeleteToggle(thread) {
          const toggleContainer = thread.getElementsByClassName(
            "thread-delete-thread-form-container"
          )[0];

          const toggleButton = thread.getElementsByClassName(
            "thread-delete-thread-toggle-button"
          )[0];

          toggleButton.addEventListener("click", (e) => {
            toggleContainer.classList.toggle("hidden");
          });
        }

        function handleThreadDestructiveActionsToggle(thread) {
          const toggleContainer = thread.getElementsByClassName(
            "thread-destructive-actions-toggle-button-group-container"
          )[0];

          const toggleParentContainer = thread.getElementsByClassName(
            "toggle-button-group"
          )[0];

          const toggleButton = thread.getElementsByClassName(
            "thread-destructive-actions-toggle-button-group-toggle-button"
          )[0];

          toggleButton.addEventListener("click", (e) => {
            toggleContainer.classList.toggle("hidden");
            toggleParentContainer.classList.toggle(
              "toggle-button-group-active"
            );
          });
        }
      }

      async function handleReportThread(thread) {
        const reportThreadButton = thread.getElementsByClassName(
          "thread-report-thread-toggle-button"
        )[0];

        const submitStatusParent = thread.getElementsByClassName(
          "thread-report-thread-status"
        )[0];

        reportThreadButton.addEventListener("click", (e) => {
          handleRequest(thread_id, submitStatusParent);
          return;
        });

        async function handleRequest(thread_id, submitStatusParent) {
          const data = {
            board_id: board.header.title,
            thread_id: thread_id,
          };
          const request = await apiRequest(data);
          updateForm(request, submitStatusParent);
          return;

          async function apiRequest(data) {
            const url = `/api/threads/${data.board_id}`;
            try {
              const response = await fetch(url, {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error("Network response was not OK");
              }

              const reported = await response.json();

              if (reported.message == "reported") {
                return true;
              } else {
                return false;
              }
            } catch (error) {
              console.error("Error:", error);
              return false;
            }
          }

          function updateForm(request, submitStatusParent) {
            // TODO: perhaps reverse so that !request first, keep it consistent
            if (request) {
              submitStatusParent.classList.toggle("hidden");
              submitStatusParent.innerHTML = `Reported <i class="fa-solid fa-check color-primary"></i>`;
            } else {
              submitStatusParent.classList.toggle("hidden");
              submitStatusParent.innerHTML = `Reporting error `;
            }
          }
        }
      }

      function handleDeleteThread(thread) {
        const deleteThreadForm = thread.getElementsByClassName(
          "thread-delete-thread-form-container"
        )[0];

        deleteThreadForm.addEventListener("input", (e) => {
          handleValidation(e, thread);
        });

        deleteThreadForm.addEventListener("submit", (e) => {
          e.preventDefault();
          if (handleValidation(e, thread)) {
            handleRequest(e, thread, deleteThreadForm);
          }
        });

        function handleValidation(e, thread) {
          const threadPassword = e.currentTarget.querySelector(
            ".delete-thread-password-input"
          ).value;
          const passwordStatus = e.currentTarget.querySelector(
            ".form-password-status"
          );
          const passwordStatusIcon = e.currentTarget.querySelector(
            ".thread-password-status-icon"
          );
          const submitStatus = e.currentTarget.querySelector(
            ".form-submit-status"
          );
          const submitButton = e.currentTarget.querySelector(
            ".delete-thread-form-submit-button"
          );
          const statusContainer = e.currentTarget.querySelector(
            ".form-status-container"
          );

          submitStatus.innerHTML = ``;

          // TODO: Submit status for the parent group
          const submitStatusParent = thread.getElementsByClassName(
            "thread-delete-thread-status"
          )[0];

          // submitStatusParent.innerHTML = ``;

          if (threadPassword.length == 0) {
            statusContainer.classList.add("hidden");
            passwordStatus.innerHTML = ``;
            passwordStatusIcon.innerHTML = ``;
            submitStatus.innerHTML = ``;
            submitButton.classList.add("prevent-submit");
            return;
          } else {
            statusContainer.classList.remove("hidden");
          }

          // TODO: dont repeat
          const validationRequirements = {
            threadPassword: {
              min: 3,
              max: 256,
              charactersRequired: 0,
              charactersDisallowed: 0,
            },
          };

          function validatePassword() {
            // TODO: handle validation for other rules than simply length
            if (
              threadPassword.length >
                validationRequirements.threadPassword.min &&
              threadPassword.length < validationRequirements.threadPassword.max
            ) {
              passwordStatus.innerHTML = ``;
              passwordStatusIcon.innerHTML = `<i class="fa-solid fa-check color-primary"></i>`;
              return true;
            } else {
              passwordStatus.innerHTML = `<div><i class="fa-solid fa-xmark color-error"></i> Password must be between ${
                validationRequirements.threadPassword.min + 1
              } and ${
                validationRequirements.threadPassword.max - 1
              } characters</div>`;
              passwordStatusIcon.innerHTML = `<i class="fa-solid fa-xmark color-error"></i>`;
              return false;
            }
          }
          let passwordValidation = validatePassword();

          if (passwordValidation) {
            statusContainer.classList.add("hidden");
            submitButton.classList.remove("prevent-submit");
            return true;
          } else {
            submitButton.classList.add("prevent-submit");
          }
          return;
        }

        async function handleRequest(e, thread, deleteThreadForm) {
          // TODO: escape this...?
          const threadPassword = e.currentTarget.querySelector(
            ".delete-thread-password-input"
          ).value;

          const data = {
            board_id: board.header.title,
            thread_id: thread.id,
            delete_password: threadPassword,
          };

          const request = await apiRequest(data);
          updateForm(request, thread, deleteThreadForm);

          // TODO: add proper post request
          async function apiRequest(data) {
            const url = `/api/threads/${data.board_id}`;
            try {
              const response = await fetch(url, {
                method: "DELETE",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error("Network response was not OK");
              }

              const deleted = await response.json();

              if (deleted.message == "success") {
                return true;
              } else {
                return false;
              }
            } catch (error) {
              console.error("Error:", error);
              return false;
            }
          }

          function updateForm(request, thread, deleteThreadForm) {
            // TODO: don't repeat self, perhaps encapsulate these somewhere and pass them around as needed
            const submitStatus = deleteThreadForm.querySelector(
              ".form-submit-status"
            );
            const submitButton = deleteThreadForm.querySelector(
              ".delete-thread-form-submit-button"
            );
            const submitStatusParent = thread.getElementsByClassName(
              "thread-delete-thread-status"
            )[0];
            const statusContainer = deleteThreadForm.querySelector(
              ".form-status-container"
            );

            if (!request) {
              statusContainer.classList.remove("hidden");
              submitStatus.innerHTML = `<i class="fa-solid fa-xmark color-error"></i><div>Deletion unsuccessful</div>`;
            } else {
              // TODO: fix refresh thread button
              statusContainer.classList.remove("hidden");
              submitStatusParent.classList.toggle("hidden");
              submitButton.classList.add("prevent-submit");
              submitStatus.innerHTML = `<i class="fa-solid fa-check color-primary"></i><div>Thread deleted successfully</div><div onClick="handlePage()"><i class="fa-solid fa-arrows-rotate button-main refresh-button cursor-pointer color-primary"></i></div>`;
              submitStatusParent.innerHTML = `Deleted <i class="fa-solid fa-check color-primary"></i>`;
            }
          }
        }
      }

      function handleNewReply(thread) {
        // TODO: ******** Hmmm, is it possible to define the element references at a high level and then pass those references around?
        // Probably then need to use something that would return a live collection, getElementsByClassName etc...

        const newReplyForm = thread.getElementsByClassName(
          "thread-add-reply-form"
        )[0];

        newReplyForm.addEventListener("input", (e) => {
          handleInput(e);
        });

        newReplyForm.addEventListener("submit", (e) => {
          e.preventDefault();
          if (handleInput(e)) {
            handleSubmit(e, thread, newReplyForm);
          }
        });

        function handleInput(e) {
          const replyContent = e.currentTarget.querySelector(
            ".new-reply-content-input"
          ).value;
          const replyPassword = e.currentTarget.querySelector(
            ".new-reply-password-input"
          ).value;

          const replyContentStatus = e.currentTarget.querySelector(
            ".form-content-status"
          );
          const replyContentStatusIcon = e.currentTarget.querySelector(
            ".reply-content-status-icon"
          );

          const passwordStatus = e.currentTarget.querySelector(
            ".form-password-status"
          );
          const passwordStatusIcon = e.currentTarget.querySelector(
            ".reply-password-status-icon"
          );

          const submitStatus = e.currentTarget.querySelector(
            ".form-submit-status"
          );
          const submitButton = e.currentTarget.querySelector(
            ".create-new-reply-form-submit-button"
          );

          const statusContainer = e.currentTarget.querySelector(
            ".form-status-container"
          );

          submitStatus.innerHTML = ``;

          if (replyContent.length == 0 && replyPassword.length == 0) {
            statusContainer.classList.add("hidden");
            replyContentStatus.innerHTML = ``;
            replyContentStatusIcon.innerHTML = ``;
            passwordStatus.innerHTML = ``;
            passwordStatusIcon.innerHTML = ``;
            submitStatus.innerHTML = ``;
            submitButton.classList.add("prevent-submit");
            return;
          } else {
            statusContainer.classList.remove("hidden");
          }

          const validationRequirements = {
            replyContent: {
              min: 3,
              max: 256,
            },
            replyPassword: {
              min: 3,
              max: 256,
              charactersRequired: 0,
              charactersDisallowed: 0,
            },
          };

          function validateContent() {
            if (
              replyContent.length > validationRequirements.replyContent.min &&
              replyContent.length < validationRequirements.replyContent.max
            ) {
              replyContentStatus.innerHTML = ``;
              replyContentStatusIcon.innerHTML = `<i class="fa-solid fa-check color-primary"></i>`;
              return true;
            } else {
              replyContentStatus.innerHTML = `<div><i class="fa-solid fa-xmark color-error"></i> Content must be between ${
                validationRequirements.replyContent.min + 1
              } and ${
                validationRequirements.replyContent.max - 1
              } characters</div>`;
              replyContentStatusIcon.innerHTML = `<i class="fa-solid fa-xmark color-error"></i>`;
              return false;
            }
          }

          function validatePassword() {
            // TODO: handle validation for other rules than simply length
            if (
              replyPassword.length > validationRequirements.replyPassword.min &&
              replyPassword.length < validationRequirements.replyPassword.max
            ) {
              passwordStatus.innerHTML = ``;
              passwordStatusIcon.innerHTML = `<i class="fa-solid fa-check color-primary"></i>`;
              return true;
            } else {
              passwordStatus.innerHTML = `<div><i class="fa-solid fa-xmark color-error"></i> Password must be between ${
                validationRequirements.replyPassword.min + 1
              } and ${
                validationRequirements.replyPassword.max - 1
              } characters</div>`;
              passwordStatusIcon.innerHTML = `<i class="fa-solid fa-xmark color-error"></i>`;
              return false;
            }
          }

          let contentValidation = validateContent();
          let passwordValidation = validatePassword();

          if (contentValidation && passwordValidation) {
            statusContainer.classList.add("hidden");
            submitButton.classList.remove("prevent-submit");
            return true;
          } else {
            submitButton.classList.add("prevent-submit");
            return false;
          }
          return;
        }

        async function handleSubmit(e, thread, newReplyForm) {
          // TODO: escape this...? dont repeat self?
          const replyContent = e.currentTarget.querySelector(
            ".new-reply-content-input"
          ).value;
          const replyPassword = e.currentTarget.querySelector(
            ".new-reply-password-input"
          ).value;

          const data = {
            board_id: board.header.title,
            thread_id: thread.id,
            reply_text: replyContent,
            delete_password: replyPassword,
          };

          const request = await apiRequest(data);
          updateForm(newReplyForm, request);

          async function apiRequest(data) {
            const url = `/api/replies/${data.board_id}`;
            try {
              // TODO: best practices for sending password
              const response = await fetch(url, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error("Network response was not OK");
              }

              const posted = await response.json();

              if (posted.message == "Reply posted") {
                return true;
              } else {
                return false;
              }
            } catch (error) {
              console.error("Error:", error);
              return false;
            }
          }

          async function updateForm(newReplyForm, request) {
            // TODO: don't repeat self, perhaps encapsulate these somewhere and pass them around as needed, perhaps even a global generic function that can call
            const submitStatus = newReplyForm.querySelector(
              ".form-submit-status"
            );
            const submitButton = newReplyForm.querySelector(
              ".create-new-reply-form-submit-button"
            );
            const statusContainer = newReplyForm.querySelector(
              ".form-status-container"
            );

            if (!request) {
              statusContainer.classList.remove("hidden");
              submitStatus.innerHTML = `<i class="fa-solid fa-xmark color-error"></i><div>Submission unsuccessful</div>`;
            } else {
              statusContainer.classList.remove("hidden");
              submitButton.classList.add("prevent-submit");
              submitStatus.innerHTML = `<i class="fa-solid fa-check color-primary"></i><div>Reply submitted successfully</div><div onClick="handlePage()"><i class="fa-solid fa-arrows-rotate button-main refresh-button cursor-pointer color-primary"></i></div>`;
            }
          }
        }
      }

      const replies = thread.getElementsByClassName("thread-reply");
      for (let reply of replies) {
        handleReply(reply, thread_id);
      }
    }

    async function handleReply(reply, thread_id) {
      handleToggles(reply);
      handleReportReply(reply, thread_id);
      handleDeleteReply(reply, thread_id);

      function handleToggles(reply) {
        handleReplyDestructiveActionsToggle(reply);
        handleDeleteToggle(reply);

        function handleDeleteToggle(reply) {
          const toggleContainer = reply.getElementsByClassName(
            "thread-delete-reply-form-container"
          )[0];

          const toggleButton = reply.getElementsByClassName(
            "thread-delete-reply-toggle-button"
          )[0];

          toggleButton.addEventListener("click", (e) => {
            toggleContainer.classList.toggle("hidden");
          });
        }

        function handleReplyDestructiveActionsToggle(reply) {
          const toggleContainer = reply.getElementsByClassName(
            "thread-reply-destructive-actions-toggle-button-group-container"
          )[0];

          const toggleParentContainer = reply.getElementsByClassName(
            "toggle-button-group"
          )[0];

          const toggleButton = reply.getElementsByClassName(
            "thread-reply-destructive-actions-toggle-button-group-toggle-button"
          )[0];

          toggleButton.addEventListener("click", (e) => {
            toggleContainer.classList.toggle("hidden");
            toggleParentContainer.classList.toggle(
              "toggle-button-group-active"
            );
          });
        }
      }

      function handleReportReply(reply, thread_id) {
        const reportThreadButton = reply.getElementsByClassName(
          "thread-report-reply-toggle-button"
        )[0];

        const submitStatusParent = reply.getElementsByClassName(
          "thread-report-reply-status"
        )[0];

        reportThreadButton.addEventListener("click", (e) => {
          const replyId = reply.id;
          handleRequest(replyId, submitStatusParent);
          return;
        });

        async function handleRequest(replyId, submitStatusParent) {
          // TODO: refactor so passing in data object instead of individual sections, keep it consistent
          const request = await apiRequest(replyId, thread_id);
          updateForm(request, submitStatusParent);
          return;

          async function apiRequest(replyId, thread_id) {
            const url = `/api/replies/${board.header.title}`;
            const payload = {
              thread_id: thread_id,
              reply_id: replyId,
            };
            try {
              const response = await fetch(url, {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                throw new Error("Network response was not OK");
              }

              const reported = await response.json();

              if (reported.message == "reported") {
                return true;
              } else {
                return false;
              }
            } catch (error) {
              console.error("Error:", error);
              return false;
            }
          }

          function updateForm(request, submitStatusParent) {
            // TODO: perhaps reverse so that !request first, keep it consistent
            if (request) {
              submitStatusParent.classList.toggle("hidden");
              submitStatusParent.innerHTML = `Reported <i class="fa-solid fa-check color-primary"></i>`;
            } else {
              submitStatusParent.classList.toggle("hidden");
              submitStatusParent.innerHTML = `Reporting error `;
            }
          }
        }
      }

      function handleDeleteReply(reply, thread_id) {
        // TODO: are targeting the container div, but shouldnt target the form itself...?
        const deleteReplyForm = reply.getElementsByClassName(
          "thread-delete-reply-form-container"
        )[0];

        deleteReplyForm.addEventListener("input", (e) => {
          handleValidation(e, reply);
        });

        deleteReplyForm.addEventListener("submit", (e) => {
          e.preventDefault();
          if (handleValidation(e, reply)) {
            handleRequest(e, reply, thread_id);
          }
        });

        function handleValidation(e, reply) {
          const replyPassword = e.currentTarget.querySelector(
            ".delete-reply-password-input"
          ).value;
          const passwordStatus = e.currentTarget.querySelector(
            ".form-password-status"
          );
          const passwordStatusIcon = e.currentTarget.querySelector(
            ".reply-password-status-icon"
          );
          const submitStatus = e.currentTarget.querySelector(
            ".form-submit-status"
          );
          const submitButton = e.currentTarget.querySelector(
            ".delete-reply-form-submit-button"
          );

          const statusContainer = e.currentTarget.querySelector(
            ".form-status-container"
          );

          submitStatus.innerHTML = ``;

          // TODO: Submit status for the parent group
          const submitStatusParent = reply.getElementsByClassName(
            "thread-delete-reply-status"
          )[0];

          // submitStatusParent.innerHTML = ``;

          if (replyPassword.length == 0) {
            statusContainer.classList.add("hidden");
            passwordStatus.innerHTML = ``;
            passwordStatusIcon.innerHTML = ``;
            submitStatus.innerHTML = ``;
            submitButton.classList.add("prevent-submit");
            return;
          } else {
            statusContainer.classList.remove("hidden");
          }

          // TODO: dont repeat
          // TODO: define better such that dont need to reference min max so verbosely throughout this function
          const validationRequirements = {
            replyPassword: {
              min: 3,
              max: 256,
              charactersRequired: 0,
              charactersDisallowed: 0,
            },
          };

          function validatePassword() {
            // TODO: handle validation for other rules than simply length
            if (
              replyPassword.length > validationRequirements.replyPassword.min &&
              replyPassword.length < validationRequirements.replyPassword.max
            ) {
              passwordStatus.innerHTML = ``;
              passwordStatusIcon.innerHTML = `<i class="fa-solid fa-check color-primary"></i>`;
              return true;
            } else {
              passwordStatus.innerHTML = `<div><i class="fa-solid fa-xmark color-error"></i> Password must be between ${
                validationRequirements.replyPassword.min + 1
              } and ${
                validationRequirements.replyPassword.max - 1
              } characters</div>`;
              passwordStatusIcon.innerHTML = `<i class="fa-solid fa-xmark color-error"></i>`;
              return false;
            }
          }
          let passwordValidation = validatePassword();

          if (passwordValidation) {
            statusContainer.classList.add("hidden");
            submitButton.classList.remove("prevent-submit");
            return true;
          } else {
            submitButton.classList.add("prevent-submit");
          }
          return;
        }

        async function handleRequest(e, reply, thread_id) {
          // TODO: escape this...?
          const replyPassword = e.currentTarget.querySelector(
            ".delete-reply-password-input"
          ).value;

          const data = {
            board_id: board.header.title,
            thread_id: thread_id,
            reply_id: reply.id,
            delete_password: replyPassword,
          };

          const request = await apiRequest(data);
          updateForm(request, reply);

          // TODO: add proper post request
          async function apiRequest(data) {
            const url = `/api/replies/${data.board_id}`;
            try {
              const response = await fetch(url, {
                method: "DELETE",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error("Network response was not OK");
              }

              const deleted = await response.json();

              if (deleted.message == "success") {
                return true;
              } else {
                return false;
              }
            } catch (error) {
              console.error("Error:", error);
              return false;
            }
          }

          // TODO: can simply pass in the submitStatus/button/parent instead of redefining them here
          function updateForm(request, reply) {
            // TODO: don't repeat self, perhaps encapsulate these somewhere and pass them around as needed
            // using reply instead of e, doesn't work with e
            const submitStatus = reply.querySelector(".form-submit-status");
            const submitButton = reply.querySelector(
              ".delete-reply-form-submit-button"
            );
            const submitStatusParent = reply.getElementsByClassName(
              "thread-delete-reply-status"
            )[0];
            const statusContainer = reply.querySelector(
              ".form-status-container"
            );

            if (!request) {
              statusContainer.classList.remove("hidden");
              submitStatus.innerHTML = `<i class="fa-solid fa-xmark color-error"></i><div>Deletion unsuccessful</div>`;
            } else {
              statusContainer.classList.remove("hidden");
              submitStatusParent.classList.toggle("hidden");
              submitButton.classList.add("prevent-submit");
              submitStatus.innerHTML = `<i class="fa-solid fa-check color-primary"></i><div>Reply deleted successfully</div><div onClick="handlePage()"><i class="fa-solid fa-arrows-rotate button-main refresh-button cursor-pointer color-primary"></i></div>`;
              submitStatusParent.innerHTML = `Deleted <i class="fa-solid fa-check color-primary"></i>`;
            }
          }
        }
      }
    }
  }
}
