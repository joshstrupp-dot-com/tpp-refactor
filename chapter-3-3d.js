(function () {
  ///////////////////////////////////////////////////////////// ! Setup and Configuration
  // Adjust chapter-3-3d div to fill the viewport but leave scroll margins
  const chapter3_3dDiv = document.getElementById("chapter-3-3d");
  chapter3_3dDiv.style.width = "100vw";
  chapter3_3dDiv.style.height = "100vh";
  chapter3_3dDiv.style.margin = "0";
  chapter3_3dDiv.style.padding = "0";
  chapter3_3dDiv.style.border = "none";
  chapter3_3dDiv.style.position = "relative";
  chapter3_3dDiv.style.display = "flex";
  chapter3_3dDiv.style.alignItems = "center";
  chapter3_3dDiv.style.justifyContent = "center";

  // Create the actual plot container with margins for scroll zones
  let plotContainer = document.getElementById("plot-container-3d");
  if (!plotContainer) {
    plotContainer = document.createElement("div");
    plotContainer.id = "plot-container-3d";
    plotContainer.style.width = "80%"; // Leave 10% margin on each side for scrolling
    plotContainer.style.height = "85%"; // Leave margins top/bottom too
    plotContainer.style.position = "relative";
    plotContainer.style.background = "#f2efe9";
    plotContainer.style.borderRadius = "12px";
    plotContainer.style.border = "1px solid rgba(0,0,0,0.4)";
    chapter3_3dDiv.appendChild(plotContainer);
  }

  // Add scroll hint overlays
  function addScrollHints() {
    // Remove existing hints
    document.querySelectorAll(".scroll-hint").forEach((el) => el.remove());

    // Left scroll hint
    const leftHint = document.createElement("div");
    leftHint.className = "scroll-hint";
    leftHint.innerHTML = "↕";
    leftHint.style.position = "absolute";
    leftHint.style.left = "5%";
    leftHint.style.top = "50%";
    leftHint.style.transform = "translateY(-50%)";
    leftHint.style.color = "rgba(0,0,0,0.6)";
    leftHint.style.fontSize = "18px";
    leftHint.style.fontFamily = "Andale Mono, monospace";
    leftHint.style.textAlign = "center";
    leftHint.style.lineHeight = "1.2";
    leftHint.style.pointerEvents = "none";
    leftHint.style.zIndex = "1000";
    leftHint.style.animation = "fadeInOut 3s ease-in-out infinite";
    chapter3_3dDiv.appendChild(leftHint);

    // Right scroll hint
    const rightHint = document.createElement("div");
    rightHint.className = "scroll-hint";
    rightHint.innerHTML = "↕";
    rightHint.style.position = "absolute";
    rightHint.style.right = "5%";
    rightHint.style.top = "50%";
    rightHint.style.transform = "translateY(-50%)";
    rightHint.style.color = "rgba(0,0,0,0.6)";
    rightHint.style.fontSize = "18px";
    rightHint.style.fontFamily = "Andale Mono, monospace";
    rightHint.style.textAlign = "center";
    rightHint.style.lineHeight = "1.2";
    rightHint.style.pointerEvents = "none";
    rightHint.style.zIndex = "1000";
    rightHint.style.animation = "fadeInOut 3s ease-in-out infinite";
    chapter3_3dDiv.appendChild(rightHint);

    // Add CSS animation if not already added
    if (!document.getElementById("scroll-hint-styles")) {
      const style = document.createElement("style");
      style.id = "scroll-hint-styles";
      style.textContent = `
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Add interaction instructions overlay
  function addInteractionInstructions() {
    // Remove existing instructions
    document
      .querySelectorAll("#interaction-instructions")
      .forEach((el) => el.remove());

    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    // Create interaction instructions container
    const instructionsDiv = document.createElement("div");
    instructionsDiv.id = "interaction-instructions";
    instructionsDiv.style.position = "absolute";
    instructionsDiv.style.bottom = isMobile ? "20px" : "50px";
    instructionsDiv.style.left = "50%";
    instructionsDiv.style.transform = "translateX(-50%)";
    instructionsDiv.style.backgroundColor = "rgba(242, 239, 233, 0.9)";
    instructionsDiv.style.border = "1px solid rgba(0,0,0,0.2)";
    instructionsDiv.style.borderRadius = "8px";
    instructionsDiv.style.padding = isMobile ? "8px 12px" : "12px 16px";
    instructionsDiv.style.display = "flex";
    instructionsDiv.style.flexDirection = "column";
    instructionsDiv.style.gap = isMobile ? "8px" : "12px";
    instructionsDiv.style.alignItems = "center";
    instructionsDiv.style.fontFamily = "Andale Mono, monospace";
    instructionsDiv.style.fontSize = isMobile ? "9px" : "11px";
    instructionsDiv.style.color = "rgba(0,0,0,0.7)";
    instructionsDiv.style.zIndex = "1000";
    instructionsDiv.style.pointerEvents = "none";
    instructionsDiv.style.width = isMobile ? "90%" : "auto";
    instructionsDiv.style.maxWidth = isMobile ? "90%" : "600px";

    // Create main interaction items container
    const interactionItemsDiv = document.createElement("div");
    interactionItemsDiv.style.display = "flex";
    interactionItemsDiv.style.gap = isMobile ? "12px" : "20px";
    interactionItemsDiv.style.alignItems = "center";
    interactionItemsDiv.style.flexWrap = isMobile ? "wrap" : "nowrap";
    interactionItemsDiv.style.justifyContent = "center";

    // Create interaction items
    const interactions = [
      {
        icon: "🖱️",
        text: "LEFT CLICK + DRAG TO ORBIT",
        asset: "assets/left-click.png",
      },
      {
        icon: "🖱️",
        text: "RIGHT CLICK + DRAG TO PAN",
        asset: "assets/right-click.png",
      },
      {
        icon: "⚬",
        text: "SCROLL OR PINCH TO ZOOM",
        asset: "assets/scroll.png",
      },
    ];

    interactions.forEach((interaction) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "interaction-item";
      itemDiv.style.display = "flex";
      itemDiv.style.alignItems = "center";
      itemDiv.style.gap = isMobile ? "4px" : "6px";

      // Try to use asset image, fallback to emoji
      const img = document.createElement("img");
      img.src = interaction.asset;
      img.alt = interaction.text;
      img.style.width = isMobile ? "12px" : "16px";
      img.style.height = isMobile ? "12px" : "16px";
      img.style.objectFit = "contain";

      // Fallback to emoji if image fails to load
      img.onerror = function () {
        const span = document.createElement("span");
        span.textContent = interaction.icon;
        span.style.fontSize = isMobile ? "10px" : "14px";
        itemDiv.replaceChild(span, img);
      };

      const span = document.createElement("span");
      span.textContent = interaction.text;
      span.style.fontSize = isMobile ? "9px" : "11px";
      span.style.fontWeight = "500";

      itemDiv.appendChild(img);
      itemDiv.appendChild(span);
      interactionItemsDiv.appendChild(itemDiv);
    });

    // Add scroll instruction text
    const scrollInstruction = document.createElement("div");
    scrollInstruction.style.fontSize = isMobile ? "8px" : "10px";
    scrollInstruction.style.color = "rgba(0,0,0,0.6)";
    scrollInstruction.style.fontStyle = "italic";
    scrollInstruction.style.textAlign = "center";
    scrollInstruction.style.marginTop = isMobile ? "4px" : "6px";
    scrollInstruction.textContent = "scroll outside of chart bounds to advance";

    instructionsDiv.appendChild(interactionItemsDiv);
    instructionsDiv.appendChild(scrollInstruction);

    chapter3_3dDiv.appendChild(instructionsDiv);
  }

  // Store all author data
  let allAuthorData = [];

  ///////////////////////////////////////////////////////////// ! Data Filtering Functions
  // Function to filter data based on step
  function filterDataForStep(stepId) {
    if (!allAuthorData || allAuthorData.length === 0) return [];

    switch (stepId) {
      case "earned-credibility":
        return allAuthorData.map((d) => {
          d.highlighted =
            d.author_clean === "Elisabeth Kübler-Ross" ||
            d.author_clean === "Gabor Maté";
          return d;
        });
      case "low-credibility":
        return allAuthorData.map((d) => {
          d.highlighted =
            d.author_clean === "L. Ron Hubbard" ||
            d.author_clean === "Kevin Trudeau" ||
            d.author_clean === "P.T. Barnum";
          return d;
        });

      default:
        return allAuthorData;
    }
  }

  ///////////////////////////////////////////////////////////// ! Visualization Functions
  // Function to display author data in 3D
  function displayAuthorData3D(data, stepId) {
    if (data && data.length > 0) {
      // Ensure the main container and plot container exist
      const chapter3_3dDiv = document.getElementById("chapter-3-3d");
      if (!chapter3_3dDiv) return;

      // Set up the main container styling
      chapter3_3dDiv.style.width = "100vw";
      chapter3_3dDiv.style.height = "100vh";
      chapter3_3dDiv.style.margin = "0";
      chapter3_3dDiv.style.padding = "0";
      chapter3_3dDiv.style.border = "none";
      chapter3_3dDiv.style.position = "relative";
      chapter3_3dDiv.style.display = "flex";
      chapter3_3dDiv.style.alignItems = "center";
      chapter3_3dDiv.style.justifyContent = "center";

      // Create or get the plot container
      let plotContainer = document.getElementById("plot-container-3d");
      if (!plotContainer) {
        plotContainer = document.createElement("div");
        plotContainer.id = "plot-container-3d";
        plotContainer.style.width = "80%";
        plotContainer.style.height = "85%";
        plotContainer.style.position = "relative";
        plotContainer.style.background = "#f2efe9";
        plotContainer.style.borderRadius = "12px";
        plotContainer.style.border = "1px solid rgba(0,0,0,0.4)";
        chapter3_3dDiv.appendChild(plotContainer);
      }

      ///////////////////////////////////////////////////////////// ! Data Processing
      // Parse numeric data
      data.forEach((d) => {
        d.avg_star_rating = +d.avg_star_rating;
        d.author_num_books = Math.max(1, +d.author_num_books); // Ensure minimum value of 1
        d.avg_cred_score = +d.avg_cred_score;
        d.bt_count = +d.bt_count;
      });

      // Calculate opacity based on avg_star_rating (Y axis)
      const minRating = d3.min(data, (d) => d.avg_star_rating);
      const maxRating = d3.max(data, (d) => d.avg_star_rating);
      const opacityScale = d3
        .scaleLinear()
        .domain([minRating, maxRating])
        .range([0.3, 1]);

      ///////////////////////////////////////////////////////////// ! Plot Configuration
      // Prepare data for Plotly
      const plotData = [
        {
          x: data.map((d) => d.author_num_books),
          y: data.map((d) => d.avg_star_rating),
          z: data.map((d) => d.avg_cred_score),
          mode: "markers",
          type: "scatter3d",
          showlegend: false,
          text: data.map((d) => d.author_clean),
          hovertemplate:
            "<b>%{text}</b><br>" +
            "Books: %{x}<br>" +
            "Rating: %{y}<br>" +
            "Cred Score: %{z}<br>" +
            "<extra></extra>",
          marker: {
            size: data.map((d) => (d.highlighted ? 25 : 8)),
            color: data.map((d) => {
              if (d.author_clean === "Gabor Maté") {
                return "url(assets/authors/gabor-mate.jpeg)";
              }
              return d.highlighted ? "var(--color-yellow)" : "#e1d6c2";
            }),
            opacity: data.map((d) => opacityScale(d.avg_star_rating)),
            line: {
              color: data.map((d) => {
                if (d.highlighted) return "black";
                return d.bt_count > 0 ? "var(--color-teal)" : "rgba(0,0,0,0)";
              }),
              width: data.map((d) => (d.highlighted ? 2 : 1)),
            },
          },
        },
      ];

      const layout = {
        autosize: true,
        height: plotContainer.clientHeight,
        width: plotContainer.clientWidth,
        showlegend: false,
        paper_bgcolor: "#f2efe9",
        plot_bgcolor: "#f2efe9",
        scene: {
          xaxis: {
            title: {
              text: "Number of Books",
              font: {
                family: "Andale Mono",
                size: 12,
                color: "rgba(0, 0, 0, 0.5)",
              },
            },
            type: "log",
            tickfont: {
              family: "Andale Mono",
              size: 12,
              color: "rgba(0, 0, 0, 0.5)",
            },
          },
          yaxis: {
            title: {
              text: "Avg Star Rating",
              font: {
                family: "Andale Mono",
                size: 12,
                color: "rgba(0, 0, 0, 0.5)",
              },
            },
            tickfont: {
              family: "Andale Mono",
              size: 12,
              color: "rgba(0, 0, 0, 0.5)",
            },
          },
          zaxis: {
            title: {
              text: "Avg Cred Score",
              font: {
                family: "Andale Mono",
                size: 12,
                color: "rgba(0, 0, 0, 0.5)",
              },
            },
            tickfont: {
              family: "Andale Mono",
              size: 12,
              color: "rgba(0, 0, 0, 0.5)",
            },
          },
          bgcolor: "#f2efe9",
        },
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0,
        },
      };

      ///////////////////////////////////////////////////////////// ! Camera Positioning
      // Set specific camera position for steps
      // Use the same camera position for all steps
      layout.scene.camera = {
        center: {
          x: 0.09281848656308971,
          y: -0.05135192301665359,
          z: -0.043104787934012755,
        },
        eye: {
          x: 1.276767997665493,
          y: 1.477562186328202,
          z: 1.5313871016951325,
        },
        up: {
          x: -0.001886770895421225,
          y: 0.002537092842318987,
          z: 0.9999959016081094,
        },
        projection: {
          type: "perspective",
        },
      };

      ///////////////////////////////////////////////////////////// ! Responsive Behavior
      // Add window resize event handler for responsive behavior
      window.addEventListener("resize", function () {
        Plotly.relayout("plot-container-3d", {
          width: plotContainer.clientWidth,
          height: plotContainer.clientHeight,
        });
      });

      // Reference the plot container
      const graphDiv = document.getElementById("plot-container-3d");

      // If already plotted, only update the marker styling
      if (graphDiv && graphDiv._fullLayout && graphDiv._fullLayout.scene) {
        Plotly.restyle("plot-container-3d", {
          "marker.size": [data.map((d) => (d.highlighted ? 25 : 8))],
          "marker.color": [
            data.map((d) => {
              if (d.author_clean === "Gabor Maté") {
                return "url(assets/authors/gabor-mate.jpeg)";
              }
              return d.highlighted ? "var(--color-yellow)" : "#e1d6c2";
            }),
          ],
          "marker.opacity": [data.map((d) => opacityScale(d.avg_star_rating))],
          "marker.line.color": [
            data.map((d) => {
              if (d.highlighted) return "black";
              return d.bt_count > 0 ? "var(--color-teal)" : "rgba(0,0,0,0)";
            }),
          ],
          "marker.line.width": [data.map((d) => (d.highlighted ? 2 : 1))],
        });

        // Ensure scroll hints and interaction instructions are still there
        setTimeout(addScrollHints, 100);
        setTimeout(addInteractionInstructions, 100);
      } else {
        // Initial plot creation or recreation after container was removed
        Plotly.newPlot("plot-container-3d", plotData, layout);

        // Add scroll hints and interaction instructions after plot is created
        setTimeout(addScrollHints, 500);
        setTimeout(addInteractionInstructions, 500);
      }

      // Add event listener to log camera position when the view changes
      document
        .getElementById("plot-container-3d")
        .on("plotly_relayout", function (eventData) {
          // Check if the event contains camera information
          if (eventData && eventData["scene.camera"]) {
            console.log("Camera position:", eventData["scene.camera"]);
          }
        });
    }
  }

  ///////////////////////////////////////////////////////////// ! Event Listeners
  // Add event listener for visualization updates
  document.addEventListener("visualizationUpdate", (event) => {
    const stepId = event.detail.step;
    displayAuthorData3D(filterDataForStep(stepId), stepId);
  });

  // Function to get current camera position
  window.getCameraPosition = function () {
    const graphDiv = document.getElementById("plot-container-3d");
    if (graphDiv && graphDiv._fullLayout && graphDiv._fullLayout.scene) {
      const camera = graphDiv._fullLayout.scene._scene.camera;
      return {
        eye: camera.eye,
        center: camera.center,
        up: camera.up,
      };
    }
    return null;
  };

  ///////////////////////////////////////////////////////////// ! Initialization
  try {
    // First check if data is already preloaded in dataCache
    if (window.dataCache && window.dataCache.authorData) {
      console.log("Using preloaded author data for 3D visualization");
      allAuthorData = window.dataCache.authorData;
      // Set credibility score for specific authors and filter out zero credibility
      allAuthorData = allAuthorData
        .map((author) => {
          if (
            author.author_clean === "P.T. Barnum" ||
            author.author_clean === "Kevin Trudeau"
          ) {
            author.avg_cred_score = "1";
          }
          return author;
        })
        .filter((author) => +author.avg_cred_score > 0);
      displayAuthorData3D(filterDataForStep("the-secret"), "the-secret"); // Default to the-secret step
    } else {
      // Try loading data directly if not preloaded
      d3.csv("data/sh_0415_author/author.csv")
        .then((data) => {
          // Set credibility score for specific authors and filter out zero credibility
          allAuthorData = data
            .map((author) => {
              if (
                author.author_clean === "P.T. Barnum" ||
                author.author_clean === "Kevin Trudeau"
              ) {
                author.avg_cred_score = "1";
              }
              return author;
            })
            .filter((author) => +author.avg_cred_score > 0);
          displayAuthorData3D(filterDataForStep("the-secret"), "the-secret");
        })
        .catch(() => {
          // Rest of your existing fetch fallback code
          fetch("data/sh_0415_author/author.csv")
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
              // Set credibility score for specific authors and filter out zero credibility
              allAuthorData = parsedData
                .map((author) => {
                  if (
                    author.author_clean === "P.T. Barnum" ||
                    author.author_clean === "Kevin Trudeau"
                  ) {
                    author.avg_cred_score = "1";
                  }
                  return author;
                })
                .filter((author) => +author.avg_cred_score > 0);
              displayAuthorData3D(
                filterDataForStep("the-secret"),
                "the-secret"
              );
            })
            .catch(useHardcodedData);
        });
    }
  } catch (error) {
    useHardcodedData();
  }
})();
