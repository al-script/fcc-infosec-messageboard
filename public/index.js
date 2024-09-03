// SHORT TERM
// TODO: add propery security to the links, noreferrer etc...

// LONG TERM
// Add function to create new board
// TODO: add search functionality, ability to delete/report boards as well as figure out best way to handle that on backend perhaps simply a delete flag so that the board itself can be restored or accessed in the backend if necessary

// DESIGN POSSIBILITIES:
// sort by last reply? alphabetical?
// Perhaps make it a two row deal, with last reply + created || threads + replies

// TODOS
// Underline for b/ and the thread title are different sizes
// Make same gap for each page

// REPLY AND THREAD COUNTS
// Fix for board view
// Could set flex flow to wrap at large numbers for the whole row ***
// Or could set the individual item overflow wrap along with proper widths for each item ***
// Let you hover over the title to see the full title in a popout, or press a button to see full title, on board view ***
// Add a back button to index on error page, perhaps give you links to each section and say that there was an error accessing something along this link chain


const getBoards = async () => {
  try {
    const url = "/api/boards";
    const response = await fetch(url, {
      method: "GET",
      headers: { "content-type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Network response was not OK");
    }

    const boards = await response.json();

    return boards;
  } catch (error) {
    console.error(error);
  }
};

const drawBoards = (boards) => {
  const indexContainer = document.getElementById("index-container");
  boards.forEach((board) => {
    // Handle date formatting
    const dateFormatting = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    };

    if (board.replyCount == 0) {
      board.lastReply = "N/A";
    } else {
      board.lastReply = new Date(Date.parse(board.lastReply));
      board.lastReply = new Intl.DateTimeFormat(
        undefined,
        dateFormatting
      ).format(board.lastReply);
    }

    board.createdOn = new Date(Date.parse(board.createdOn));
    board.createdOn = new Intl.DateTimeFormat(undefined, dateFormatting).format(
      board.createdOn
    );

    indexContainer.innerHTML += `
    <div class="index-item width-90 flex flex-column gap-one flex-align-self-center">
      <div class="justify-content-center flex-align-baseline flex gap-three-quarters">
        <div class="font-two address color-primary cursor-pointer" onclick="window.location.href='/'">b/</div>
        <div class="font-four overflow-hidden cursor-pointer hover-underline" onclick="window.location.href='/b/${board.title}'">${board.title}</div>
      </div>

      <div class="flex width-100 max-width-100 justify-content-space-between align-items-center flex-align-self-center gap-two">
          <div class="flex gap-one width-100 justify-content-center">
            <div class="flex flex-column">
              <div class="color-primary">Threads</div>
              <div class="flex-align-self-end overflow-wrap-anywhere">${board.threadCount}</div>
            </div>
            <div class="flex flex-column">
              <div class="color-primary">Replies</div>
              <div class="flex-align-self-end overflow-wrap-anywhere">${board.replyCount}</div>
            </div>
            <div class="flex flex-column">
              <div class="color-primary">Last Reply</div>
              <div>${board.lastReply}</div>
            </div>
            <div class="flex flex-column">
              <div class="color-primary">Created</div>
              <div>${board.createdOn}</div>
            </div>
          </div>
      </div>
    </div>      
    `;
  });
};

const drawPage = async () => {
  try {
    const boards = await getBoards();
    drawBoards(boards);
  } catch (error) {
    console.error(error);
    document.getElementById(
      "page-container"
    ).innerHTML = `<div>Page cannot be displayed</div>`;
  }
};

drawPage();
