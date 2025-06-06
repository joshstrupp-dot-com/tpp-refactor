const chapter1StepsConfig = [
  {
    id: "chapter-1",
    text: `<span class="eyebrow">Chapter One</span><span style="opacity: 0.4">Life is hard. Advice can help.</span> And there <video src="assets/videos/yt1.mp4" style="display: inline-block; width: ${
      window.innerWidth <= 768 ? "80px" : "150px"
    }; vertical-align: middle; margin: 0 5px;" autoplay muted loop playsinline></video>  is no <video src="assets/videos/yt2.mp4" style="display: inline-block; width: ${
      window.innerWidth <= 768 ? "80px" : "150px"
    }; vertical-align: middle; margin: 0 5px;" autoplay muted loop playsinline></video> shortage 
     of <video src="assets/videos/yt3.mp4" style="display: inline-block; width: ${
       window.innerWidth <= 768 ? "80px" : "150px"
     }; vertical-align: middle; margin: 0 5px;" autoplay muted loop playsinline></video> advice.`,
    fullwidth: true,
    customClass: "header",
    render: () => {
      const figure = d3.select("#figure-container");
      figure.html("");
    },
  },

  {
    id: "quick-fixes",
    text: "You're one Amazon order from never aging again. You're 8 minutes from knowing all of Wall Street's secrets.",
    fullwidth: true,
    fadeIn: true,
    // fadeOut: true,
    render: () => {
      const figure = d3.select("#figure-container");
      figure.html("");

      // Ensure any previous blame-game visualization is cleared from the DOM
      const existingOverlay = document.getElementById(
        "chapter-1-grid-absolute"
      );
      if (existingOverlay) {
        existingOverlay.remove();
      }

      // Add scrolling words animation container
      const container = figure
        .append("div")
        .style("height", "100%")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center");

      // Create a search bar container
      const searchBarContainer = container
        .append("div")
        .style("border", "1px solid black")
        .style("border-radius", "100px")
        .style("margin-left", window.innerWidth < 700 ? "1em" : "6em")
        .style("margin-right", window.innerWidth < 700 ? "1em" : "6em")
        .style("display", "flex")
        .style("align-items", "center")
        .style("padding", "10px 20px")
        .style("box-shadow", "0 0 30px rgba(0, 0, 0, 0.1)");
      // Add the search icon
      searchBarContainer
        .append("img")
        .attr("src", "assets/search-icon.svg")
        .style("height", "26px")
        .style("padding-left", "10px")
        .style("margin-right", "20px");

      // Create the scrolling words container
      const scrollingContainer = searchBarContainer
        .append("div")
        .attr("class", "scrolling-words-container")
        .style("display", "flex")
        .style("align-items", "center")
        .style("font-size", window.innerWidth < 700 ? "18px" : "24px")
        .style("font-weight", "100")
        .style("font-family", "Andale Mono, monospace");

      // Create the scrolling words box
      const scrollingBox = scrollingContainer
        .append("div")
        .attr("class", "scrolling-words-box")
        .style("height", window.innerWidth < 700 ? "2.5rem" : "3rem")
        .style("margin", "auto")
        .style("overflow", "hidden");

      // Create the list of scrolling words
      const wordsList = scrollingBox
        .append("ul")
        .style("margin", "0 0.625rem")
        .style("padding", "0")
        .style("animation", "scrollUp 14s forwards"); // Changed to forwards instead of infinite

      // Add the scrolling words
      const words = [
        { text: "am I a bad parent?", color: "#000" },
        { text: "why do I feel alone?", color: "#000" },
        { text: "how to get six pack in 30 days?", color: "#000" },
        { text: 'What is "Self-Help?"', color: "#000" },
      ];
      words.forEach((word) => {
        wordsList
          .append("li")
          .style("display", "flex")
          .style("align-items", "center")
          .style("justify-content", "flex-start")
          .style("height", window.innerWidth < 700 ? "2.5rem" : "3rem")
          .style("list-style", "none")
          .style("color", word.color)
          .text(word.text);
      });

      // Add the keyframes for the scrolling animation
      const styleSheet = document.createElement("style");
      styleSheet.textContent = `
        @keyframes scrollUp {
          0%, 12% {
            transform: translateY(0%);
          }
          15%, 27% {
            transform: translateY(-25%);
          }
          30%, 42% {
            transform: translateY(-50%);
          }
          45%, 100% {
            transform: translateY(-75%);
          }
        }
      `;
      document.head.appendChild(styleSheet);
    },
  },

  {
    id: "blame-game",
    text: "Self-help literature is the fastest growing nonfiction genre since 2013. ",
    fullwidth: true,
    render: () => {
      // Clear existing content and remove any lingering assets from other steps
      const figure = d3.select("#figure-container");
      figure.html("");

      // Remove systemic-problems background images if present
      d3.select("#background-images").remove();

      // Create a container for the grid visualization
      const vizContainer = figure
        .append("div")
        .attr("id", "chapter-1-grid")
        .style("width", "100%")
        .style("height", "100%");

      // Load and execute chapter-1-grid.js
      const script = document.createElement("script");
      script.src = "chapter-1-grid.js";
      document.body.appendChild(script);

      // Dispatch an initialization event
      setTimeout(() => {
        document.dispatchEvent(
          new CustomEvent("gridVisualizationUpdate", {
            detail: { step: "blame-game" },
          })
        );
      }, 500);
    },
  },

  {
    id: "blame-game-2",
    text: "Some of these books contain researched, proven advice. But others are, unfortunately, capitalizing off our fears.",
    fullwidth: true,
    render: () => {
      // Update the existing grid visualization
      document.dispatchEvent(
        new CustomEvent("gridVisualizationUpdate", {
          detail: { step: "blame-game-2" },
        })
      );
    },
  },
  {
    id: "blame-game-3",
    text: "There are authors who have something to gain by convincing you that your dead-end job is your fault and yours to fix; or that you're depressed because you're not doing enough squat jumps. ",
    fullwidth: true,
    fadeOut: true,
    render: () => {
      // Update the existing grid visualization
      document.dispatchEvent(
        new CustomEvent("gridVisualizationUpdate", {
          detail: { step: "blame-game-3" },
        })
      );
    },
  },
  {
    id: "systemic-problems",
    text: "<span style='opacity: 0.4'>If it suggests you're not enough,</span> it's a smoke screen.",
    fullwidth: true,
    customClass: "header",
    render: () => {
      // Ensure any previous fastest-growing rectangles are removed
      d3.select("#chapter-1").remove();

      // Update the existing grid visualization
      document.dispatchEvent(
        new CustomEvent("gridVisualizationUpdate", {
          detail: { step: "systemic-problems" },
        })
      );
      // Remove any existing overlay to avoid duplicates
      d3.select("#background-images").remove();

      // Create a container for background images at the top level
      const bgContainer = d3
        .select("body")
        .append("div")
        .attr("id", "background-images")
        .style("position", "fixed")
        .style("top", "0")
        .style("left", "0")
        .style("width", "100vw")
        .style("height", "100vh")
        .style("pointer-events", "none")
        .style("z-index", "2000");

      // No longer preloading rectangles here - using data preloading instead

      // Get all PNG files from the directory
      fetch("assets/smoke-screen-images/")
        .then((response) => response.text())
        .then((data) => {
          // Parse HTML response to get all PNG files
          const parser = new DOMParser();
          const doc = parser.parseFromString(data, "text/html");
          const files = Array.from(doc.querySelectorAll("a"))
            .map((a) => a.href)
            .filter((href) => href.endsWith(".png"));

          let remainingImages = [...files];
          let lastQuadrant = null;

          // Define quadrants
          const quadrants = [
            { name: "top", yRange: [0, 0.25] },
            { name: "right", yRange: [0.25, 0.75], xRange: [0.75, 1] },
            { name: "bottom", yRange: [0.75, 1] },
            { name: "left", yRange: [0.25, 0.75], xRange: [0, 0.25] },
          ];

          // Function to get next random image
          const getNextImage = () => {
            if (remainingImages.length === 0) {
              remainingImages = [...files];
            }
            const randomIndex = Math.floor(
              Math.random() * remainingImages.length
            );
            return remainingImages.splice(randomIndex, 1)[0];
          };

          // Function to get random position in a quadrant
          const getQuadrantPosition = (quadrant) => {
            let x, y;

            if (quadrant.name === "top") {
              x = Math.random() * (window.innerWidth - 150);
              y =
                window.innerHeight * quadrant.yRange[0] +
                Math.random() *
                  window.innerHeight *
                  (quadrant.yRange[1] - quadrant.yRange[0]);
            } else if (quadrant.name === "bottom") {
              x = Math.random() * (window.innerWidth - 150);
              y =
                window.innerHeight * quadrant.yRange[0] +
                Math.random() *
                  window.innerHeight *
                  (quadrant.yRange[1] - quadrant.yRange[0]);
            } else {
              x =
                window.innerWidth * quadrant.xRange[0] +
                Math.random() *
                  window.innerWidth *
                  (quadrant.xRange[1] - quadrant.xRange[0]);
              y =
                window.innerHeight * quadrant.yRange[0] +
                Math.random() *
                  window.innerHeight *
                  (quadrant.yRange[1] - quadrant.yRange[0]);
            }

            return { x, y };
          };

          // Function to get random quadrant (different from last one)
          const getRandomQuadrant = () => {
            let availableQuadrants = quadrants.filter(
              (q) => q.name !== lastQuadrant
            );
            const quadrant =
              availableQuadrants[
                Math.floor(Math.random() * availableQuadrants.length)
              ];
            lastQuadrant = quadrant.name;
            return quadrant;
          };

          // Function to create and animate a single image
          const createAnimatedImage = () => {
            const imageSrc = getNextImage();
            const quadrant = getRandomQuadrant();
            const position = getQuadrantPosition(quadrant);

            // Create image element
            const img = bgContainer
              .append("img")
              .attr("src", imageSrc)
              .style("position", "absolute")
              .style("width", "150px")
              .style("height", "auto")
              .style("opacity", "0")
              .style("transition", "opacity 2s ease-in-out")
              .style("z-index", "2001")
              .style("filter", "grayscale(100%)");

            img
              .style("left", `${position.x}px`)
              .style("top", `${position.y}px`);

            // Fade in
            setTimeout(() => {
              img.style("opacity", "0.3");

              // Start fade out after 5 seconds
              setTimeout(() => {
                img.style("opacity", "0");
                // Remove element after fade out completes
                setTimeout(() => {
                  img.remove();
                }, 2000);
              }, 5000);
            }, 100);

            // Schedule next image every 1.5 seconds
            setTimeout(createAnimatedImage, 500);
          };

          // Start the animation after 1 second
          setTimeout(createAnimatedImage, 1000);
        });
    },
  },
  {
    id: "fastest-growing",
    text: `I used machine learning to classify 20,000 books into 10 categories that designate what problem they aim to address, then organized them into two umbrella categories.<br><br>Books that claim the problem comes from:<br><br>THE WORLD — think society, family, metaphysics.<br><br>YOU — think self-esteem, willpower, internalized doubt`,
    fullwidth: true,
    fadeOut: true,
    render: () => {
      // Fade out and remove all background images
      const bgContainer = d3.select("#background-images");
      if (!bgContainer.empty()) {
        bgContainer
          .selectAll("img")
          .style("transition", "opacity 1s ease-in-out")
          .style("opacity", "0");

        // Remove the container after fade out completes
        setTimeout(() => {
          bgContainer.remove();
        }, 1000);
      }

      // Ensure any previous blame-game visualization is cleared from the DOM
      const existingOverlay = document.getElementById(
        "chapter-1-grid-absolute"
      );
      if (existingOverlay) {
        existingOverlay.remove();
      }

      // Always load fresh but use preloaded data
      console.log("Loading fastest-growing visualization with preloaded data");

      // Clear existing content
      const figure = d3.select("#figure-container");
      figure.html("");

      // Create a container for the chapter-1 visualization
      const vizContainer = figure
        .append("div")
        .attr("id", "chapter-1")
        .style("width", "100%")
        .style("height", "100%");

      // Load and execute chapter-1-dev.js, then trigger visualization steps
      const script = document.createElement("script");
      script.src = "./chapter-1-dev.js";

      script.onload = () => {
        // Intro step – reveal the grid instantly (no animation needed for appearance)
        document.dispatchEvent(
          new CustomEvent("visualizationUpdate", {
            detail: { step: "intro" },
          })
        );

        // After 3.2 s sort into category piles (intro-2)
        setTimeout(() => {
          document.dispatchEvent(
            new CustomEvent("visualizationUpdate", {
              detail: { step: "intro-2" },
            })
          );
        }, 3200);
      };

      document.body.appendChild(script);
    },
  },

  {
    id: "chapter-1-end",
    text: `<span class="eyebrow">Chapter One</span><span style="opacity: 0.4">Placeholder ending text for Chapter 1.</span> Coming soon.`,
    fullwidth: true,
    customClass: "header",
    render: () => {
      const figure = d3.select("#figure-container");
      figure.html("");

      // Add Chapter 2 button to the final header step
      setTimeout(() => {
        // Remove any existing button first
        d3.select("#chapter-2-button").remove();

        // Create button container with high z-index
        const buttonContainer = d3
          .select("body")
          .append("div")
          .attr("id", "chapter-2-button-container")
          .style("position", "fixed")
          .style("bottom", "2rem")
          .style("left", "50%")
          .style("transform", "translateX(-50%)")
          .style("z-index", "10000") // Very high z-index to appear on top
          .style("pointer-events", "none"); // Allow clicks to pass through container

        const button = buttonContainer
          .append("div")
          .attr("id", "chapter-2-button")
          .style("background", "transparent")
          .style("color", "black")
          .style("border", "2px solid black")
          .style("padding", "1rem 2rem")
          .style("border-radius", "30px")
          .style("cursor", "pointer")
          .style("font-family", "Andale Mono, monospace")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .style("letter-spacing", "2px")
          .style("text-transform", "uppercase")
          .style("box-shadow", "0 4px 15px rgba(0,0,0,0.1)")
          .style("transition", "all 0.3s ease")
          .style("opacity", "0")
          .style("pointer-events", "all") // Allow clicks on button
          .text("Chapter 2")
          .on("click", () => {
            window.location.href = "chapter2.html";
          })
          .on("mouseover", function () {
            d3.select(this)
              .style("background", "black")
              .style("color", "white")
              .style("transform", "scale(1.05)");
          })
          .on("mouseout", function () {
            d3.select(this)
              .style("background", "transparent")
              .style("color", "black")
              .style("transform", "scale(1)");
          });

        // Fade in the button
        button.transition().duration(1000).style("opacity", "1");
      }, 500);
    },
  },
];

// Make steps available globally
window.stepsConfig = chapter1StepsConfig;
