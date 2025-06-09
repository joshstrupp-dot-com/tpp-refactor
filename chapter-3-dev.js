// Chapter 3 - Author Visualization
(function () {
  ///////////////////////////////////////////////////////////// ! Setup and Configuration
  // Adjust chapter-3 div to fill the viewport
  const chapter3Div = document.getElementById("chapter-3");
  chapter3Div.style.width = "100vw";
  chapter3Div.style.height = "100vh";
  chapter3Div.style.margin = "0";
  chapter3Div.style.padding = "0";
  chapter3Div.style.border = "none";
  chapter3Div.style.overflow = "hidden";
  chapter3Div.style.position = "relative";

  // Add pulsating animation style
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    @keyframes pulsate {
      0% {
        stroke-width: 10;
        opacity: 0.3;
      }
      
      70% {
        stroke-width: 12;
        opacity: 1;
      }
      
      100% {
        stroke-width: 10;
        opacity: 0.3;
      }
    }
    
    .pulsate-stroke {
      animation: pulsate 2s infinite;
    }
  `;
  document.head.appendChild(styleElement);

  // Featured authors configuration
  const featuredAuthors = {
    "Deepak Chopra": "assets/authors/deepak-chopra.jpg",
    "Jen Sincero": "assets/authors/jen-sincero.jpg",
    "Michelle Obama": "assets/authors/michelle-obama.jpg",
    "Gabor Maté": "assets/authors/gabor-mate.jpeg",
    "Rhonda Byrne": "assets/authors/rhonda-byrne.jpg",
    "50 Cent": "assets/authors/50-cent.jpg",
    "Arnold Schwarzenegger": "assets/authors/arnold-schwarzenegger.jpg",
    "Cameron Diaz": "assets/authors/cameron-diaz.jpg",
    "Brené Brown": "assets/authors/brene-brown.jpg",
    "Demi Lovato": "assets/authors/demi-lovato.jpg",
    "Donald J. Trump": "assets/authors/donald-j-trump.jpg",
    "Eckhart Tolle": "assets/authors/eckhart-tolle.jpg",
    "Esther Hicks": "assets/authors/esther-hicks.jpg",
    "Gabrielle Bernstein": "assets/authors/gabrielle-bernstein.jpg",
    "Gary Vaynerchuk": "assets/authors/gary-vaynerchuk.jpg",
    "Gwyneth Paltrow": "assets/authors/gwyneth-paltrow.jpg",
    "Jay Shetty": "assets/authors/jay-shetty.jpg",
    "Jordan B. Peterson": "assets/authors/jordan-b-peterson.jpg",
    "Jillian Michaels": "assets/authors/jillian-michaels.jpg",
    "Marie Kondo": "assets/authors/marie-kondo.jpg",
    "Mark Manson": "assets/authors/mark-manson.jpg",
    "Matthew McConaughey": "assets/authors/matthew-mcconaughey.jpg",
    "Mel Robbins": "assets/authors/mel-robbins.jpg",
    "Oprah Winfrey": "assets/authors/oprah-winfrey.jpg",
    "Rachel Hollis": "assets/authors/rachel-hollis.jpg",
    "Russell Brand": "assets/authors/russell-brand.jpg",
    "Phillip C. McGraw": "assets/authors/phillip-c-mcgraw.jpg",
    // "Stephen King": "assets/authors/stephen-king.jpg",
    "Tim Ferriss": "assets/authors/tim-ferriss.jpg",
    "Tony Robbins": "assets/authors/tony-robbins.jpg",
    "Rich Roll": "assets/authors/rich-roll.jpg",
  };

  // Get the actual dimensions of the container
  const fullWidth = chapter3Div.clientWidth;
  const fullHeight = chapter3Div.clientHeight;

  // Set up dimensions and margins for the chart - smaller margins on mobile
  const isMobileDevice =
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const margin = isMobileDevice
    ? { top: 60, right: 30, bottom: 60, left: 80 } // Tighter margins for mobile
    : { top: 100, right: 100, bottom: 100, left: 100 }; // Original margins for desktop
  const width = fullWidth - margin.left - margin.right;
  const height = fullHeight - margin.top - margin.bottom;

  let allAuthorData; // Store the data globally
  let svg; // Store the SVG globally
  let currentStepId = "all-authors"; // Track current step
  let tooltip; // Store the tooltip globally

  ///////////////////////////////////////////////////////////// ! Data Filtering Functions
  // Function to filter data based on step ID
  function filterDataForStep(stepId) {
    if (!allAuthorData) return [];

    // For authors-1 step, animate specific authors
    if (stepId === "authors-1") {
      allAuthorData.forEach((d) => {
        d.shouldAnimate =
          // d.author_clean === "Deepak Chopra" ||
          d.author_clean === "Matthew McConaughey" ||
          d.author_clean === "Jay Shetty" ||
          d.author_clean === "Rainn Wilson" ||
          d.author_clean === "Demi Lovato" ||
          d.author_clean === "Jillian Michaels" ||
          d.author_clean === "50 Cent" ||
          d.author_clean === "Michelle Obama";
      });
    } else if (stepId === "authors-2") {
      // For authors-2 step, animate different set of authors
      allAuthorData.forEach((d) => {
        d.shouldAnimate =
          d.author_clean === "Esther Hicks" ||
          d.author_clean === "James Clear" ||
          d.author_clean === "Brené Brown" ||
          d.author_clean === "Michelle Obama" ||
          // d.author_clean === "Arnold Schwarzenegger" ||
          d.author_clean === "Oprah Winfrey" ||
          d.author_clean === "Matthew McConaughey";
      });
    } else if (stepId === "authors-3") {
      // For authors-3 step, animate another set of authors
      allAuthorData.forEach((d) => {
        d.shouldAnimate =
          // d.author_clean === "Deepak Chopra" ||
          d.author_clean === "Jen Sincero" ||
          d.author_clean === "Donald J. Trump" ||
          d.author_clean === "Phillip C. McGraw" ||
          d.author_clean === "Deepak Chopra";
      });
    } else {
      allAuthorData.forEach((d) => {
        d.shouldAnimate = false;
      });
    }

    return allAuthorData;
  }

  ///////////////////////////////////////////////////////////// ! Visualization Functions
  // Function to display author data
  function displayAuthorData(data, stepId) {
    if (!data || data.length === 0) return;

    // Detect mobile for layout decisions
    const isMobile =
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // Clean up old tooltips
    d3.selectAll(".tooltip").remove();

    // Instead of clearing everything, only clear axes, labels, and legend
    svg.selectAll(".x-axis, .y-axis, .annotation, .legend").remove();
    svg.selectAll(".regular-point, .featured-point").remove(); // Remove old points for force layout

    ///////////////////////////////////////////////////////////// ! Data Processing
    data.forEach((d) => {
      d.avg_star_rating = +d.avg_star_rating;
      d.author_num_books = Math.max(1, +d.author_num_books);
      d.avg_cred_score = +d.avg_cred_score;
      d.bt_count = +d.bt_count;
      d.isFeatured = featuredAuthors.hasOwnProperty(d.author_clean);
    });

    const minBooks = d3.min(data, (d) => d.author_num_books);
    const maxBooks = d3.max(data, (d) => d.author_num_books);
    const sizeScale = d3
      .scaleSqrt()
      .domain([minBooks, maxBooks])
      .range(isMobile ? [6, 30] : [8, 40]); // Smaller circles on mobile

    // Different scales for mobile vs desktop
    let xScale, yScale, xCenter, yCenter;

    if (isMobile) {
      // Mobile: Vertical layout - star rating on Y axis
      yScale = d3
        .scaleLinear()
        .domain([3.5, 4.4])
        .nice()
        .range([height - 50, 50]); // Inverted for Y axis (top to bottom)
      xCenter = width / 2;
    } else {
      // Desktop: Horizontal layout - star rating on X axis
      xScale = d3.scaleLinear().domain([3.5, 4.4]).nice().range([0, width]);
      yCenter = height / 2;
    }

    ///////////////////////////////////////////////////////////// ! Legend Creation
    // Only show legend on desktop
    if (!isMobile) {
      // Create a legend group in the top left corner
      const legendGroup = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(50, 50)");

      // Create nested circles using actual data ranges
      const midBooks = Math.round((minBooks + maxBooks) / 2);
      const legendSizes = [
        { size: sizeScale(maxBooks), label: `${maxBooks} books` },
        { size: sizeScale(midBooks), label: `${midBooks} books` },
        { size: sizeScale(minBooks), label: `${minBooks} books` },
      ].sort((a, b) => b.size - a.size); // Sort by size descending

      // Add circles
      legendGroup
        .selectAll(".legend-circle")
        .data(legendSizes)
        .enter()
        .append("circle")
        .attr("class", "legend-circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", (d) => d.size)
        .style("fill", "var(--color-base-darker)")
        .style("opacity", 0.9)
        .style("stroke", "black")
        .style("stroke-width", 1);

      // Add lines from circle edge to label
      const labelGroup = legendGroup
        .selectAll(".label-group")
        .data(legendSizes)
        .enter()
        .append("g")
        .attr("class", "label-group");

      labelGroup
        .append("line")
        .attr("x1", (d) => d.size)
        .attr("y1", 0)
        .attr("x2", (d) => d.size + (d.size === sizeScale(minBooks) ? 30 : 20))
        .attr("y2", 0)
        .style("stroke", "black")
        .style("stroke-width", 1);

      // Add text labels
      labelGroup
        .append("text")
        .attr("x", (d) => d.size + (d.size === sizeScale(minBooks) ? 35 : 25))
        .attr("y", 0)
        .attr("dy", "0.32em")
        .style("font-size", "12px")
        .text((d) => d.label);

      // Position label groups at different angles
      labelGroup.attr("transform", (d, i) => {
        const angle = -60 + i * 60; // Spread labels on right side, more compact angle range
        return `rotate(${angle})`;
      });
    }

    ///////////////////////////////////////////////////////////// ! Axes Creation
    if (isMobile) {
      // Mobile: Y-axis for star rating
      svg
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${xCenter - 40}, 0)`)
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("class", "annotation");
      svg
        .append("text")
        .attr("class", "annotation")
        .attr(
          "transform",
          `translate(${xCenter - 95}, ${height / 2}) rotate(-90)`
        )
        .style("text-anchor", "middle")
        .text("Average Star Rating");
    } else {
      // Desktop: X-axis for star rating - aligned to bottom
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - 40})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("class", "annotation");
      svg
        .append("text")
        .attr("class", "annotation")
        .attr("x", 0)
        .attr("y", height + 5)
        .style("text-anchor", "start")
        .text("Average Star Rating");
    }

    ///////////////////////////////////////////////////////////// ! Tooltip Creation
    tooltip = d3.select("body").append("div").attr("class", "tooltip");

    ///////////////////////////////////////////////////////////// ! Data Points Creation
    const defs = svg.append("defs");

    // Add grain texture pattern
    const grainPattern = defs
      .append("pattern")
      .attr("id", "grain-texture")
      .attr("width", 1)
      .attr("height", 1)
      .attr("patternUnits", "objectBoundingBox")
      .attr("patternContentUnits", "objectBoundingBox");

    grainPattern
      .append("image")
      .attr("width", 1)
      .attr("height", 1)
      .attr("x", 0)
      .attr("y", 0)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("xlink:href", "assets/textures/grain.webp");

    // Create author image patterns
    Object.entries(featuredAuthors).forEach(([author, imgUrl]) => {
      const patternId = `pattern-${author.toLowerCase().replace(/\s+/g, "-")}`;
      const pattern = defs
        .append("pattern")
        .attr("id", patternId)
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternUnits", "objectBoundingBox")
        .attr("patternContentUnits", "objectBoundingBox");

      // Add author image
      pattern
        .append("image")
        .attr("width", 1)
        .attr("height", 1)
        .attr("x", 0)
        .attr("y", 0)
        .attr("preserveAspectRatio", "xMidYMid slice")
        .attr("xlink:href", imgUrl);

      // Add grain texture on top with opacity
      pattern
        .append("rect")
        .attr("width", 1)
        .attr("height", 1)
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", "url(#grain-texture)")
        .style("opacity", 0.33);
    });

    // Helper for highlight color
    function getHighlightColor(d) {
      return d.shouldAnimate ? "red" : null;
    }

    // Prepare nodes for force simulation
    const nodes = data.map((d) => Object.assign({}, d));

    // Create groups for each node
    const nodeGroups = svg
      .selectAll(".data-point")
      .data(nodes, (d) => d.author_clean)
      .enter()
      .append("g")
      .attr("class", (d) => {
        if (d.isFeatured && d.shouldAnimate)
          return "featured-point animated data-point";
        if (d.isFeatured) return "featured-point data-point";
        return "regular-point data-point";
      });

    // Add stroke circle for animated authors
    nodeGroups
      .filter((d) => d.shouldAnimate)
      .append("circle")
      .attr("r", (d) => sizeScale(d.author_num_books))
      .style("fill", "none")
      .style("stroke", "var(--color-yellow)")
      .style("stroke-opacity", 0.9)
      .style("stroke-width", 3)
      .attr("class", "pulsate-stroke");

    // Add main circle with image or solid fill
    nodeGroups
      .append("circle")
      .attr("r", (d) => sizeScale(d.author_num_books))
      .style("fill", (d) =>
        d.isFeatured
          ? `url(#pattern-${d.author_clean.toLowerCase().replace(/\s+/g, "-")})`
          : "var(--color-base-darker)"
      )
      .style("opacity", 1)
      .style("stroke", "black")
      .style("stroke-opacity", 0.9)
      .style("stroke-width", 1);

    // Add mouseover and mouseout events
    nodeGroups.on("mouseover", function (event, d) {
      // Move this element to the front by appending it to the end of its parent
      this.parentNode.appendChild(this);

      // Only scale up if this is a featured author
      if (d.isFeatured) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr("transform", function (d) {
            return `translate(${d.x},${d.y}) scale(5)`;
          });
      }

      tooltip
        .html(
          `<span style="
            color: #000;
            font-family: 'Andale Mono';
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 30px;
            letter-spacing: 3px;
            text-transform: uppercase;
            opacity: 0.5;
          ">AUTHOR:</span>
          <strong style="font-size: 24px;">${d.author_clean}</strong><br/>
           <span class="andale">Books: ${d.author_num_books}</span><br/>
           <span class="andale">Rating: ${d.avg_star_rating.toFixed(
             2
           )}</span><br/>
           <span class="andale">Avg # Ratings: ${Math.round(
             d.avg_num_ratings
           )}</span>`
        )
        .style("left", event.pageX + 30 + "px") // Increased from 10 to 20
        .style("top", event.pageY - 35 + "px") // Increased from -28 to -35
        .style("opacity", 0.9);
    });
    nodeGroups.on("mouseout", function (event, d) {
      // Only scale back down if this is a featured author
      if (d.isFeatured) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr("transform", function (d) {
            return `translate(${d.x},${d.y}) scale(1)`;
          });
      }

      tooltip.style("opacity", 0);
    });

    // D3 force simulation - different for mobile vs desktop
    const simulation = d3.forceSimulation(nodes);

    if (isMobile) {
      // Mobile: Vertical layout with Y positioning for star rating
      simulation
        .force("x", d3.forceX(xCenter).strength(0.08))
        .force("y", d3.forceY((d) => yScale(d.avg_star_rating)).strength(1))
        .force(
          "collide",
          d3.forceCollide((d) => sizeScale(d.author_num_books) + 1)
        );
    } else {
      // Desktop: Horizontal layout with X positioning for star rating
      simulation
        .force("x", d3.forceX((d) => xScale(d.avg_star_rating)).strength(1))
        .force("y", d3.forceY(yCenter).strength(0.08))
        .force(
          "collide",
          d3.forceCollide((d) => sizeScale(d.author_num_books) + 2)
        );
    }

    simulation.stop();

    // Run the simulation for a fixed number of ticks for static layout
    for (let i = 0; i < 300; ++i) simulation.tick();

    // Position nodes
    nodeGroups.attr("transform", (d) => `translate(${d.x},${d.y})`);

    // Update current step
    currentStepId = stepId;
  }

  ///////////////////////////////////////////////////////////// ! Initialization
  try {
    // Create SVG container
    svg = d3
      .select("#chapter-3")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("display", "block")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load author data once
    d3.csv("data/sh_0415_author/author.csv", d3.autoType)
      .then((data) => {
        // Detect mobile device
        const isMobile =
          window.innerWidth <= 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );

        // Filter and store - less aggressive filtering for mobile
        if (isMobile) {
          // Mobile: Keep all featured authors + more non-featured authors since we're going vertical
          const featuredData = data.filter((author) =>
            featuredAuthors.hasOwnProperty(author.author_clean)
          );
          const nonFeaturedData = data
            .filter(
              (author) =>
                !featuredAuthors.hasOwnProperty(author.author_clean) &&
                author.author_num_books > 15 &&
                author.avg_num_ratings >= 3000
            )
            .sort((a, b) => b.avg_num_ratings - a.avg_num_ratings)
            .slice(0, 40); // More authors for vertical layout

          allAuthorData = [...featuredData, ...nonFeaturedData];
        } else {
          // Desktop: Use original filtering
          allAuthorData = data.filter(
            (author) =>
              featuredAuthors.hasOwnProperty(author.author_clean) ||
              (author.author_num_books > 20 && author.avg_num_ratings >= 5000)
          );
        }

        // Manual overrides
        allAuthorData.forEach((author) => {
          if (author.author_clean === "Matthew McConaughey") {
            author.author_num_books = 15;
          }
          if (author.author_clean === "Michelle Obama") {
            author.author_num_books = 60;
          }
        });

        // Initial render
        const urlParams = new URLSearchParams(window.location.search);
        const initialStep = urlParams.get("step") || "all-authors";
        displayAuthorData(filterDataForStep(initialStep), initialStep);
      })
      .catch((error) => {
        console.error("Error loading author data:", error);
      });
  } catch (error) {
    console.error("Error in initialization:", error);
  }

  ///////////////////////////////////////////////////////////// ! Event Listeners
  // Add event listener for visualization updates
  document.addEventListener("visualizationUpdate", (event) => {
    const stepId = event.detail.step;
    displayAuthorData(filterDataForStep(stepId), stepId);
  });

  // Add scroll event listener to hide tooltip when scrolling
  window.addEventListener("scroll", () => {
    if (svg) {
      // Hide tooltip when scrolling (try both global reference and selector)
      if (tooltip) {
        tooltip.style("opacity", 0);
      }
      d3.selectAll(".tooltip").style("opacity", 0);

      // Reset any scaled featured authors back to normal size
      svg
        .selectAll(".featured-point")
        .transition()
        .duration(300)
        .attr("transform", function (d) {
          return `translate(${d.x},${d.y}) scale(1)`;
        });
    }
  });

  // Add resize event listener to re-filter data for mobile/desktop changes
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Update dimensions and margins based on new screen size
      const newIsMobileDevice =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const newMargin = newIsMobileDevice
        ? { top: 60, right: 30, bottom: 60, left: 80 }
        : { top: 100, right: 100, bottom: 100, left: 100 };
      const newWidth =
        chapter3Div.clientWidth - newMargin.left - newMargin.right;
      const newHeight =
        chapter3Div.clientHeight - newMargin.top - newMargin.bottom;

      // Update SVG transform
      svg.attr("transform", `translate(${newMargin.left},${newMargin.top})`);

      // Re-load and filter data based on new screen size
      if (allAuthorData) {
        d3.csv("data/sh_0415_author/author.csv", d3.autoType).then((data) => {
          const isMobile =
            window.innerWidth <= 768 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            );

          if (isMobile) {
            const featuredData = data.filter((author) =>
              featuredAuthors.hasOwnProperty(author.author_clean)
            );
            const nonFeaturedData = data
              .filter(
                (author) =>
                  !featuredAuthors.hasOwnProperty(author.author_clean) &&
                  author.author_num_books > 15 &&
                  author.avg_num_ratings >= 3000
              )
              .sort((a, b) => b.avg_num_ratings - a.avg_num_ratings)
              .slice(0, 40);

            allAuthorData = [...featuredData, ...nonFeaturedData];
          } else {
            allAuthorData = data.filter(
              (author) =>
                featuredAuthors.hasOwnProperty(author.author_clean) ||
                (author.author_num_books > 20 && author.avg_num_ratings >= 5000)
            );
          }

          // Apply manual overrides
          allAuthorData.forEach((author) => {
            if (author.author_clean === "Matthew McConaughey") {
              author.author_num_books = 15;
            }
            if (author.author_clean === "Michelle Obama") {
              author.author_num_books = 60;
            }
          });

          // Re-render with current step
          displayAuthorData(filterDataForStep(currentStepId), currentStepId);
        });
      }
    }, 300); // Debounce resize events
  });
})();
