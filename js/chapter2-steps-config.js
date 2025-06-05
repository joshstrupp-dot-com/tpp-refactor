const chapter2StepsConfig = [
  {
    id: "chapter-2",
    text: `<span class="eyebrow">Chapter Two</span>The very first self-help book is, surprise, called <em>"Self Help"</em>.`,
    fullwidth: true,
    customClass: "header",
    render: () => {
      const figure = d3.select("#figure-container");
      figure.html("");
    },
  },

  {
    id: "samuel-smiles",
    text: "The very first Self Help book was a response to poor working conditions.",
    fullwidth: true,
    fadeIn: true,
    render: () => {
      // Clear existing content
      const figure = d3.select("#figure-container");
      figure.html("");

      // Create a container for the chapter-2 visualization
      const vizContainer = figure
        .append("div")
        .attr("id", "chapter-2")
        .style("width", "100%")
        .style("height", "100%");

      // Load and execute chapter-2-dev.js
      const script = document.createElement("script");
      script.src = "chapter-2-dev.js";
      document.body.appendChild(script);

      // Dispatch an initialization event
      setTimeout(() => {
        document.dispatchEvent(
          new CustomEvent("visualizationUpdate", {
            detail: { step: "samuel-smiles" },
          })
        );
      }, 100);
    },
  },

  {
    id: "post-20s",
    text: `This trend of responding to external forces continued until The Great Depression gave rise to entirely new sub-genres of self-help — books that see stock markets crash and claim you "win friends and influence people" or use "the power of positive thinking" to take back control.`,
    fullwidth: true,
    render: () => {
      // Just update the existing visualization
      document.dispatchEvent(
        new CustomEvent("visualizationUpdate", {
          detail: { step: "post-20s" },
        })
      );
    },
  },

  {
    id: "neoliberal-shift",
    text: `Eventually we get to the "Me Decade." Flower power blossomed and Watergate sowed doubt, Reagan Era neoliberalism was on the rise. "YOU can take care of yourself" became the common sentiment. Suddenly, book shelves saw fewer guides to changing the world, and more manuals for changing yourself.`,
    fullwidth: true,
    render: () => {
      // Just update the existing visualization
      document.dispatchEvent(
        new CustomEvent("visualizationUpdate", {
          detail: { step: "neoliberal-shift" },
        })
      );
    },
  },

  {
    id: "all-years",
    text: `The gap finally closes as we enter the 21st century. Self-help pivots toward coping and finding resilience within yourself. Many authors push "personal hustle" as a response to economic insecurity, or "leaning in" first, addressing sexism second.`,
    fullwidth: true,
    fadeOut: true,
    render: () => {
      // Just update the existing visualization
      document.dispatchEvent(
        new CustomEvent("visualizationUpdate", {
          detail: { step: "all-years" },
        })
      );
    },
  },

  {
    id: "chapter-2-end",
    text: `<span class="eyebrow">Chapter Two</span><span style="opacity: 0.4">Placeholder ending text for Chapter 2.</span> Coming soon.`,
    fullwidth: true,
    customClass: "header",
    render: () => {
      const figure = d3.select("#figure-container");
      figure.html("");

      // Add Chapter 3 button to the final header step
      setTimeout(() => {
        // Remove any existing button first
        d3.select("#chapter-3-button").remove();

        // Create button container with high z-index
        const buttonContainer = d3
          .select("body")
          .append("div")
          .attr("id", "chapter-3-button-container")
          .style("position", "fixed")
          .style("bottom", "2rem")
          .style("left", "50%")
          .style("transform", "translateX(-50%)")
          .style("z-index", "10000") // Very high z-index to appear on top
          .style("pointer-events", "none"); // Allow clicks to pass through container

        const button = buttonContainer
          .append("div")
          .attr("id", "chapter-3-button")
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
          .text("Chapter 3")
          .on("click", () => {
            window.location.href = "chapter3.html";
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
window.stepsConfig = chapter2StepsConfig;
