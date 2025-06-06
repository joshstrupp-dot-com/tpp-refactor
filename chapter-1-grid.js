// Immediately Invoked Function Expression to prevent global variable conflicts
(function () {
  // Get the container element
  const gridContainer = document.getElementById("chapter-1-grid");

  // Make sure the container exists
  if (!gridContainer) {
    console.error("Could not find chapter-1-grid container");
    return;
  }

  // Create an overlay container for absolute positioning
  // This will remain fixed even when parent container changes
  const absoluteContainer = document.createElement("div");
  absoluteContainer.id = "chapter-1-grid-absolute";
  absoluteContainer.style.position = "fixed";
  absoluteContainer.style.top = "0";
  absoluteContainer.style.left = "0";
  absoluteContainer.style.width = "100%";
  absoluteContainer.style.height = "100%";
  absoluteContainer.style.pointerEvents = "none"; // Allow clicks to pass through
  absoluteContainer.style.zIndex = "1"; // Ensure it's on top
  document.body.appendChild(absoluteContainer);

  // Set container styles
  gridContainer.style.width = "100%";
  gridContainer.style.height = "100%";
  gridContainer.style.fontFamily = "Andale Mono, monospace";
  gridContainer.style.fontSize = "24px";
  gridContainer.style.color = "var(--color-base-darker)";
  gridContainer.style.position = "relative";
  gridContainer.style.left = "0";
  gridContainer.style.top = "0";

  // Create a map to store book positions from the blame-game step
  const bookPositions = new Map();

  // Keep track of initial load animation completion
  let initialAnimationComplete = false;

  // Keep track of whether we've frozen the positions
  let positionsFrozen = false;

  // Keep a reference to the book covers
  let bookElements = [];

  // Define specific books to include at non-sequential positions
  const specificBooks = [
    {
      position: 35,
      image: "assets/astro.jpg",
      name: "An Astronaut's Guide to Life on Earth",
    },
    {
      position: 105,
      image: "assets/whydoeshe.jpg",
      name: "Why Does He Do That?: Inside the Minds of Angry and Controlling Men",
    },
    {
      position: 70,
      image: "assets/dontwannatalk.jpg",
      name: "I Don't Want to Talk About It: Overcoming the Secret Legacy of Male Depression",
    },
    {
      position: 109,
      image: "assets/shutup.jpg",
      name: "Shut Up, Stop Whining, And Get a Life: A Kick-butt Approach to a Better Life",
    },
    {
      position: 32,
      image: "assets/souldetox.jpg",
      name: "Soul Detox: Clean Living in a Contaminated World",
    },
    {
      position: 62,
      image: "assets/rulesofwork.jpg",
      name: "The Rules Of Work: The Unspoken Truth About Getting Ahead In Business",
    },
  ];

  // Determine whether we should play the initial entry animation (only the first time this script is executed in the session)
  const playEntryAnimation = !window.blameGameAnimationPlayed;
  // Flag so that next executions know animation has been shown already
  window.blameGameAnimationPlayed = true;

  // Load and display book covers in a more compact grid with entry animation
  const datasetUrl =
    window.dataCache && window.dataCache.datasetUrl
      ? window.dataCache.datasetUrl
      : window.isMobileDevice && window.isMobileDevice()
      ? "data/sh_train_subset.csv"
      : "data/sh_train_0409.csv";

  const dataPromise =
    window.dataCache && window.dataCache.bookData
      ? Promise.resolve(window.dataCache.bookData)
      : d3.csv(datasetUrl);

  dataPromise.then((data) => {
      // Create a map to track which positions are already taken by specific books
      const takenPositions = new Set(
        specificBooks.map((book) => book.position)
      );

      // Create a list of all books to display (140 total)
      const allBooks = [];

      // Add the specific books at their designated positions
      specificBooks.forEach((book) => {
        allBooks[book.position] = {
          image_url: book.image,
          name: book.name,
          is_specific: true,
        };
      });

      // Fill in the remaining positions with books from the CSV
      let csvIndex = 0;
      for (let i = 0; i < 140; i++) {
        if (!takenPositions.has(i)) {
          if (csvIndex < data.length) {
            // Skip the book we want to exclude - using a more robust comparison
            const bookName = data[csvIndex].name || "";
            const bookToExclude =
              "Shut Up, Stop Whining, And Get a Life: A Kick-butt Approach to a Better Life";

            // Check if the book name contains the key parts of the title we want to exclude
            if (
              bookName.includes("Shut Up, Stop Whining") ||
              bookName.includes("Kick-butt Approach")
            ) {
              console.log("Skipping duplicate book:", bookName);
              csvIndex++;
              continue;
            }

            allBooks[i] = {
              ...data[csvIndex],
              is_specific: false,
            };
            csvIndex++;
          }
        }
      }

      // Filter out any undefined positions to get a clean array
      const covers = allBooks.filter((book) => book !== undefined);

      gridContainer.innerHTML = ""; // clear placeholder content

      // More compact grid layout with more columns and smaller gaps
      gridContainer.style.display = "grid";
      gridContainer.style.gridTemplateColumns = "repeat(20, 1fr)";
      gridContainer.style.gridTemplateRows = "repeat(7, auto)";
      gridContainer.style.gap = "8px";
      gridContainer.style.padding = "12px";
      gridContainer.style.justifyItems = "center";
      gridContainer.style.alignItems = "start";

      const styleSheet = document.createElement("style");
      styleSheet.textContent = `
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          60% { opacity: 1; transform: translateY(-5px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `;
      document.head.appendChild(styleSheet);

      // Calculate total animation time for all books
      const lastBookDelay = (covers.length - 1) * 0.035; // Reduced from 0.05 to 0.02
      const singleAnimDuration = 0.6; // Reduced from 0.7 to 0.4
      // If this is the first time, include the animation duration, otherwise skip waiting
      const totalAnimTime = playEntryAnimation
        ? lastBookDelay + singleAnimDuration + 0.4 // Reduced buffer from 0.5 to 0.3
        : 0;

      // Create placeholders in the grid
      covers.forEach((d, i) => {
        const placeholder = document.createElement("div");
        placeholder.style.width = "70px";
        placeholder.style.height = "100px"; // Approximate height
        placeholder.dataset.index = i;
        gridContainer.appendChild(placeholder);
      });

      // Create the actual book images
      covers.forEach((d, i) => {
        const img = document.createElement("img");
        img.src = d.image_url;
        img.style.width = "70px";
        img.style.height = "auto";
        img.style.boxShadow = "0 0 30px rgba(0, 0, 0, 0.1)";
        img.style.opacity = playEntryAnimation ? "0" : "1";
        img.style.pointerEvents = "none";
        img.dataset.index = i;
        img.dataset.bookId = d.book_id || i; // Store book ID if available
        img.dataset.name = d.name || ""; // Store book name
        img.dataset.isSpecific = d.is_specific ? "true" : "false"; // Mark if this is a specific book
        bookElements.push(img);

        // Add the initial animation only on the first visit
        if (playEntryAnimation) {
          img.style.animation = `fadeInUp 0.5s ease-out forwards ${i * 0.03}s`; // Reduced from 0.7s to 0.4s and from 0.05s to 0.02s
        }

        // Position it over its placeholder initially
        const placeholder = gridContainer.querySelector(
          `div[data-index="${i}"]`
        );
        if (placeholder) {
          const rect = placeholder.getBoundingClientRect();
          img.style.position = "fixed";
          img.style.left = `${rect.left}px`;
          img.style.top = `${rect.top}px`;

          // Store initial position for animation starting point
          bookPositions.set(i, {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          });
        }

        absoluteContainer.appendChild(img);
      });

      if (playEntryAnimation) {
        // Wait for the animation to finish before freezing positions
        setTimeout(() => {
          initialAnimationComplete = true;
          console.log(
            "Initial grid animation complete after",
            totalAnimTime,
            "seconds"
          );

          // If we're already in blame-game step, freeze positions
          if (currentStep === "blame-game" && !positionsFrozen) {
            freezeBookPositions();
          }
        }, totalAnimTime * 1000);
      } else {
        // No entry animation, mark as complete immediately and freeze positions if needed
        initialAnimationComplete = true;
        if (currentStep === "blame-game" && !positionsFrozen) {
          freezeBookPositions();
        }
      }
    })
    .catch((error) => {
      console.error("Error loading book covers:", error);
    });

  // Keep track of current step
  let currentStep = "";

  // Function to freeze book positions
  function freezeBookPositions() {
    if (!initialAnimationComplete) {
      console.log(
        "Waiting for initial animation to complete before freezing positions"
      );
      return;
    }

    if (positionsFrozen) {
      console.log("Positions already frozen, skipping");
      return;
    }

    console.log("Freezing book positions for step:", currentStep);

    // Update positions based on the current placeholders
    bookElements.forEach((img) => {
      const i = parseInt(img.dataset.index);
      const placeholder = gridContainer.querySelector(`div[data-index="${i}"]`);

      if (placeholder) {
        const rect = placeholder.getBoundingClientRect();

        // Update position data
        bookPositions.set(i, {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: placeholder.offsetHeight || rect.height,
        });

        // Position the image at its final resting place
        img.style.position = "fixed";
        img.style.left = `${rect.left}px`;
        img.style.top = `${rect.top}px`;
        img.style.width = `${rect.width}px`;
        img.style.height = "auto";
        img.style.opacity = "1";
        img.style.transform = "translate(0, 0) rotate(0deg)";
        img.style.animation = "none";
      }
    });

    positionsFrozen = true;

    // Store the visible viewport dimensions at freeze time
    window.gridViewportWidth = window.innerWidth;
    window.gridViewportHeight = window.innerHeight;
  }

  // Listen for grid visualization update events
  document.addEventListener("gridVisualizationUpdate", (event) => {
    const step = event.detail.step;
    currentStep = step;
    console.log(`Grid visualization step entered: ${step}`);

    if (step === "blame-game") {
      // Make absoluteContainer visible
      absoluteContainer.style.display = "block";

      // If the initial animation is already complete, freeze positions
      if (initialAnimationComplete && !positionsFrozen) {
        freezeBookPositions();
      }
    } else if (step === "blame-game-2") {
      // Add a style for the scale animation
      const scaleStyle = document.createElement("style");
      scaleStyle.textContent = `
        @keyframes scaleUp {
          0% { transform: scale(1); }
          100% { transform: scale(2); }
        }
      `;
      document.head.appendChild(scaleStyle);

      // Ensure positions are frozen before scaling
      if (!positionsFrozen && initialAnimationComplete) {
        freezeBookPositions();
      }

      // Apply scale animation only to the target book
      bookElements.forEach((img) => {
        const i = parseInt(img.dataset.index);
        const storedPos = bookPositions.get(i);

        if (!storedPos) {
          console.warn(`No stored position for book ${i}`);
          return;
        }

        // Reset any existing animations
        img.style.animation = "none";
        void img.offsetWidth; // Force reflow

        // Position book at stored position
        img.style.position = "fixed";
        img.style.left = `${storedPos.left}px`;
        img.style.top = `${storedPos.top}px`;
        img.style.width = `${storedPos.width}px`;
        img.style.opacity = "1";

        // Only apply scale animation if this is the target book
        if (
          img.dataset.name ===
            "I Don't Want to Talk About It: Overcoming the Secret Legacy of Male Depression" ||
          img.dataset.name === "An Astronaut's Guide to Life on Earth" ||
          img.dataset.name ===
            "Why Does He Do That?: Inside the Minds of Angry and Controlling Men"
        ) {
          img.style.animation = `scaleUp 0.5s ease-out forwards`;
          img.style.zIndex = "9999"; // Ensure it's above all other books
        } else {
          // Fade out all other books
          img.style.transition = "opacity 0.5s ease-out";
          img.style.opacity = "0.2";
        }
      });
    } else if (step === "blame-game-3") {
      // Add a style for the scale animations
      const scaleStyle = document.createElement("style");
      scaleStyle.textContent = `
        @keyframes scaleDown {
          0% { transform: scale(2); }
          100% { transform: scale(1); }
        }
        @keyframes scaleUp {
          0% { transform: scale(1); }
          100% { transform: scale(2); }
        }
      `;
      document.head.appendChild(scaleStyle);

      // Ensure positions are frozen before scaling
      if (!positionsFrozen && initialAnimationComplete) {
        freezeBookPositions();
      }

      // Apply scale animations to books
      bookElements.forEach((img) => {
        const i = parseInt(img.dataset.index);
        const storedPos = bookPositions.get(i);

        if (!storedPos) {
          console.warn(`No stored position for book ${i}`);
          return;
        }

        // Reset any existing animations
        img.style.animation = "none";
        void img.offsetWidth; // Force reflow

        // Position book at stored position
        img.style.position = "fixed";
        img.style.left = `${storedPos.left}px`;
        img.style.top = `${storedPos.top}px`;
        img.style.width = `${storedPos.width}px`;
        img.style.opacity = "1";

        // Check if this is one of the previously highlighted books
        if (
          img.dataset.name ===
            "I Don't Want to Talk About It: Overcoming the Secret Legacy of Male Depression" ||
          img.dataset.name === "An Astronaut's Guide to Life on Earth" ||
          img.dataset.name ===
            "Why Does He Do That?: Inside the Minds of Angry and Controlling Men"
        ) {
          // Scale down the previously highlighted books
          img.style.animation = `scaleDown 0.5s ease-out forwards`;
          img.style.zIndex = "1"; // Reset z-index

          // After scale down animation completes, set opacity to match other books
          setTimeout(() => {
            img.style.transition = "opacity 0.5s ease-out";
            img.style.opacity = "0.2";
          }, 500);
        }
        // Check if this is the new book to highlight from specificBooks
        else if (
          img.dataset.name ===
            "Shut Up, Stop Whining, And Get a Life: A Kick-butt Approach to a Better Life" ||
          img.dataset.name ===
            "Soul Detox: Clean Living in a Contaminated World" ||
          img.dataset.name ===
            "The Rules Of Work: The Unspoken Truth About Getting Ahead In Business"
        ) {
          // Scale up the new book
          img.style.animation = `scaleUp 0.5s ease-out forwards`;
          img.style.zIndex = "9999"; // Ensure it's above all other books
          img.style.opacity = "1";
        } else {
          // Keep other books at low opacity
          img.style.transition = "opacity 0.5s ease-out";
          img.style.opacity = "0.2";
        }
      });
    } else if (step === "systemic-problems") {
      // Add a style for the cascade animation
      const cascadeStyle = document.createElement("style");
      cascadeStyle.textContent = `
        @keyframes cascadeOut {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--target-x), 150vh) rotate(var(--rotate-deg)); opacity: 0; }
        }
        @keyframes scaleDown {
          0% { transform: scale(2); }
          100% { transform: scale(1); }
        }
        @keyframes fadeIn {
          0% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `;
      document.head.appendChild(cascadeStyle);

      // Ensure positions are frozen before cascading
      if (!positionsFrozen && initialAnimationComplete) {
        freezeBookPositions();
      }

      // First, transition all books back to their original state
      bookElements.forEach((img) => {
        const i = parseInt(img.dataset.index);
        const storedPos = bookPositions.get(i);

        if (!storedPos) {
          console.warn(`No stored position for book ${i}`);
          return;
        }

        // Reset any existing animations
        img.style.animation = "none";
        void img.offsetWidth; // Force reflow

        // Position book at stored position
        img.style.position = "fixed";
        img.style.left = `${storedPos.left}px`;
        img.style.top = `${storedPos.top}px`;
        img.style.width = `${storedPos.width}px`;
        img.style.transform = "translate(0, 0) rotate(0deg)";
        img.style.transformOrigin = "center";
        img.style.zIndex = "1"; // Reset z-index

        // Check if this is one of the previously highlighted books from blame-game-3
        if (
          img.dataset.name ===
            "Shut Up, Stop Whining, And Get a Life: A Kick-butt Approach to a Better Life" ||
          img.dataset.name ===
            "Soul Detox: Clean Living in a Contaminated World" ||
          img.dataset.name ===
            "The Rules Of Work: The Unspoken Truth About Getting Ahead In Business"
        ) {
          // Scale down the previously highlighted books
          img.style.animation = `scaleDown 0.5s ease-out forwards`;
        }

        // Fade in all books to full opacity
        img.style.transition = "opacity 0.5s ease-out";
        img.style.opacity = "1";
      });

      // Wait for the transition to complete before starting the cascade animation
      setTimeout(() => {
        // Calculate the center point (bottom middle of screen)
        const centerX = window.gridViewportWidth / 2;
        const bottomY = window.gridViewportHeight;

        // Apply cascade animation to each book with staggered delay
        bookElements.forEach((img) => {
          const i = parseInt(img.dataset.index);

          // Get stored position
          const storedPos = bookPositions.get(i);

          if (!storedPos) {
            console.warn(`No stored position for book ${i}`);
            return;
          }

          // Reset any existing animations
          img.style.animation = "none";
          void img.offsetWidth; // Force reflow

          // Make sure book is at its stored position before starting animation
          img.style.position = "fixed";
          img.style.left = `${storedPos.left}px`;
          img.style.top = `${storedPos.top}px`;
          img.style.width = `${storedPos.width}px`;
          img.style.opacity = "1";
          img.style.transform = "translate(0, 0) rotate(0deg)";

          // Calculate how far to move horizontally to reach center
          const currentX = storedPos.left + storedPos.width / 2;
          const targetX = centerX - currentX;
          img.style.setProperty("--target-x", `${targetX}px`);

          // Random rotation for more natural falling effect
          const randomRotation = -20 + Math.random() * 40;
          img.style.setProperty("--rotate-deg", `${randomRotation}deg`);

          // Apply animation with staggered delay
          const delay = 0.1 + i * 0.02 + Math.random() * 0.1; // Add some randomness to delay

          // Force a reflow again before adding the new animation
          void img.offsetWidth;

          img.style.animation = `cascadeOut 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards ${delay}s`;

          // Ensure proper transform origin
          img.style.transformOrigin = "center";
        });
      }, 600); // Wait for the transition to complete (0.5s + 0.1s buffer)
    } else {
      // For other steps, hide the absolute container
      absoluteContainer.style.display = "none";
    }
  });

  // Clean up function to remove the absolute container when moving to a different chapter
  function cleanup() {
    if (absoluteContainer && absoluteContainer.parentNode) {
      absoluteContainer.parentNode.removeChild(absoluteContainer);
    }
  }

  // Listen for chapter changes
  document.addEventListener("chapterChange", cleanup);

  // Also clean up when window unloads
  window.addEventListener("unload", cleanup);

  // --- Overlay cleanup: Remove overlay if grid container is removed from DOM ---
  const observer = new MutationObserver(() => {
    if (!document.getElementById("chapter-1-grid")) {
      if (absoluteContainer && absoluteContainer.parentNode) {
        absoluteContainer.parentNode.removeChild(absoluteContainer);
      }
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
