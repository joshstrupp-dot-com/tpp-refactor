// Cursor trail effect with book cover images
document.addEventListener("DOMContentLoaded", function () {
  // Check if device is mobile
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;

  // Exit early if on mobile device
  if (isMobile) {
    return;
  }

  // Book cover images to use in the trail
  const BOOK_COVERS = [
    "whydoeshe.jpg",
    "smiles.jpg",
    "souldetox.jpg",
    "shutup.jpg",
    "fear.jpg",
  ];

  // Shuffle the book covers array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Shuffle the book covers once on page load
  let shuffledCovers = shuffleArray([...BOOK_COVERS]);

  // How many cursors to create - now only 5
  const CURSORS_COUNT = 5;
  // The delay to update each cursor - increased for slower movement
  const CURSOR_DELAY_MS = 32;
  // Offset for the cursor position
  const IMAGE_OFFSET = [-20, -20];
  // Size of the book cover images
  const COVER_WIDTH = 80; // Narrower width
  const COVER_HEIGHT = 120; // Taller height

  // Create a container for the cursor trail
  const cursorParent = document.createElement("div");
  cursorParent.classList.add("cursor-parent");
  document.body.appendChild(cursorParent);

  // List of cursors
  let cursors = [];

  // Store current cursor positions
  let currentPositions = [];

  // Flag to track if cursor is in hero section
  let isInHeroSection = false;

  // Flag to track if cursor is in the author div
  let isInAuthorDiv = false;

  // Store last known mouse position
  let lastMousePosition = { x: 0, y: 0 };

  // Function to create cursors
  function createCursors(positions = null) {
    // Clear existing cursors
    cursorParent.innerHTML = "";
    cursors = [];

    // Create new cursors
    for (let i = 0; i < CURSORS_COUNT; i++) {
      // Create a div for each cursor
      let div = document.createElement("div");
      div.classList.add("fake-cursor");

      // Set the background image to one of the shuffled book covers
      div.style.backgroundImage = `url('assets/${shuffledCovers[i]}')`;
      div.style.width = `${COVER_WIDTH}px`;
      div.style.height = `${COVER_HEIGHT}px`;

      // If positions are provided, set the initial position
      if (positions && positions[i]) {
        div.style.transform = `translate(${positions[i].x}px, ${positions[i].y}px)`;
      }

      // Add it to the main div
      cursorParent.appendChild(div);
      // Add it to the list
      cursors.push(div);
    }
  }

  // Initial creation of cursors
  createCursors();

  // Function to check if cursor is in hero section or author div
  function checkCursorPosition(clientX, clientY) {
    const heroSection = document.getElementById("hero");
    const heroRect = heroSection.getBoundingClientRect();

    // Check if cursor is in hero section
    const isInHero =
      clientX >= heroRect.left &&
      clientX <= heroRect.right &&
      clientY >= heroRect.top &&
      clientY <= heroRect.bottom;

    // Check if cursor is in author div
    const authorDiv = document.querySelector(".body.bottom-left.andale");
    let isInAuthor = false;

    if (authorDiv) {
      const authorRect = authorDiv.getBoundingClientRect();
      isInAuthor =
        clientX >= authorRect.left &&
        clientX <= authorRect.right &&
        clientY >= authorRect.top &&
        clientY <= authorRect.bottom;
    }

    // If state changed for hero section, update visibility
    if (isInHero !== isInHeroSection) {
      isInHeroSection = isInHero;
    }

    // If state changed for author div, update visibility
    if (isInAuthor !== isInAuthorDiv) {
      isInAuthorDiv = isInAuthor;
    }

    // Show/hide cursor trail based on whether we're in hero section and not in author div
    if (isInHeroSection && !isInAuthorDiv) {
      cursorParent.style.display = "block";
      document.body.style.cursor = "none";
    } else {
      cursorParent.style.display = "none";
      document.body.style.cursor = "auto";
    }
  }

  // Track mouse movement
  document.addEventListener(
    "mousemove",
    function (event) {
      // Store last known mouse position
      lastMousePosition.x = event.clientX;
      lastMousePosition.y = event.clientY;

      // Check cursor position
      checkCursorPosition(event.clientX, event.clientY);

      // Only update cursor positions if in hero section and not in author div
      if (!isInHeroSection || isInAuthorDiv) return;

      // The position we want
      const x = event.clientX + IMAGE_OFFSET[0];
      const y = event.clientY + IMAGE_OFFSET[1];

      for (let i = 0; i < cursors.length; i++) {
        // For each cursor, update their position after every CURSOR_DELAY_MS per cursor
        const timeToWait = (i + 1) * CURSOR_DELAY_MS;
        setTimeout(() => {
          // Change its transform
          cursors[i].style.transform = `translate(${x}px, ${y}px)`;
        }, timeToWait);
      }
    },
    true
  );

  // Track scroll events to update cursor visibility
  document.addEventListener(
    "scroll",
    function () {
      // Use last known mouse position to check if cursor effect should be visible
      checkCursorPosition(lastMousePosition.x, lastMousePosition.y);
    },
    true
  );

  // Initial check for cursor position
  document.addEventListener(
    "mousemove",
    function (event) {
      lastMousePosition.x = event.clientX;
      lastMousePosition.y = event.clientY;
      checkCursorPosition(event.clientX, event.clientY);
    },
    { once: true }
  );
});
