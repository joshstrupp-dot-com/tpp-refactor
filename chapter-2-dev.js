///////////////////////////////////////////////////////////// ! Setup and Configuration
// Immediately Invoked Function Expression to prevent global variable conflicts
(function () {
  // Adjust chapter-2 div to fill the viewport
  const chapter2Div = document.getElementById("chapter-2");
  chapter2Div.style.width = "100vw";
  chapter2Div.style.height = "100vh";
  chapter2Div.style.margin = "0";
  chapter2Div.style.padding = "0";
  chapter2Div.style.border = "none";
  chapter2Div.style.overflow = "hidden";
  chapter2Div.style.position = "relative";

  // Get the actual dimensions of the container
  const fullWidth = chapter2Div.clientWidth;
  const fullHeight = chapter2Div.clientHeight;

  // Set up margins for the chart
  const margin = { top: 100, right: 100, bottom: 100, left: 100 };
  const width = fullWidth - margin.left - margin.right;
  const height = fullHeight - margin.top - margin.bottom;

  // Global variables to track state
  let currentVisibleCount = 1;
  let svg;
  let x;
  let y;
  let chartData;
  let years;
  let color;
  let categoryData;
  let categories;
  let showCategories = false; // Default to showing problem origin data
  let showPercentage = false; // Default to showing count data
  // Tooltip div for hotspots
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "5px")
    .style("border", "1px solid #ccc")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Add a style element for the pulsating animation
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    @keyframes pulsate {
      0% {
        r: 10;
        opacity: .3;
        stroke-width: 1;
      }
      
      70% {
        r: 12;
        opacity: 1;
        stroke-width: 3;
      }
      
      100% {
        r: 10;
        opacity: .3;
        stroke-width: 1;
      }
    }
    
    .hotspot-pulse {
      animation: pulsate 2s infinite;
    }
    
    @keyframes marquee {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    
    .keyword-ticker {
      display: inline-block;
      animation: marquee 15s linear infinite;
      min-width: 100%;
      font-family: monospace;
      font-size: 14px;
    }
  `;
  document.head.appendChild(styleElement);

  // Function to create safe CSS selector from category name
  function makeSafeSelector(name) {
    // Replace any characters that aren't valid in CSS selectors
    return name.replace(/[&]/g, "and").replace(/[^a-zA-Z0-9-_]/g, "-");
  }

  ///////////////////////////////////////////////////////////// ! Chart Update Function
  // Function to update the chart with new data range
  function updateChart() {
    // Get visible years based on current count
    const visibleYears = years.slice(0, currentVisibleCount);

    // Get max count based on what data is currently visible and display mode
    let overallMax;

    if (showPercentage) {
      overallMax = 100; // Fixed range for percentage mode
    } else if (showCategories) {
      // Only consider category data for count mode
      const visibleCatData = categoryData.filter((d) =>
        visibleYears.includes(d.year)
      );
      overallMax = d3.max(visibleCatData, (d) => d.value);
    } else {
      // Only consider problem origin data for count mode
      const visibleData = chartData.filter((d) =>
        visibleYears.includes(d.year)
      );
      overallMax = d3.max(visibleData, (d) => Math.max(d.INTERNAL, d.EXTERNAL));
    }

    // Update scales
    x.domain(visibleYears);
    y.domain([0, overallMax]);

    // Update x-axis with transition
    svg
      .attr("class", "annotation")
      .select(".x-axis")
      .transition()
      .duration(500)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", currentVisibleCount > 16 ? "end" : "middle")
      .attr("transform", currentVisibleCount > 16 ? "rotate(-45)" : "rotate(0)")
      .attr("dx", currentVisibleCount > 16 ? "-0.8em" : "0")
      .attr("dy", currentVisibleCount > 16 ? "0.15em" : "0.5em");

    // Update y-axis with transition
    svg.select(".y-axis").transition().duration(500).call(d3.axisLeft(y));

    // Update y-axis label
    svg
      .select(".y-axis-label")
      .attr("class", "annotation")
      .text(showPercentage ? "Percentage (%)" : "Count");

    // Line generator function
    const line = d3
      .line()
      .x((d) => x(d.year) + x.bandwidth() / 2)
      .y((d) => y(d.value))
      .defined((d) => !isNaN(d.value))
      .curve(d3.curveCardinal); // Change to curved line

    // Update visibility and lines for each origin
    ["INTERNAL", "EXTERNAL"].forEach((origin) => {
      // Filter data to only visible years for this update
      const visibleLineData = chartData
        .filter((d) => visibleYears.includes(d.year))
        .map((d) => {
          if (showPercentage) {
            // Calculate percentage
            const total = d.INTERNAL + d.EXTERNAL;
            const percentage = total > 0 ? (d[origin] / total) * 100 : 0;
            return {
              year: d.year,
              value: percentage,
              names: d[`${origin}_names`],
            };
          } else {
            return {
              year: d.year,
              value: d[origin],
              names: d[`${origin}_names`],
            };
          }
        });

      // Create or update gradient for this origin
      const gradientId = `line-gradient-${origin}`;

      // Remove any existing gradient with this ID
      svg.select(`#${gradientId}`).remove();

      // Create new gradient
      const gradient = svg
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", (d) => x(visibleLineData[0]?.year) + x.bandwidth() / 2) // leftmost point
        .attr("y1", 0)
        .attr(
          "x2",
          (d) =>
            x(visibleLineData[visibleLineData.length - 1]?.year) +
            x.bandwidth() / 2
        ) // rightmost point
        .attr("y2", 0);

      // Add gradient stops
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color(origin))
        .attr("stop-opacity", 0.2);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color(origin))
        .attr("stop-opacity", 1);

      // Before applying the filter, first remove any existing filters
      svg.select(`.line-${origin}`).style("filter", null);

      // Then apply the new filter
      svg
        .select(`.line-${origin}`)
        .style("filter", "drop-shadow(0px 5px 5px rgba(0,0,0,0.1))");

      // Update the actual data line
      svg
        .select(`.line-${origin}`)
        .datum(visibleLineData)
        .transition()
        .duration(500)
        .attr("d", line)
        .style("opacity", showCategories ? 0 : 1) // Hide when showing categories
        .style("fill", "none") // Ensure no fill
        .style("stroke", `url(#${gradientId})`) // Apply gradient to stroke
        .style("stroke-width", 2);

      ///////////////////////////////////////////////////////////// ! Hotspot Definition

      const hotspots = svg
        .selectAll(`.hotspot-${origin}`)
        .data(visibleLineData, (d) => d.year);
      hotspots.exit().remove();
      hotspots
        .enter()
        .append("circle")
        .attr("class", `hotspot hotspot-${origin}`)
        .attr("r", 5)
        .attr("fill", "var(--color-base)")
        .attr("stroke", color(origin))
        .attr("stroke-width", 1.5)
        .style("opacity", 0.0)
        .merge(hotspots)
        .transition()
        .duration(500)
        .attr("cx", (d) => x(d.year) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d.value));
    });

    // Update category lines
    categories.forEach((category) => {
      // Filter to visible years for this category
      const visibleCatLineData = categoryData.filter(
        (d) => d.category === category && visibleYears.includes(d.year)
      );

      // Map to percentage values if needed
      const mappedCatLineData = visibleCatLineData.map((d) => {
        if (showPercentage) {
          // Find the year's total across all categories
          const yearTotal = categoryData
            .filter((item) => item.year === d.year)
            .reduce((sum, item) => sum + item.value, 0);

          // Calculate the percentage
          const percentage = yearTotal > 0 ? (d.value / yearTotal) * 100 : 0;
          return { ...d, value: percentage };
        }
        return d;
      });

      const safeSelector = makeSafeSelector(category);

      // Update the line
      svg
        .select(`.line-${safeSelector}`)
        .datum(mappedCatLineData)
        .transition()
        .duration(500)
        .attr("d", line)
        .style("opacity", showCategories ? 1 : 0); // Show only when categories are enabled
    });

    // Update button state
    const button = d3.select("#expand-chart");
    if (currentVisibleCount >= years.length) {
      button.attr("disabled", true);
    } else {
      button.attr("disabled", null);
    }

    // Update chart title based on what's shown
    let titleText = showCategories
      ? "Categories by Year"
      : "Problem Origin by Year";
    titleText += showPercentage ? " (Percentage)" : " (Count)";
    svg.select(".chart-title").text(titleText);

    // At the end of updateChart(), update overlay and hover line dimensions
    // Update overlay and hover line dimensions
    svg
      .select(".hover-capture-rect")
      .attr("width", width)
      .attr("height", height);
    svg.select(".hover-vertical-line").attr("y1", 0).attr("y2", height);
  }

  ///////////////////////////////////////////////////////////// ! Toggle Categories Function
  // Function to toggle between problem origin and categories
  function toggleCategories() {
    showCategories = d3.select("#toggle-categories").property("checked");
    updateChart();

    // Update legend visibility based on what's shown
    d3.selectAll(".origin-legend").style("opacity", showCategories ? 0 : 1);
    d3.selectAll(".category-legend").style("opacity", showCategories ? 1 : 0);
  }

  ///////////////////////////////////////////////////////////// ! Toggle Percentage Function
  // Function to toggle between count and percentage view
  function togglePercentage() {
    showPercentage = d3.select("#toggle-percentage").property("checked");
    updateChart();
  }

  ///////////////////////////////////////////////////////////// ! Data Loading and Processing
  // Load the CSV file and create a line chart
  function loadVisualizationData() {
    // First check if data is already preloaded in dataCache
    if (window.dataCache && window.dataCache.timeData) {
      console.log("Using preloaded time data in chapter-2");
      createVisualization(window.dataCache.timeData);
      return;
    }

    // Otherwise, load data directly
    d3.csv("data/sh_0415_time/sh_0415_time.csv")
      .then(createVisualization)
      .catch((error) => console.error("Error loading CSV:", error));
  }

  // Start loading data immediately
  loadVisualizationData();

  function createVisualization(data) {
    // Filter out specific year bins
    const filteredData = data.filter(
      (d) =>
        d.year_bin_5yr !== "0_0_pre-1855" &&
        d.year_bin_5yr !== "0_pre-1855" &&
        d.year_bin_5yr !== "9_post-2014"
    );

    ///////////////////////////////////////////////////////////// ! Data Aggregation
    // Group data by year_bin_5yr and problem_origin, and count records
    const groupedData = d3.rollup(
      filteredData,
      (v) => ({
        count: v.length,
        names: v.map((d) => d.name),
      }),
      (d) => d.year_bin_5yr,
      (d) => d.problem_origin
    );

    // Group data by year_bin_5yr and key_cat_primary_agg
    const groupedCategoryData = d3.rollup(
      filteredData,
      (v) => ({
        count: v.length,
        names: v.map((d) => d.name),
      }),
      (d) => d.year_bin_5yr,
      (d) => d.key_cat_primary_agg
    );

    // Get all unique categories
    categories = [
      ...new Set(filteredData.map((d) => d.key_cat_primary_agg)),
    ].filter(Boolean);

    ///////////////////////////////////////////////////////////// ! Data Transformation
    // Convert the nested Map to an array format suitable for lines
    years = Array.from(groupedData.keys()).sort();
    chartData = years.map((year) => {
      const yearData = { year: year };
      const origins = groupedData.get(year);
      // Add counts and names for each problem origin
      yearData.INTERNAL = origins.get("INTERNAL")?.count || 0;
      yearData.INTERNAL_names = origins.get("INTERNAL")?.names || [];
      yearData.EXTERNAL = origins.get("EXTERNAL")?.count || 0;
      yearData.EXTERNAL_names = origins.get("EXTERNAL")?.names || [];
      return yearData;
    });

    // Create flattened category data for easier plotting
    categoryData = [];
    years.forEach((year) => {
      const yearCats = groupedCategoryData.get(year);
      if (yearCats) {
        categories.forEach((category) => {
          const catData = yearCats.get(category);
          if (catData) {
            categoryData.push({
              year,
              category,
              value: catData.count,
              names: catData.names,
            });
          } else {
            categoryData.push({
              year,
              category,
              value: 0,
              names: [],
            });
          }
        });
      }
    });

    // Get first 6 years for initial view
    const visibleYears = years.slice(0, currentVisibleCount);

    // Get max count only from visible years' data based on what's shown by default
    const visibleData = chartData.filter((d) => visibleYears.includes(d.year));
    const visibleMax = d3.max(visibleData, (d) =>
      Math.max(d.INTERNAL, d.EXTERNAL)
    );

    ///////////////////////////////////////////////////////////// ! Create SVG
    svg = d3
      .select("#chapter-2")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("display", "block")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // --- Universal Hover Line Setup ---
    // Aggregate historical context by year
    const historicalContextByYear = {};
    const keywordsByYear = {}; // New object to store keywords by year
    years.forEach((year) => {
      // Get all historical_context entries for this year
      const entries = filteredData.filter(
        (d) =>
          d.year_bin_5yr === year &&
          d.historical_context &&
          d.historical_context.trim() !== ""
      );
      let allEvents = [];
      entries.forEach((d) => {
        // Split by line (\n or \r\n)
        const events = d.historical_context
          .split(/\r?\n/)
          .map((e) => e.trim())
          .filter(Boolean);
        allEvents = allEvents.concat(events);
      });
      // Count frequency
      const freq = {};
      allEvents.forEach((e) => {
        freq[e] = (freq[e] || 0) + 1;
      });
      // Sort by frequency, then alphabetically
      const sorted = Object.entries(freq).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
      );
      // Remove near-duplicates (case-insensitive, ignore punctuation/parentheses)
      const uniqueEvents = [];
      const seen = new Set();
      sorted.forEach(([event]) => {
        // Normalize: lowercase, remove punctuation, parentheses, and extra spaces
        const norm = event
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (!seen.has(norm)) {
          seen.add(norm);
          uniqueEvents.push(event);
        }
      });
      // Take top 3 unique
      historicalContextByYear[year] = uniqueEvents.slice(0, 3);

      // Collect keywords for this year
      const keywordEntries = filteredData.filter(
        (d) => d.year_bin_5yr === year && d.keywords && d.keywords.trim() !== ""
      );
      let allKeywords = [];
      keywordEntries.forEach((d) => {
        // Split by comma and trim each keyword
        const keywords = d.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
        allKeywords = allKeywords.concat(keywords);
      });
      // Store all keywords as a comma-separated string
      keywordsByYear[year] = allKeywords.join(", ");
    });

    // Create a group for the image and its overlay
    const imageGroup = svg.append("g").attr("class", "hover-image-group");

    // Create a map to store image elements for each year
    const yearImages = {};
    const imageIndicators = {}; // Store indicators for each year

    // Define which years have images
    const yearsWithImages = [
      "1855-1859",
      "1860-1864",
      "1865-1869",
      "1870-1874",
      "1875-1879",
      "1880-1884",
      "1885-1889",
      "1890-1894",
      "1895-1899",
      "1900-1904",
      "1905-1909",
      "1910-1914",
      "1915-1919",
      "1920-1924",
      "1925-1929",
      "1930-1934",
      "1935-1939",
      "1940-1944",
      "1945-1949",
      "1950-1954",
      "1955-1959",
      "1960-1964",
      "1965-1969",
      "1970-1974",
      "1975-1979",
      "1980-1984",
      "1985-1989",
      "1990-1994",
      "1995-1999",
      "2000-2004",
      "2005-2009",
      "2010-2014",
      "2015-2019",
    ];

    // Create image elements only for years that have images
    yearsWithImages.forEach((year) => {
      // Create a safe filename from the year (replace hyphens with underscores)
      const safeYearName = year.replace(/-/g, "_");

      // Use a consistent naming pattern for the image files
      // Format: assets/chap-2-hover-imgs/year_YYYY_YYYY.webp
      const imagePath = `assets/chap-2-hover-imgs/year_${safeYearName}.webp`;

      // Create a group for this year's image and indicator
      const yearGroup = imageGroup
        .append("g")
        .attr("class", `hover-group-${safeYearName}`);

      // Create the image element
      const yearImage = yearGroup
        .append("image")
        .attr("class", `hover-image-${safeYearName}`)
        .attr("xlink:href", imagePath)
        .attr("width", 150)
        .attr("height", height)
        .attr("preserveAspectRatio", "xMidYMid slice")
        .style("opacity", 0)
        .style("clip-path", "inset(0 0 0 0 round 5px 5px 0 0)");

      // Create the indicator rectangle
      const indicator = yearGroup
        .append("rect")
        .attr("class", `hover-indicator-${safeYearName}`)
        .attr("width", 4) // Swapped with height
        .attr("height", 20) // Reduced from 40 to 20 for a shorter vertical line
        .attr("x", 73) // Center the 4px wide indicator on the 150px wide image (150/2 - 2)
        .attr("y", height - 25) // Position near bottom with room for the height
        .attr("rx", 1) // Border radius
        .style("fill", "#F3F1EE")
        .style("stroke", "#000")
        .style("stroke-width", 1)
        .style("filter", "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.2))")
        .style("opacity", 0);

      // Store both elements in their respective maps
      yearImages[year] = yearImage;
      imageIndicators[year] = indicator;
    });

    // Add the grain texture overlay
    const grainOverlay = imageGroup
      .append("image")
      .attr("class", "grain-overlay")
      .attr("xlink:href", "assets/textures/grain.webp")
      .attr("width", 150)
      .attr("height", height)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .style("opacity", 0)
      .style("mix-blend-mode", "overlay")
      .style("clip-path", "inset(0 0 0 0 round 5px 5px 0 0)");

    // Create a top-level group for the year label to ensure it's always on top
    const yearLabelGroup = svg.append("g").attr("class", "year-label-group");

    // Add year label text
    const yearLabel = yearLabelGroup
      .append("text")
      .attr("class", "annotation")
      .attr("font-size", "14px")
      .attr("text-anchor", "middle")
      .style("opacity", 0);

    // Add book count text below the year label
    const bookCountLabel = yearLabelGroup
      .append("text")
      .attr("class", "annotation")
      .style("font-size", "14px")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em") // Position below the year label
      .style("opacity", 0);

    // Add a transparent rect overlay to capture mouse events
    svg
      .append("rect")
      .attr("class", "hover-capture-rect")
      .attr("width", width)
      .attr("height", height)
      .on("mousemove", onMouseMove)
      .on("mouseleave", onMouseLeave);

    // Mouse event handlers for universal hover
    function onMouseMove(event) {
      const [mouseX, mouseY] = d3.pointer(event, this);
      // Find the closest year bin
      const bandWidth = x.bandwidth();
      let closestYear = years[0];
      let minDist = Infinity;
      years.slice(0, currentVisibleCount).forEach((year) => {
        const yearX = x(year) + bandWidth / 2;
        const dist = Math.abs(mouseX - yearX);
        if (dist < minDist) {
          minDist = dist;
          closestYear = year;
        }
      });

      // Get the x position for the closest year
      const xPos = x(closestYear) + bandWidth / 2;

      // Check if we're hovering over a hotspot
      const isOnHotspot = d3.select(event.target).classed("hotspot");

      // If we're on a hotspot, hide all universal hover elements
      if (isOnHotspot) {
        // Interrupt any ongoing transitions and hide all images and indicators
        Object.values(yearImages).forEach((img) => {
          img.interrupt().style("opacity", 0);
        });
        Object.values(imageIndicators).forEach((indicator) => {
          indicator.interrupt().style("opacity", 0);
        });
        grainOverlay.interrupt().style("opacity", 0);
        yearLabel.interrupt().style("opacity", 0);
        bookCountLabel.interrupt().style("opacity", 0);
        return;
      }

      // Handle universal hover if not on a hotspot
      const hasImage = yearImages[closestYear] !== undefined;
      if (hasImage) {
        // Position and show the year label
        yearLabelGroup.attr("transform", `translate(${xPos}, 20)`);
        yearLabel.interrupt().text(closestYear).style("opacity", 1);

        // Calculate total books for this year
        const yearData = chartData.find((d) => d.year === closestYear);
        const totalBooks = yearData ? yearData.INTERNAL + yearData.EXTERNAL : 0;

        // Update and show the book count label with proper singular/plural form
        const bookText = totalBooks === 1 ? "book" : "books";
        bookCountLabel
          .interrupt()
          .text(`${totalBooks} ${bookText}`)
          .style("opacity", 1);

        // Position the image group
        imageGroup.attr("transform", `translate(${xPos - 75}, 0)`);

        // First hide all images and indicators immediately
        Object.entries(yearImages).forEach(([year, img]) => {
          if (year !== closestYear) {
            img.interrupt().style("opacity", 0);
            imageIndicators[year].interrupt().style("opacity", 0);
          }
        });
        // Also reset the grain overlay so it starts hidden each hover
        grainOverlay.interrupt().style("opacity", 0);

        // Then show only the current year's image and indicator with fade
        yearImages[closestYear]
          .interrupt()
          .transition()
          .duration(1000)
          .style("opacity", 0.4);
        imageIndicators[closestYear]
          .interrupt()
          .transition()
          .duration(1000)
          .style("opacity", 1);
        grainOverlay
          .interrupt()
          .transition()
          .duration(1000)
          .style("opacity", 0.5);
      } else {
        // Hide all hover effects with fade if there's no image
        yearLabel.interrupt().transition().duration(1000).style("opacity", 0);
        bookCountLabel
          .interrupt()
          .transition()
          .duration(1000)
          .style("opacity", 0);
        grainOverlay
          .interrupt()
          .transition()
          .duration(1000)
          .style("opacity", 0);
        Object.values(yearImages).forEach((img) => {
          img.interrupt().transition().duration(1000).style("opacity", 0);
        });
        Object.values(imageIndicators).forEach((indicator) => {
          indicator.interrupt().transition().duration(1000).style("opacity", 0);
        });
      }
    }

    function onMouseLeave() {
      // Interrupt any ongoing transitions and hide all elements with fade
      Object.values(yearImages).forEach((img) => {
        img.interrupt().transition().duration(1000).style("opacity", 0);
      });
      grainOverlay.interrupt().transition().duration(1000).style("opacity", 0);
      Object.values(imageIndicators).forEach((indicator) => {
        indicator.interrupt().transition().duration(1000).style("opacity", 0);
      });
      yearLabel.interrupt().transition().duration(1000).style("opacity", 0);
      bookCountLabel
        .interrupt()
        .transition()
        .duration(1000)
        .style("opacity", 0);
    }

    ///////////////////////////////////////////////////////////// ! Scales Definition
    // Set up scales
    x = d3.scaleBand().domain(visibleYears).range([0, width]).padding(0.2);
    y = d3.scaleLinear().domain([0, visibleMax]).range([height, 0]);

    ///////////////////////////////////////////////////////////// ! Axes Creation
    // Add x-axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("line, path")
      .style("opacity", 0.25);

    // Style x-axis text labels (keeping full opacity)
    svg
      .select(".x-axis")
      .selectAll("text")
      .style("opacity", 1)
      .style("text-anchor", currentVisibleCount > 16 ? "end" : "middle")
      .attr("transform", currentVisibleCount > 16 ? "rotate(-45)" : "rotate(0)")
      .attr("dx", currentVisibleCount > 16 ? "-0.8em" : "0")
      .attr("dy", currentVisibleCount > 16 ? "0.15em" : "0.5em");

    // Add y-axis
    svg
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y))
      .selectAll("line, path")
      .style("opacity", 0.25);

    // Keep y-axis text labels at full opacity
    svg.select(".y-axis").selectAll("text").style("opacity", 1);

    // Add y-axis label
    svg
      .append("text")
      .attr("class", "annotation")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 50)
      .style("text-anchor", "middle")
      .text("Number of Books");

    ///////////////////////////////////////////////////////////// ! Color Scales
    // Color scale for origin
    const originColors = ["var(--color-orange)", "var(--color-teal)"];

    // Extended color scale for categories
    color = d3
      .scaleOrdinal()
      .domain([...["INTERNAL", "EXTERNAL"], ...categories])
      .range([...originColors, ...d3.schemeCategory10]);

    ///////////////////////////////////////////////////////////// ! Line Creation
    // Create the lines
    const line = d3
      .line()
      .x((d) => x(d.year) + x.bandwidth() / 2)
      .y((d) => y(d.value))
      .curve(d3.curveCardinal); // Change to curved line

    // Add lines for each problem origin
    ["INTERNAL", "EXTERNAL"].forEach((origin) => {
      // Filter data to only visible years for initial render
      const visibleLineData = chartData
        .filter((d) => visibleYears.includes(d.year))
        .map((d) => ({
          year: d.year,
          value: d[origin],
          names: d[`${origin}_names`],
        }));

      // Add the actual data line
      svg
        .append("path")
        .attr("class", `line-${origin}`)
        .datum(visibleLineData)
        .attr("fill", "none")
        .attr("stroke", color(origin))
        .attr("stroke-width", 2)
        .attr("d", line)
        .style("opacity", 1); // Visible by default
    });

    // Add lines for each category
    categories.forEach((category) => {
      // Get data for this category
      const categoryVisibleData = categoryData.filter(
        (d) => d.category === category && visibleYears.includes(d.year)
      );

      const safeSelector = makeSafeSelector(category);

      // Add the line
      svg
        .append("path")
        .attr("class", `line-${safeSelector}`)
        .datum(categoryVisibleData)
        .attr("fill", "none")
        .attr("stroke", color(category))
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3,3")
        .attr("d", line)
        .style("opacity", 0); // Hidden by default
    });

    ///////////////////////////////////////////////////////////// ! Legend Creation
    // Add legend with background at top left
    const legend = svg.append("g").attr("transform", `translate(10, -70)`); //

    // Add legend title
    legend
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("class", "annotation")
      .attr("font-size", "14px")
      .text("Problem Origin:");

    // Add origins to legend in a horizontal layout
    ["THE WORLD", "YOU"].forEach((key, i) => {
      const legendRow = legend
        .append("g")
        .attr("class", `origin-legend ${key.toLowerCase().replace(" ", "-")}`)
        .attr("transform", `translate(${i * 150 + 150}, 7.5)`); // Moved left by reducing from 170 to 150

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr(
          "fill",
          key === "THE WORLD" ? "var(--color-teal)" : "var(--color-orange)"
        );

      legendRow
        .append("text")
        .attr("x", 25)
        .attr("y", 12.5)
        .attr("class", "annotation")
        .text(key);

      // Add "vs." between the labels
      if (i === 0) {
        legend
          .append("text")
          .attr("class", "vs-text annotation")
          .attr("x", 270) // Moved left by reducing from 290 to 270
          .attr("y", 20)
          .style("font-family", "Andale Mono")
          .style("font-size", "14px")
          .style("opacity", 0.5)
          .style("text-anchor", "middle")
          .text("vs.");
      }
    });

    // Add BEST SELLER legend item (black circle, white fill, black stroke, r=5)
    const bestSellerLegend = legend
      .append("g")
      .attr("class", "origin-legend best-seller-legend")
      .attr("transform", `translate(${2 * 110 + 195}, 7.5)`); // Adjusted spacing to match new layout

    bestSellerLegend
      .append("circle")
      .attr("cx", 7.5)
      .attr("cy", 7.5)
      .attr("r", 7)
      .attr("fill", "none")
      .attr("stroke", "var(--color-orange)")
      .attr("stroke-width", 2);

    // Add teal circle to the right of the orange circle
    bestSellerLegend
      .append("circle")
      .attr("cx", 27.5) // 20px to the right of the orange circle
      .attr("cy", 7.5)
      .attr("r", 7)
      .attr("fill", "none")
      .attr("stroke", "var(--color-teal)")
      .attr("stroke-width", 2);

    bestSellerLegend
      .append("text")
      .attr("x", 45)
      .attr("y", 12.5)
      .attr("class", "annotation")
      .text("BEST SELLER");

    // Add button click handler for expanding chart
    d3.select("#expand-chart").on("click", function () {
      if (currentVisibleCount < years.length) {
        currentVisibleCount++;
        updateChart();
      }
    });

    // Set checkboxes to unchecked by default
    d3.select("#toggle-categories").property("checked", false);
    d3.select("#toggle-percentage").property("checked", false);

    // Add toggle handlers
    d3.select("#toggle-categories").on("change", toggleCategories);
    d3.select("#toggle-percentage").on("change", togglePercentage);
  }

  // Near the end of chapter-2-dev.js
  document.addEventListener("visualizationUpdate", (event) => {
    // Hide any permanent tooltip when steps change
    tooltip.transition().duration(200).style("opacity", 0);
    // Remove any previously shown step image
    d3.select("#step-image").remove();
    const stepId = event.detail.step;

    // Reset all pulsating effects before applying to specific hotspots
    d3.selectAll(".hotspot").classed("hotspot-pulse", false);

    // Show only 1855-1859
    if (stepId === "samuel-smiles") {
      currentVisibleCount = 1;
      updateChart();

      // Remove any existing image
      d3.select("#smiles-image").remove();
      d3.select("#smiles-connector").remove();

      // After chart update, add pulsating effect to EXTERNAL hotspot for 1855-1859
      setTimeout(() => {
        const hotspot = d3
          .selectAll(".hotspot-EXTERNAL")
          .filter((d) => d.year === "1855-1859");

        // Add pulsating effect to the hotspot
        hotspot
          .classed("hotspot-pulse", true)
          .style("stroke", color("EXTERNAL"))
          .style("stroke-opacity", 0.7)
          .style("opacity", 1) // Make hotspot fully visible
          .attr("r", 8) // Increase the radius to make it more visible
          .style("fill-opacity", 0.8) // Increase fill opacity for visibility
          .style("pointer-events", "all"); // Ensure this specific hotspot can receive events

        // Get position of the hotspot for image placement
        const hotspotNode = hotspot.node();
        if (hotspotNode) {
          const cx = parseFloat(hotspot.attr("cx"));
          const cy = parseFloat(hotspot.attr("cy"));
          const imageX = cx - 20;
          const imageY = cy - 150;

          // Add the image next to the hotspot
          svg
            .append("image")
            .attr("id", "smiles-image")
            .attr("xlink:href", "assets/smiles.jpg")
            .attr("x", imageX)
            .attr("y", imageY)
            .attr("transform", "rotate(10)")
            .attr("width", 250)
            .attr("height", 250)
            .style("opacity", 0)
            .style("pointer-events", "all") // Ensure image can receive events
            .style("filter", "drop-shadow(3px 3px 5px rgba(0,0,0,0.2))")
            .transition()
            .duration(1000)
            .style("opacity", 0.85);

          // Add curved connector line from hotspot to image
          svg
            .append("path")
            .attr("id", "smiles-connector")
            .attr(
              "d",
              `M ${cx},${cy} Q ${cx + 30},${cy - 50} ${imageX + 125},${
                imageY + 125
              }`
            )
            .style("fill", "none")
            .style("stroke", color("EXTERNAL"))
            .style("stroke-width", 1.5)
            .style("stroke-opacity", 0)
            .style("pointer-events", "all") // Ensure connector can receive events
            .style("stroke-dasharray", "5,3")
            .transition()
            .duration(1000)
            .style("stroke-opacity", 0.6);
        }
      }, 600);
    } else if (stepId === "post-20s") {
      // Show years through post-1920s
      currentVisibleCount = 16;
      updateChart();

      // Remove any existing images and videos
      // Remove any existing connector lines
      d3.select("#smiles-connector").remove();
      d3.select("#smiles-image").remove();
      d3.select("#conquest-image").remove();
      d3.select("#carnegie-image").remove();
      d3.select("#napoleon-image").remove();
      d3.select("#depression-video").remove();

      // Get the figure container
      const figure = d3.select("#figure-container");

      // Create the gasmask image element
      svg
        .append("image")
        .attr("id", "gasmask-image")
        .attr("xlink:href", "assets/gasmask.png")
        .attr("x", width / 2.3) // Position it horizontally centered
        .attr("y", height * 0.67) // Position it 10% from bottom of screen
        .attr("width", 300) // Set appropriate size
        .attr("height", 300) // Set appropriate size
        .style("opacity", 0) // Start invisible for fade-in
        .style("z-index", "1")
        .style("display", "none")
        .style("filter", "drop-shadow(3px 3px 5px rgba(0,0,0,0.2))");

      // Then fade it in (this is the existing code)
      d3.select("#gasmask-image")
        .transition()
        .duration(1000)
        .style("opacity", 1);

      // Add hover effect to INTERNAL hotspots for 1900-1904, 1920-1924, and 1935-1939
      setTimeout(() => {
        // First, set all hotspots to opacity 0
        d3.selectAll(".hotspot").style("opacity", 0);

        // Then, make only the specific hotspots visible and add pulse effect
        const hotspots = d3
          .selectAll(".hotspot-INTERNAL")
          .filter((d) =>
            ["1900-1904", "1920-1924", "1935-1939"].includes(d.year)
          )
          .classed("hotspot-pulse", true)
          .style("stroke", color("INTERNAL"))
          .style("stroke-opacity", 0.7)
          .style("opacity", 0.9); // Make visible again

        // Set up hover interactions for each hotspot
        hotspots.each(function (d) {
          const hotspot = d3.select(this);
          const cx = parseFloat(hotspot.attr("cx"));
          const cy = parseFloat(hotspot.attr("cy"));

          let imageFile, imageId, rotation, width, height, xOffset, yOffset;

          if (d.year === "1900-1904") {
            imageFile = "conquest.jpg";
            imageId = "conquest-image";
            rotation = -8;
            width = 150;
            height = 250;
            xOffset = -170;
            yOffset = -180;
          } else if (d.year === "1920-1924") {
            imageFile = "napoleon.jpg";
            imageId = "napoleon-image";
            rotation = 5;
            width = 240;
            height = 260;
            xOffset = -240;
            yOffset = -240;
          } else if (d.year === "1935-1939") {
            imageFile = "carnegie.jpg";
            imageId = "carnegie-image";
            rotation = 3;
            width = 150;
            height = 230;
            xOffset = -180;
            yOffset = 10;
          }

          // Calculate positions for connector and image
          const connectorId = `${imageId}-connector`;
          const imageX = cx + xOffset + width / 2;
          const imageY = cy + yOffset + height / 2;

          // Create a curved path from hotspot to image
          const path = d3.path();
          path.moveTo(cx, cy);

          // Calculate control point for curve (midpoint with offset)
          const midX = (cx + imageX) / 2;
          const midY = (cy + imageY) / 2;
          const curveFactor = 30; // Adjust for more or less curve

          // Add a slight curve to the connector line
          path.quadraticCurveTo(
            midX + (d.year === "1935-1939" ? -curveFactor : curveFactor),
            midY + (d.year === "1935-1939" ? curveFactor : -curveFactor),
            imageX,
            imageY
          );

          // Add the connector line (initially hidden)
          const connector = svg
            .append("path")
            .style("z-index", "0")
            .attr("id", connectorId)
            .attr("d", path.toString())
            .attr("stroke", color("INTERNAL"))
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("stroke-dasharray", "5,5")
            .style("opacity", 0);

          // Add the image (initially hidden)
          const image = svg
            .append("image")
            .attr("id", imageId)
            .attr("xlink:href", `assets/${imageFile}`)
            .attr("x", cx + xOffset)
            .attr("y", cy + yOffset)
            .attr("transform", `rotate(${rotation}, ${cx}, ${cy})`)
            .attr("width", width)
            .attr("height", height)
            .style("opacity", 0)
            .style("z-index", "1")
            .style("filter", "drop-shadow(3px 3px 5px rgba(0,0,0,0.2))");

          // Add hover event listeners
          hotspot
            .on("mouseenter", function () {
              // Immediately stop any ongoing transitions
              connector.interrupt();
              image.interrupt();

              // Set initial state to prevent flicker
              connector.style("opacity", 0.7);
              image.style("opacity", 0.85);

              // Apply animations after ensuring stable state
              connector
                .transition()
                .duration(300)
                .ease(d3.easeBounce)
                .style("opacity", 0.7);

              image
                .transition()
                .duration(500)
                .ease(d3.easeElastic)
                .style("opacity", 0.85);
            })
            .on("mouseleave", function () {
              // Immediately stop any ongoing transitions
              connector.interrupt();
              image.interrupt();

              // Hide connector and image on mouse leave
              connector.transition().duration(300).style("opacity", 0);
              image.transition().duration(300).style("opacity", 0);
            });
        });
      }, 600);
    }
    // neoliberal-shift that takes us to visible count through 1994, which is visible count of 26
    else if (stepId === "neoliberal-shift") {
      currentVisibleCount = 26;
      updateChart();
      // Remove any existing images
      d3.select("#smiles-image").remove();
      d3.select("#conquest-image").remove();
      d3.select("#carnegie-image").remove();
      d3.select("#napoleon-image").remove();
      d3.select("#smiles-image").remove();
      d3.select("#fear-image").remove();
      d3.select("#effective-image").remove();
      // remove gasmask image
      d3.select("#gasmask-image").remove();
      // Remove any existing videos from previous steps
      d3.select("#depression-video")
        .transition()
        .duration(300)
        .style("opacity", 0)
        .on("end", function () {
          d3.select(this).remove();
        });
      // Add pulsating effect to INTERNAL hotspots for specific years
      setTimeout(() => {
        // First, set all hotspots to opacity 0
        d3.selectAll(".hotspot").style("opacity", 0);

        // Then, make only the specific hotspots visible and add pulse effect
        const pulsatingHotspots = d3
          .selectAll(".hotspot-INTERNAL")
          .filter((d) =>
            ["1965-1969", "1975-1979", "1985-1989"].includes(d.year)
          )
          .classed("hotspot-pulse", true)
          .style("stroke", color("INTERNAL"))
          .style("stroke-opacity", 0.7)
          .style("opacity", 0.9); // Make visible again

        // Set up hover interactions for each hotspot
        pulsatingHotspots.each(function (d) {
          const hotspot = d3.select(this);
          const cx = parseFloat(hotspot.attr("cx"));
          const cy = parseFloat(hotspot.attr("cy"));

          let imageFile, imageId, rotation, width, height, xOffset, yOffset;

          if (d.year === "1965-1969") {
            imageFile = "bodies.jpg";
            imageId = "bodies-image";
            rotation = -5;
            width = 180;
            height = 240;
            xOffset = -200;
            yOffset = -180;
          } else if (d.year === "1975-1979") {
            imageFile = "fear.jpg";
            imageId = "fear-image";
            rotation = 3;
            width = 160;
            height = 230;
            xOffset = -180;
            yOffset = -200;
          } else if (d.year === "1985-1989") {
            imageFile = "effective.jpg";
            imageId = "effective-image";
            rotation = 4;
            width = 170;
            height = 220;
            xOffset = -190;
            yOffset = -200;
          }

          // Calculate positions for connector and image
          const connectorId = `${imageId}-connector`;
          const imageX = cx + xOffset + width / 2;
          const imageY = cy + yOffset + height / 2;

          // Create a curved path from hotspot to image
          const path = d3.path();
          path.moveTo(cx, cy);

          // Calculate control point for curve (midpoint with offset)
          const midX = (cx + imageX) / 2;
          const midY = (cy + imageY) / 2;
          const curveFactor = 30; // Adjust for more or less curve

          // Add a slight curve to the connector line
          path.quadraticCurveTo(
            midX + curveFactor,
            midY - curveFactor,
            imageX,
            imageY
          );

          // Add the connector line (initially hidden)
          const connector = svg
            .append("path")
            .style("z-index", "0")
            .attr("id", connectorId)
            .attr("d", path.toString())
            .attr("stroke", color("INTERNAL"))
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("stroke-dasharray", "5,5")
            .style("opacity", 0);

          // Add the image (initially hidden)
          const image = svg
            .append("image")
            .attr("id", imageId)
            .attr("xlink:href", `assets/${imageFile}`)
            .attr("x", cx + xOffset)
            .attr("y", cy + yOffset)
            .attr("transform", `rotate(${rotation}, ${cx}, ${cy})`)
            .attr("width", width)
            .attr("height", height)
            .style("opacity", 0)
            .style("z-index", "1")
            .style("filter", "drop-shadow(3px 3px 5px rgba(0,0,0,0.2))");

          // Add hover event listeners
          hotspot
            .on("mouseenter", function () {
              // Immediately stop any ongoing transitions
              connector.interrupt();
              image.interrupt();

              // Set initial state to prevent flicker
              connector.style("opacity", 0.7);
              image.style("opacity", 0.85);

              // Apply animations after ensuring stable state
              connector
                .transition()
                .duration(300)
                .ease(d3.easeBounce)
                .style("opacity", 0.7);

              image
                .transition()
                .duration(500)
                .ease(d3.easeElastic)
                .style("opacity", 0.85);
            })
            .on("mouseleave", function () {
              // Immediately stop any ongoing transitions
              connector.interrupt();
              image.interrupt();

              // Hide connector and image on mouse leave
              connector.transition().duration(300).style("opacity", 0);

              image.transition().duration(300).style("opacity", 0);
            });
        });
      }, 600);
    } else if (stepId === "all-years") {
      // Show all available years
      currentVisibleCount = years.length;
      updateChart();
      // Remove any existing images
      d3.select("#smiles-image").remove();
      d3.select("#conquest-image").remove();
      d3.select("#carnegie-image").remove();
      d3.select("#napoleon-image").remove();
      d3.select("#fear-image").remove();
      d3.select("#effective-image").remove();
      d3.select("#bodies-image").remove();
      // remove connector lines
      d3.selectAll(".connector-line").remove();

      // Animate the legend swap
      setTimeout(animateLegendSwap, 600);

      // Set up images with connectors on hover
      setTimeout(() => {
        // First, set all hotspots to opacity 0
        d3.selectAll(".hotspot").style("opacity", 0);

        // Define the image data for each time period
        const imageData = [
          {
            year: "2010-2014",
            imageFile: "bed.jpg",
            id: "bed-image",
            origin: "INTERNAL",
            rotation: 5,
            width: 180,
            height: 240,
            xOffset: -200,
            yOffset: -50,
          },
          {
            year: "2005-2009",
            imageFile: "bitch.jpg",
            id: "bitch-image",
            origin: "INTERNAL",
            rotation: -3,
            width: 160,
            height: 230,
            xOffset: -180,
            yOffset: -200,
          },
          {
            year: "2015-2019",
            imageFile: "12rules.jpg",
            id: "rules-image",
            origin: "INTERNAL",
            rotation: 4,
            width: 170,
            height: 220,
            xOffset: -290,
            yOffset: -100,
          },
        ];

        // For each image, find the corresponding hotspot and add hover effects
        imageData.forEach(
          ({
            year,
            imageFile,
            id,
            origin,
            rotation,
            width,
            height,
            xOffset,
            yOffset,
          }) => {
            // Find hotspots for this year and origin
            d3.selectAll(`.hotspot-${origin}`)
              .filter((d) => d.year === year)
              .each(function () {
                const hotspot = d3.select(this);
                const cx = parseFloat(hotspot.attr("cx"));
                const cy = parseFloat(hotspot.attr("cy"));

                // Make this hotspot visible and add pulse effect
                hotspot
                  .classed("hotspot-pulse", true)
                  .style("opacity", 0.9)
                  .style("stroke", color(origin))
                  .style("stroke-opacity", 0.7);

                // Calculate positions for connector and image
                const connectorId = `${id}-connector`;
                const imageX = cx + xOffset + width / 2;
                const imageY = cy + yOffset + height / 2;

                // Create a curved path from hotspot to image
                const path = d3.path();
                path.moveTo(cx, cy);

                // Calculate control point for curve (midpoint with offset)
                const midX = (cx + imageX) / 2;
                const midY = (cy + imageY) / 2;
                const curveFactor = 30; // Adjust for more or less curve

                // Add a slight curve to the connector line
                path.quadraticCurveTo(
                  midX + curveFactor,
                  midY - curveFactor,
                  imageX,
                  imageY
                );

                // Add the connector line (initially hidden)
                const connector = svg
                  .append("path")
                  .attr("class", "connector-line")
                  .attr("id", connectorId)
                  .attr("d", path.toString())
                  .attr("stroke", color(origin))
                  .attr("stroke-width", 2)
                  .attr("fill", "none")
                  .attr("stroke-dasharray", "5,5")
                  .style("opacity", 0);

                // Add the image (initially hidden)
                const image = svg
                  .append("image")
                  .attr("id", id)
                  .attr("xlink:href", `assets/${imageFile}`)
                  .attr("x", cx + xOffset)
                  .attr("y", cy + yOffset)
                  .attr("transform", `rotate(${rotation}, ${cx}, ${cy})`)
                  .attr("width", width)
                  .attr("height", height)
                  .style("opacity", 0)
                  .style("z-index", "1")
                  .style("filter", "drop-shadow(3px 3px 5px rgba(0,0,0,0.2))");

                // Add hover event listeners
                hotspot
                  .on("mouseenter", function () {
                    // Immediately stop any ongoing transitions
                    connector.interrupt();
                    image.interrupt();

                    // Set initial state to prevent flicker
                    connector.style("opacity", 0.7);
                    image.style("opacity", 0.85);

                    // Apply animations after ensuring stable state
                    connector
                      .transition()
                      .duration(300)
                      .ease(d3.easeBounce)
                      .style("opacity", 0.7);

                    image
                      .transition()
                      .duration(500)
                      .ease(d3.easeElastic)
                      .style("opacity", 0.85);
                  })
                  .on("mouseleave", function () {
                    // Immediately stop any ongoing transitions
                    connector.interrupt();
                    image.interrupt();

                    // Hide connector and image on mouse leave
                    connector.transition().duration(300).style("opacity", 0);
                    image.transition().duration(300).style("opacity", 0);
                  });
              });
          }
        );
      }, 600);
    }
  });

  // Function to animate legend items
  function animateLegendSwap() {
    // Animate "YOU" to the left position
    d3.select(".you")
      .transition()
      .duration(1000)
      .ease(d3.easeCubicInOut)
      .attr("transform", "translate(170, 7.5)");

    // Animate "THE WORLD" to the right position
    d3.select(".the-world")
      .transition()
      .duration(1000)
      .ease(d3.easeCubicInOut)
      .attr("transform", "translate(275, 7.5)");

    // Animate "vs." to the left
    d3.select(".vs-text")
      .transition()
      .duration(1000)
      .ease(d3.easeCubicInOut)
      .attr("x", 250); // Move slightly to the left
  }
})();
