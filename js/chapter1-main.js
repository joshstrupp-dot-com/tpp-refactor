/**
 * Chapter 1 Main application entry point
 * Initializes the scrollytelling functionality for Chapter 1
 */

// Initialize on document load
document.addEventListener("DOMContentLoaded", () => {
  // using d3 for convenience
  const main = d3.select("main");
  const scrolly = main.select("#scrolly");
  const figure = scrolly.select("figure");
  const stepsContainer = scrolly.select("#steps-container");

  // initialize the scrollama
  const scroller = scrollama();

  // Initialize utils with DOM references
  initScrollyUtils(figure, stepsContainer, scroller, scrolly);

  // Preload data specifically for chapter 1
  window.dataCache = window.dataCache || {};

  function isMobileDevice() {
    return window.matchMedia("(max-width: 700px)").matches;
  }

  window.isMobileDevice = isMobileDevice;

  // Choose dataset based on device type
  const datasetUrl = isMobileDevice()
    ? "data/sh_train_subset.csv"
    : "data/sh_train_0409.csv";

  window.dataCache.datasetUrl = datasetUrl;

  // Chapter 1 uses some data for the blame game and fastest growing visualizations
  d3.csv(datasetUrl).then((data) => {
    window.dataCache.bookData = data;
  });

  // Generic window resize listener event
  function handleResize() {
    // Get current step elements
    const step = stepsContainer.selectAll(".step");

    // Calculate viewport height
    const viewportHeight = window.innerHeight;

    // Universal step positioning:
    // - First step of any chapter always starts at top (margin-top: 0)
    // - Steps have 50% viewport height margin between them
    // - This ensures steps trigger at 75% and transition at 25%

    // First step always starts at the top
    step.filter((d, i) => i === 0).style("margin-top", "0px");

    // Set vertical margin between steps to 50% viewport height
    // This creates the proper spacing for 75% trigger / 25% transition
    const verticalMargin = Math.floor(viewportHeight * 0.5);
    step.style("margin-bottom", `${verticalMargin}px`);

    // Handle last step margin based on whether it's a concluding header
    const lastStep = window.stepsConfig[window.stepsConfig.length - 1];
    const isLastStepHeader = lastStep && lastStep.customClass === "header";

    step
      .filter((d, i, nodes) => i === nodes.length - 1)
      .style(
        "margin-bottom",
        isLastStepHeader ? "0px" : `${Math.floor(viewportHeight * 0.1)}px`
      );

    // Set figure to take up full viewport height with padding
    figure.style("height", "calc(100vh - 2rem)").style("top", "1rem");

    // Tell scrollama to update new element dimensions
    scroller.resize();
  }

  function init() {
    // Clear localStorage to always use the configuration from chapter1-steps-config.js
    localStorage.removeItem("scrollySteps");

    // Always create fresh steps from the configuration
    window.scrollyTools.createSteps();

    // Add specific styling for first step to position it at the top
    stepsContainer.select(".step:first-child").style("margin-top", "0");

    // Set up resize handling
    handleResize();
    window.addEventListener("resize", handleResize);

    // Initialize scrollama
    window.scrollyTools.updateScrollama();

    // Trigger the first step's visualization immediately on load
    if (window.stepsConfig && window.stepsConfig.length > 0) {
      // Add active class to first step
      stepsContainer.select(".step:first-child").classed("is-active", true);

      // Render the first step's visualization
      const firstStep = window.stepsConfig[0];
      if (firstStep && firstStep.render) {
        firstStep.render();
      }

      // Apply fullwidth class if needed
      figure.classed("fullwidth", firstStep.fullwidth || false);
      scrolly.classed("fullwidth-active", firstStep.fullwidth || false);

      // Apply centered-statement class if needed
      stepsContainer
        .select(".step:first-child")
        .classed("centered-statement", firstStep.centerStatement || false);
    }
  }

  // Start the application
  init();
});
