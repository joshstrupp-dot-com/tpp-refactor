// Chapter 1 - Simple Data Visualization
(async function () {
  ///////////////////////////////////////////////////////////// ! Data Preloading
  // Global data cache
  window.dataCache = window.dataCache || {};

  // Detect if the current device is likely a mobile device
  const isMobile =
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;

  // Preload all needed datasets at the start
  function preloadAllData() {
    // Preload time data
    if (!window.dataCache.timeData) {
      console.log("Preloading time data");
      d3.csv("./data/sh_0415_time/sh_0415_time.csv")
        .then(function (data) {
          // On mobile, keep only the first 10,000 records for performance
          if (isMobile && data.length > 10000) {
            data = data.slice(0, 10000);
          }
          window.dataCache.timeData = data;
          console.log("Time data preloaded:", data.length, "records");

          // If this is the first data loaded, display it immediately
          if (!window.dataCache.authorData) {
            displayData(data);
          }
        })
        .catch(function (error) {
          console.error("Error preloading time data:", error);
        });
    }

    // Preload author data
    if (!window.dataCache.authorData) {
      console.log("Preloading author data");
      d3.csv("./data/sh_0415_author/author.csv")
        .then(function (data) {
          // On mobile, keep only the first 10,000 records for performance
          if (isMobile && data.length > 10000) {
            data = data.slice(0, 10000);
          }
          window.dataCache.authorData = data;
          console.log("Author data preloaded:", data.length, "records");

          // If time data is already loaded, display it now
          if (window.dataCache.timeData) {
            displayData(window.dataCache.timeData);
          }
        })
        .catch(function (error) {
          console.error("Error preloading author data:", error);
        });
    }
  }

  // Start preloading all data immediately
  preloadAllData();

  ///////////////////////////////////////////////////////////// ! Setup and Configuration
  // Find the chapter-1 container
  const chapter1Div = document.getElementById("chapter-1");

  if (!chapter1Div) {
    console.error("#chapter-1 container not found");
    return;
  }

  console.log("Using container:", chapter1Div.id);

  // Configure the container
  chapter1Div.style.width = "100vw";
  chapter1Div.style.height = "100vh";
  chapter1Div.style.margin = "0";
  chapter1Div.style.padding = "0";
  chapter1Div.style.border = "none";
  chapter1Div.style.overflow = "hidden";
  chapter1Div.style.position = "relative";

  // Wait for container to be properly sized before proceeding
  function waitForDimensions() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 40; // 2 seconds maximum wait

      const checkDimensions = () => {
        const width = chapter1Div.clientWidth || window.innerWidth;
        const height = chapter1Div.clientHeight || window.innerHeight;

        if (width > 0 && height > 0) {
          console.log(`Container dimensions ready: ${width}x${height}`);
          resolve({ width, height });
        } else if (attempts >= maxAttempts) {
          // Fallback to viewport dimensions after timeout
          console.warn(
            "Container dimensions timeout, using viewport dimensions"
          );
          resolve({ width: window.innerWidth, height: window.innerHeight });
        } else {
          attempts++;
          setTimeout(checkDimensions, 50);
        }
      };
      checkDimensions();
    });
  }

  // Get the actual dimensions of the container with fallback to viewport
  const { width, height } = await waitForDimensions();

  // Set up margins for the chart
  const margin = { top: 0, right: 20, bottom: 20, left: 20 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  ///////////////////////////////////////////////////////////// ! Rectangle Calculations
  // Target number of rectangles (approximate)
  // Use a smaller target count on mobile devices for better performance
  const targetCount = isMobile ? 10000 : 45000;
  const spacing = 1;

  // Calculate rectangle dimensions to fit the available space
  // Maintain aspect ratio of 3:5
  const aspectRatio = 3 / 5;

  // Calculate optimal dimensions based on available space and target count
  const rectHeight = Math.sqrt(
    (chartWidth * chartHeight) / (targetCount * aspectRatio)
  );
  const rectWidth = rectHeight * aspectRatio;

  // Calculate total width and height needed for each rectangle including spacing
  const totalRectWidth = rectWidth + 2 * spacing;
  const totalRectHeight = rectHeight + 2 * spacing;

  // Calculate how many rectangles can fit in each dimension
  const rectsPerRow = Math.floor(chartWidth / totalRectWidth);
  const rectsPerColumn = Math.floor(chartHeight / totalRectHeight);

  // Calculate total number of rectangles that can fit
  const totalRectangles = rectsPerRow * rectsPerColumn;

  console.log(
    `Rectangle size: ${rectWidth.toFixed(2)}x${rectHeight.toFixed(2)} pixels`
  );
  console.log(`Number of rectangles that can fit: ${totalRectangles}`);
  console.log(
    `Rectangles per row: ${rectsPerRow}, Rectangles per column: ${rectsPerColumn}`
  );

  ///////////////////////////////////////////////////////////// ! Create SVG
  // Create SVG container with explicit pixel dimensions
  let svg;
  try {
    svg = d3
      .select("#chapter-1")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block");

    console.log(`SVG created successfully with dimensions: ${width}x${height}`);
  } catch (error) {
    console.error("Error creating SVG:", error);
    // Try fallback approach
    svg = d3
      .select("#chapter-1")
      .append("svg")
      .style("width", "100vw")
      .style("height", "100vh")
      .style("display", "block");
  }

  // Add a group for zoom transformation
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add window resize handler to update SVG dimensions
  let resizeTimeout;
  window.addEventListener("resize", () => {
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newWidth = chapter1Div.clientWidth || window.innerWidth;
      const newHeight = chapter1Div.clientHeight || window.innerHeight;

      if (newWidth > 0 && newHeight > 0) {
        svg.attr("width", newWidth).attr("height", newHeight);
      }
    }, 100);
  });

  ///////////////////////////////////////////////////////////// ! Zoom Behavior
  // Create zoom behavior
  const zoom = d3
    .zoom()
    .scaleExtent([1, 10])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    })
    .filter((event) => {
      // Disable mouse wheel/scroll zooming
      return !event.type.includes("wheel");
    });

  // Apply zoom behavior to svg
  svg.call(zoom);

  // Variable to track if we've zoomed in on a specific book
  let zoomedIn = false;
  let activeRectangle = null;

  // Track if data display is complete
  let dataDisplayComplete = false;

  // Define categories globally for reuse
  // Self-help categories (teal/internal)
  const selfHelpCategories = [
    "Stress Management",
    "Underachievement & Stalled Potential",
    "Identity, Self-Image & Belonging",
    "Confidence & Assertiveness Issues",
    "Life Direction & Motivation",
  ];

  // Other categories (orange/external)
  const otherCategories = [
    "Finding Meaning in Metaphysics",
    "Interpersonal & Family Dynamics",
    "Mental & Emotional Health",
    "Spiritual & Existential Crisis",
    "Structural & Physical Challenges",
  ];

  // All categories combined
  const allCategories = [...selfHelpCategories, ...otherCategories];

  ///////////////////////////////////////////////////////////// ! Data Display Function
  // Function to display data as a grid of rectangles
  function displayData(data) {
    console.log(
      "displayData called with data:",
      data ? data.length : "null",
      "records"
    );

    if (data && data.length > 0) {
      // Calculate how many records we can display
      const recordsToDisplay = Math.min(data.length, totalRectangles);
      console.log(
        "Will display",
        recordsToDisplay,
        "records out of",
        totalRectangles,
        "total rectangles"
      );

      // Add tooltip div to body
      const tooltip = d3.select("body").append("div").attr("class", "tooltip");

      // Create rectangles for each record - optimized for performance
      const rects = [];

      // Pre-calculate positions for all rectangles
      for (let i = 0; i < recordsToDisplay; i++) {
        const row = Math.floor(i / rectsPerRow);
        const col = i % rectsPerRow;
        const x = col * totalRectWidth + spacing;
        const y = row * totalRectHeight + spacing;

        rects.push({
          x: x,
          y: y,
          data: data[i],
        });
      }

      // Batch create rectangles for better performance
      console.log("Creating", rects.length, "rectangle elements");
      const rectElements = g
        .selectAll("rect")
        .data(rects)
        .enter()
        .append("rect")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("fill", "var(--color-base-darker)")
        .attr("stroke", "rgba(0, 0, 0, 0.1)")
        .attr("rx", 1)
        .datum((d) => d.data)
        .style("opacity", 0)
        .on("mouseover", function (event, d) {
          // Show tooltip with book name
          tooltip
            .html(
              `
              <span style="
                color: #000;
                font-family: 'Andale Mono';
                font-size: 12px;
                font-style: normal;
                font-weight: 400;
                line-height: 30px;
                letter-spacing: 3px;
                text-transform: uppercase;
                opacity: 0.5;
              ">TITLE:</span>
              <strong>${d.name || "Unnamed Record"}</strong>
            `
            )
            .style("opacity", 0.9)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          // Hide tooltip
          tooltip.style("opacity", 0);
        });

      console.log("Rectangle elements created:", rectElements.size());

      // Mark data display as complete
      dataDisplayComplete = true;
      console.log("Data display complete, ready for animations");

      // Add click handler to background to zoom out
      svg.on("click", function (event) {
        if (zoomedIn && !event.defaultPrevented) {
          // Reset active rectangle
          activeRectangle = null;

          // Zoom out to initial state
          svg
            .transition()
            .duration(750)
            .call(
              zoom.transform,
              d3.zoomIdentity.translate(margin.left, margin.top).scale(1)
            );

          zoomedIn = false;
        }
      });
    }
  }

  ///////////////////////////////////////////////////////////// ! Data Loading
  // Try loading data
  function loadData() {
    // First, check if data is already preloaded in dataCache
    if (window.dataCache && window.dataCache.timeData) {
      console.log("Using preloaded time data");
      displayData(window.dataCache.timeData);
      return;
    }

    // Otherwise, fall back to loading data directly
    try {
      console.log("Loading time data directly");
      d3.csv("./data/sh_0415_time/sh_0415_time.csv")
        .then((data) => {
          // On mobile, keep only the first 10,000 records for performance
          if (isMobile && data.length > 10000) {
            data = data.slice(0, 10000);
          }
          console.log("Time data loaded:", data.length, "records");
          displayData(data);
        })
        .catch(() => {
          console.log("Falling back to fetch method");
          // Alternative fetch method if d3.csv fails
          fetch("./data/sh_0415_time/sh_0415_time.csv")
            .then((response) => response.text())
            .then((csvText) => {
              const rows = csvText.split("\n");
              const headers = rows[0].split(",");
              const parsedData = rows.slice(1).map((row) => {
                const values = row.split(",");
                const obj = {};
                headers.forEach((header, i) => {
                  obj[header] = values[i];
                });
                return obj;
              });

              // On mobile, keep only the first 10,000 records for performance
              const limitedData =
                isMobile && parsedData.length > 10000
                  ? parsedData.slice(0, 10000)
                  : parsedData;

              console.log(
                "Time data loaded via fetch:",
                limitedData.length,
                "records"
              );
              displayData(limitedData);
            })
            .catch((error) => {
              console.error("Error loading data:", error);
              useHardcodedData();
            });
        });
    } catch (error) {
      console.error("Error in loadData:", error);
      useHardcodedData();
    }
  }

  // Load data when visualization is ready
  loadData();

  // Function to generate hard-coded data if CSV loading fails
  function useHardcodedData() {
    console.warn("Using hard-coded data as fallback");
    const fakeData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Book ${i}`,
      value: Math.random() * 100,
    }));
    displayData(fakeData);
  }

  ///////////////////////////////////////////////////////////// ! Helper Functions
  // Function to process the intro step with animation
  function processIntroStep() {
    // Reset/initial view
    svg
      .transition()
      .duration(0)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(margin.left, margin.top).scale(1)
      );
    zoomedIn = false;
    g.selectAll("rect").attr("fill", "var(--color-base-darker)");

    // Position all rectangles in their grid positions but with opacity 0
    g.selectAll("rect")
      .attr("x", (d, i) => (i % rectsPerRow) * totalRectWidth + spacing)
      .attr(
        "y",
        (d, i) => Math.floor(i / rectsPerRow) * totalRectHeight + spacing
      )
      .style("opacity", 0);

    // Check if rectangles exist before starting animation
    const allRects = g.selectAll("rect");
    console.log("Total rectangles found for animation:", allRects.size());

    if (allRects.empty()) {
      console.warn("No rectangles found! Animation cannot proceed.");
      return;
    }

    // Batch transitions for better performance
    const transitions = [];
    console.log("Starting row-by-row animation for", rectsPerColumn, "rows");
    for (let row = 0; row < rectsPerColumn; row++) {
      const rowRects = g
        .selectAll("rect")
        .filter((d, i) => Math.floor(i / rectsPerRow) === row);

      console.log(`Row ${row}: ${rowRects.size()} rectangles`);

      transitions.push(
        rowRects
          .transition()
          .delay(row * 30) // Further reduced delay for smoother appearance
          .duration(150) // Shorter duration for snappier feel
          .ease(d3.easeCubicInOut)
          .style("opacity", 1)
      );
    }
    console.log(
      "Animation transitions started for",
      transitions.length,
      "rows"
    );

    // Remove any category labels
    g.selectAll(".category-label").remove();
  }

  ///////////////////////////////////////////////////////////// ! Event Handling
  document.addEventListener("visualizationUpdate", (event) => {
    const stepId = event.detail.step;
    console.log("visualizationUpdate event received for step:", stepId);

    // Apply step-specific changes to your visualization
    if (stepId === "intro") {
      console.log("Processing intro step - showing rectangles with animation");
      console.log("Data display complete status:", dataDisplayComplete);

      // If data display isn't complete yet, wait for it
      if (!dataDisplayComplete) {
        console.log("Data not ready, waiting...");
        const checkDataReady = () => {
          if (dataDisplayComplete) {
            console.log("Data now ready, proceeding with intro animation");
            processIntroStep();
          } else {
            setTimeout(checkDataReady, 100);
          }
        };
        checkDataReady();
        return;
      }

      processIntroStep();
    } else if (stepId === "book-emphasis") {
      // Reset/initial view similar to intro
      svg
        .transition()
        .duration(0)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(margin.left, margin.top).scale(1)
        );
      zoomedIn = false;
      g.selectAll("rect").attr("fill", "var(--color-base-darker)");

      // Reset positions to grid
      g.selectAll("rect")
        .transition()
        .duration(750)
        .ease(d3.easeCubicInOut) // Added easing for smoother grid reset
        .attr("x", function (d, i) {
          const col = i % rectsPerRow;
          return col * totalRectWidth + spacing;
        })
        .attr("y", function (d, i) {
          const row = Math.floor(i / rectsPerRow);
          return row * totalRectHeight + spacing;
        });
      // .style("opacity", 0)
      // .transition()
      // .duration(1000)
      // .style("opacity", 1);

      // Remove any category labels
      g.selectAll(".category-label").remove();

      // After the grid is set up, highlight specific books
      setTimeout(() => {
        const targetBooks = [
          "Trade Your Way to Financial Freedom",
          "The Art of Being Kind",
          "Being Happy!",
        ];

        g.selectAll("rect")
          .filter((d) => d && targetBooks.includes(d.name))
          .each(function (d, i) {
            const rect = d3.select(this);
            const x = parseFloat(rect.attr("x"));
            const y = parseFloat(rect.attr("y"));

            // Grow the rectangle like on hover
            rect
              .transition()
              .duration(400)
              .ease(d3.easeElasticOut) // Added elastic easing for a more dynamic expansion
              .attr("width", rectWidth * 50)
              .attr("height", rectHeight * 40)
              .attr("x", x - rectWidth / 2)
              .attr("y", y - rectHeight / 2);

            // Add text label
            const expandedWidth = rectWidth * 50;
            const expandedHeight = rectHeight * 40;
            const padding = 20;
            const textWidth = expandedWidth - padding * 2;

            g.append("foreignObject")
              .attr("class", "temp-book-name")
              .attr("x", x - rectWidth / 2 + padding)
              .attr("y", y - rectHeight / 2 + padding)
              .attr("width", textWidth)
              .attr("height", expandedHeight - padding * 2)
              .style("opacity", 0)
              .html(
                `<div style="
                font-family: 'Libre Franklin', sans-serif;
                font-weight: 200;
                font-size: 12px;
                color: #000;
                width: 100%;
                height: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
              ">${d.name || "Unnamed Record"}</div>`
              )
              .transition()
              .duration(400)
              .ease(d3.easeCubicInOut) // Added easing for smoother text appearance
              .style("opacity", 1);
          });
      }, 500);
      // Reduced wait time from 1500ms to 500ms for quicker highlighting

      // Add a new step to return to normal view after book emphasis
    } else if (stepId === "book-emphasis-closed") {
      // Remove any temporary book name elements
      g.selectAll(".temp-book-name")
        .transition()
        .duration(400)
        .style("opacity", 0)
        .remove();

      // Return all highlighted rectangles to their original size
      const targetBooks = [
        "Trade Your Way to Financial Freedom",
        "The Art of Being Kind",
        "Being Happy!",
      ];

      g.selectAll("rect")
        .filter((d) => d && targetBooks.includes(d.name))
        .transition()
        .duration(400)
        .ease(d3.easeCubicInOut) // Added easing for smoother return to original size
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("x", function (d) {
          return d.x;
        })
        .attr("y", function (d) {
          return d.y;
        });
    } else if (stepId === "intro-2") {
      // Create category piles in a grid layout (5 columns, 2 rows)
      const pilePositions = {};
      const gridCols = 5;
      const colWidth = chartWidth / gridCols;
      const rowHeight = chartHeight / 3;

      // Position self-help categories on top row
      selfHelpCategories.forEach((category, i) => {
        pilePositions[category] = {
          x: colWidth * (i + 0.5),
          y: rowHeight * 1,
        };
      });

      // Position other categories on bottom row
      otherCategories.forEach((category, i) => {
        pilePositions[category] = {
          x: colWidth * (i + 0.5),
          y: rowHeight * 2,
        };
      });

      // Add an "Uncategorized" position for any that don't match
      pilePositions["Uncategorized"] = {
        x: chartWidth / 2,
        y: rowHeight * 2.5,
      };

      // Prepare nodes for positioning
      const nodes = [];
      g.selectAll("rect").each(function (d) {
        if (!d) return; // Skip if no data

        const rect = d3.select(this);
        let targetCat = "Uncategorized";

        // Find which category this rectangle belongs to
        if (d.key_cat_primary_agg) {
          if (allCategories.includes(d.key_cat_primary_agg)) {
            targetCat = d.key_cat_primary_agg;
          }
        }

        // Store node data
        nodes.push({
          category: targetCat,
          element: this,
          x: parseFloat(rect.attr("x")) + rectWidth / 2,
          y: parseFloat(rect.attr("y")) + rectHeight / 2,
        });
      });

      // Apply positions with more heavily staggered movement in batches
      const batchSize = 400; // Increase batch size from 50 to 100
      const totalTime = 500; // Reduce total time from 2000 to 700ms

      // Process nodes in batches
      for (
        let batch = 0;
        batch < Math.ceil(nodes.length / batchSize);
        batch++
      ) {
        const start = batch * batchSize;
        const end = Math.min(start + batchSize, nodes.length);

        // Add a delay between batches - reduce delay between batches
        const batchDelay = batch * 70; // Reduce from 200ms to 70ms per batch

        // Process this batch
        for (let i = start; i < end; i++) {
          const node = nodes[i];
          const pos = pilePositions[node.category];

          // Skip any nodes with undefined positions
          if (!pos) continue;

          // Add random offset within the pile to create natural clustering
          const offsetX = (Math.random() - 0.5) * colWidth * 0.4;
          const offsetY = (Math.random() - 0.5) * rowHeight * 0.25;

          // Calculate target position
          const targetX = pos.x + offsetX;
          const targetY = pos.y + offsetY;

          // Apply transition with delay
          const withinBatchDelay = Math.random() * 130; // Reduce from 400ms to 130ms

          // Get the data associated with this node
          const nodeData = d3.select(node.element).datum();

          // Determine the target color based on category
          let targetColor = "var(--color-base-darker)";
          if (nodeData && nodeData.key_cat_primary_agg) {
            if (selfHelpCategories.includes(nodeData.key_cat_primary_agg)) {
              targetColor = "var(--color-orange)";
            } else if (otherCategories.includes(nodeData.key_cat_primary_agg)) {
              targetColor = "var(--color-teal)";
            }
          }

          // Apply both position and color transitions simultaneously
          d3.select(node.element)
            .transition()
            .delay(batchDelay + withinBatchDelay)
            .duration(80) // Reduce from 100ms to 80ms
            .ease(d3.easeCubicInOut) // Changed from easeQuadOut to easeCubicInOut for smoother movement
            .attr("x", targetX - rectWidth / 2)
            .attr("y", targetY - rectHeight / 2)
            .attr("fill", targetColor);
        }
      }

      // Remove any existing category labels
      g.selectAll(".category-label").remove();

      // Add category labels for all categories
      allCategories.forEach((category) => {
        const pos = pilePositions[category];
        if (!pos) return;

        // Calculate width constraint - make it narrower than the column width
        const labelWidth = colWidth * 0.8; // Use 80% of column width

        // Use foreignObject instead of text element to allow HTML/CSS for text wrapping
        g.append("foreignObject")
          .attr("class", "category-label")
          .attr("x", pos.x - labelWidth / 2) // Center the foreignObject
          .attr("y", pos.y - rowHeight * 0.35) // Position slightly higher to account for wrapped text
          .attr("width", labelWidth)
          .attr("height", rowHeight * 0.3) // Provide enough height for two lines of text
          .html(
            `<div style="
            width: 100%;
            text-align: center;
            font-family: 'Andale Mono', monospace;
            font-weight: 200;
            font-size: ${window.innerWidth <= 768 ? "8px" : "12px"};
            color: #000;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${category}</div>`
          )
          .attr("filter", "drop-shadow(0 0 30px rgba(0, 0, 0, 0.1))");
      });
    } else if (stepId === "external-internal") {
      console.log("external-internal step is now combined with intro-2");
    } else if (stepId === "external-internal-sort") {
      // Define positions for the two piles on the right half of the screen
      const worldPilePosition = {
        x: chartWidth * 0.25,
        y: chartHeight * 0.3,
      };

      const youPilePosition = {
        x: chartWidth * 0.25,
        y: chartHeight * 0.7,
      };

      // Remove any existing category labels
      g.selectAll(".category-label").remove();

      // Add labels for the two piles with fade-in animation
      g.append("foreignObject")
        .attr("class", "category-label")
        .attr("x", chartWidth * 0.2)
        .attr("y", worldPilePosition.y - 50)
        .attr("width", chartWidth * 1)
        .attr("height", 150)
        .style("opacity", 0)
        .html(
          `<div style="
          width: 100%;
          text-align: center;
          font-family: 'Big Caslon', sans-serif;
          font-size: 50px;
          font-style: normal;
          font-weight: 800;
          line-height: 100px;
          text-transform: uppercase;
          color: #000;
          white-space: nowrap;
        ">THE WORLD</div>`
        )
        .transition()
        .duration(1500)
        .style("opacity", 1);

      g.append("foreignObject")
        .attr("class", "category-label")
        .attr("x", chartWidth * 0.2)
        .attr("y", youPilePosition.y - 50)
        .attr("width", chartWidth * 1)
        .attr("height", 150)
        .style("opacity", 0)
        .html(
          `<div style="
          width: 100%;
          text-align: center;
          font-family: 'Big Caslon', sans-serif;
          font-size: 50px;
          font-style: normal;
          font-weight: 800;
          line-height: 100px;
          text-transform: uppercase;
          color: #000;
          white-space: nowrap;
        ">YOU</div>`
        )
        .transition()
        .duration(1500)
        .style("opacity", 1);

      // Create ordered arrays of categories from left to right
      const orderedSelfHelpCategories = [...selfHelpCategories];
      const orderedOtherCategories = [...otherCategories];

      // Prepare nodes for positioning with category information
      const nodes = [];
      g.selectAll("rect").each(function (d) {
        if (!d) return;

        const rect = d3.select(this);
        const currentFill = rect.attr("fill");
        let targetPile;
        let categoryIndex = -1;

        if (currentFill === "var(--color-teal)") {
          targetPile = "world";
          if (d.key_cat_primary_agg) {
            categoryIndex = orderedOtherCategories.indexOf(
              d.key_cat_primary_agg
            );
          }
        } else if (currentFill === "var(--color-orange)") {
          targetPile = "you";
          if (d.key_cat_primary_agg) {
            categoryIndex = orderedSelfHelpCategories.indexOf(
              d.key_cat_primary_agg
            );
          }
        } else {
          return;
        }

        nodes.push({
          pile: targetPile,
          element: this,
          x: parseFloat(rect.attr("x")) + rectWidth / 2,
          y: parseFloat(rect.attr("y")) + rectHeight / 2,
          categoryIndex: categoryIndex,
        });
      });

      // Sort nodes by category index (left to right)
      nodes.sort((a, b) => a.categoryIndex - b.categoryIndex);

      // Process nodes in category-based batches
      const batchSize = 200;
      const categoryDelay = 400; // Reduced from 800ms to 400ms for faster category transitions

      // Group nodes by category index
      const nodesByCategory = {};
      nodes.forEach((node) => {
        const key = node.categoryIndex;
        if (!nodesByCategory[key]) {
          nodesByCategory[key] = [];
        }
        nodesByCategory[key].push(node);
      });

      // Process each category group in sequence
      Object.entries(nodesByCategory).forEach(
        ([categoryIndex, categoryNodes], categoryOrder) => {
          // Process nodes within this category
          for (let i = 0; i < categoryNodes.length; i++) {
            const node = categoryNodes[i];
            const pos =
              node.pile === "world" ? worldPilePosition : youPilePosition;

            // Add random offset within the pile
            const offsetX = (Math.random() - 0.5) * 500;
            const offsetY = (Math.random() - 0.5) * 250;

            // Calculate target position
            const targetX = pos.x + offsetX;
            const targetY = pos.y + offsetY;

            // Apply transition with category-based delay
            const withinCategoryDelay = Math.random() * 300; // Increased from 130ms to 300ms for more spread
            const totalDelay =
              categoryOrder * categoryDelay + withinCategoryDelay;

            d3.select(node.element)
              .transition()
              .delay(totalDelay)
              .duration(400) // Increased from 80ms to 400ms for slower movement
              .ease(d3.easeCubicInOut)
              .attr("x", targetX - rectWidth / 2)
              .attr("y", targetY - rectHeight / 2);
          }
        }
      );
    } else if (stepId === "goodreads-data") {
      // Remove our visualization when moving to the next section
      const chapter1Div = document.getElementById("chapter-1");
      if (chapter1Div) {
        chapter1Div.innerHTML = "";
      }
    }
  });
})();
