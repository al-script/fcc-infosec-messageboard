// TODO:
// Tidy up
// Have a function where can hover over or click to view a popout of the full title of thread/board, or click to collapse the title down and click again to hide
// Make thread width be consistent between board and thread view
// Perhaps show full title on the thread view, or atleast default to a three dot style at the end and then press that to collapse the full title or visa versa start with full title and allow to collapse

// Perhaps set a max width on the thread

handlePage();

async function handlePage() {
  const thread = await getData();
  if (!thread) {
    renderPageError();
  } else {
    const page = await drawPage(thread);
    await renderPage(page, thread);
    await handleHooks(thread.boardId);
  }

  async function getData() {
    const { boardId, threadId } = await handleUrl();
    const threadData = await getThreadData(boardId, threadId);

    if (!threadData) {
      return false;
    } else {
      // If thread data is good, construct thread object that will be used for rendering the page
      threadData.boardId = boardId;

      const dateFormatting = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short",
      };

      // Convert date string from database to date object
      threadData.created_on = new Date(Date.parse(threadData.created_on));
      threadData.bumped_on = new Date(Date.parse(threadData.bumped_on));

      // Update date formatting to simpler layout than default
      threadData.created_on = new Intl.DateTimeFormat(
        undefined,
        dateFormatting
      ).format(threadData.created_on);
      threadData.bumped_on = new Intl.DateTimeFormat(
        undefined,
        dateFormatting
      ).format(threadData.bumped_on);

      // Update each reply's date formatting
      threadData.replies.forEach((reply) => {
        reply.created_on = new Intl.DateTimeFormat(
          undefined,
          dateFormatting
        ).format(new Date(Date.parse(reply.created_on)));
      });

      // if (replyCount == 0) {
      //   lastReply = "N/A";
      // } else {
      //   lastReply = bumped_on;
      // }

      console.log(threadData);
      return threadData;
    }

    async function handleUrl() {
      const windowUrl = window.location.pathname.split("/");
      const boardId = windowUrl[2];
      const threadId = windowUrl[3];
      console.log(boardId, threadId);
      return { boardId: boardId, threadId: threadId };
    }

    async function getThreadData(boardId, threadId) {
      console.log(boardId, threadId);
      const url = `/api/replies/${boardId}?thread_id=${threadId}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: { "content-type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Network response was not OK");
        }

        const thread = await response.json();

        console.log("Success:", thread);

        return thread;
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  async function drawPage(thread) {
    const page = `
      ${drawBoardHeader(thread)}
      ${drawThread(thread)}
    `;

    return page;

    function drawBoardHeader(thread) {
      let boardTitle = thread.boardId;
      const maxAcceptableTitleLength = 255;
      if (boardTitle > maxAcceptableTitleLength) {
        boardTitle = boardTitle.slice(0, 255);
      }

      return `
          <div class="flex flex-column gap-half flex-align-self-center width-100">
            <div class="justify-content-center flex-align-baseline flex gap-three-quarters">
              <div class="font-two address color-primary cursor-pointer" onclick="window.location.href='/'">b/</div>
              <div class="font-four overflow-hidden cursor-pointer hover-underline" onclick="window.location.href='/b/${boardTitle}'">${boardTitle}</div>
            </div>
          </div>      
      `;
    }

    function drawThread(threadToDraw) {
      let tempThread = `
        <div
          id="${threadToDraw._id}"
          class="thread-container thread-container-active flex flex-column gap-two width-90"
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
                <div class="address" onclick="window.location.href='/b/${thread.boardId}'">${thread.boardId}/</div>
                <div class="address" onclick="window.location.href='/b/${thread.boardId}/${threadToDraw._id}/'">${threadToDraw._id}/</div>
              </div>
              <div class="thread-title font-two overflow-wrap-anywhere width-100">${threadToDraw.text}</div>
              <div class="flex gap-two">
                <div class="flex flex-column">
                  <div class="color-primary">Replies</div>
                  <div class="flex-align-self-end overflow-wrap-anywhere">${threadToDraw.replyCount}</div>
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
            class="thread-content-container flex flex-column"
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
              
              ${drawAllReplies()}
            </div>
          `;

          return temporaryView;

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
    const target = document.getElementById("thread-container");
    target.innerHTML = page;

    document.title = `${thread.text} | b/${thread.boardId} | Anonymous Message Board | freeCodeCamp x al-script`;
  }

  async function renderPageError() {
    const target = document.getElementById("thread-container");
    target.innerHTML = `<div>Error</div>`;
  }

  // TODO: need to expose the boardId globally for use in here, need to resolve potential conflict of how using thread variable
  async function handleHooks(boardId) {
    handleAllThreads();

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
        // handleThreadToggle(thread);
        handleReplyToggle(thread);
        handleDeleteToggle(thread);
        handleThreadDestructiveActionsToggle(thread);

        // function handleThreadToggle(thread) {
        //   const toggleContainer = thread.getElementsByClassName(
        //     "thread-content-container"
        //   )[0];

        //   const toggleButton = thread.getElementsByClassName(
        //     "thread-toggle-button"
        //   )[0];

        //   const threadHeader =
        //     thread.getElementsByClassName("thread-header")[0];

        //   // Sample click on entire header, not just the toggle symbol
        //   threadHeader.addEventListener("click", (e) => {
        //     toggleContainer.classList.toggle("hidden");

        //     // Set toggle button status symbol
        //     if (toggleContainer.classList.contains("hidden")) {
        //       toggleButton.innerHTML = `<i class="fa-solid fa-plus color-primary"></i>`;
        //     } else {
        //       toggleButton.innerHTML = `<i class="fa-solid fa-minus color-primary"></i>`;
        //     }
        //   });
        // }

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
            board_id: boardId,
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

              if (response.status === 200) {
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
            board_id: boardId,
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

              if (response.status === 200) {
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
            board_id: boardId,
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
            const url = `/api/replies/${boardId}`;
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

              if (response.status === 200) {
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
              submitStatusParent.innerHTML = `Reporting error`;
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
            board_id: boardId,
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

              if (response.status === 200) {
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
