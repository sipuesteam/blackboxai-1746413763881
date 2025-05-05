/**
 * Visitor Count Bubble Module
 * Creates and manages a floating bubble on the bottom-left of the screen.
 * It displays a visitor count, uses a flag image as a background, and includes
 * a subtle pulsing animation and a tooltip.
 * Designed to be imported as a JavaScript module.
 */

class VisitorCountBubble {
  /**
   * Creates an instance of VisitorCountBubble.
   * The bubble and its associated elements are created and appended directly to the document body.
   *
   * @param {number} initialCount - The starting number for the visitor count. Defaults to 0.
   */
  constructor(initialCount = 0) {
    console.log('VisitorCountBubble: Initializing with count', initialCount);
    this.count = initialCount; // Store the current visitor count
    this.image = null; // Reference to the flag image element
    this.bubble = null; // Reference to the main SVG bubble element
    this.countText = null; // Reference to the SVG text element displaying the count
    this.tooltip = null; // Reference to the tooltip element
    this.bubbleInterval = null; // To hold the interval timer ID for periodic increments

    // Initialize and inject the necessary CSS styles into the document head.
    this.initStyles();
    // Create the required DOM elements (image, SVG bubble, tooltip) and append them to the body.
    this.createElements();
    // Update the displayed count in the SVG text and tooltip with the initial count.
    this.updateCountDisplay();
  }

  /**
   * Injects necessary CSS rules (including keyframe animations) into the document head.
   * Checks if styles are already present to avoid duplicates.
   */
  initStyles() {
    const styleId = 'visitor-bubble-styles'; // Unique ID for the style tag
    // Check if a style tag with this ID already exists in the document head.
    if (document.getElementById(styleId)) {
      console.log('VisitorCountBubble: Styles already initialized. Skipping injection.');
      return; // Exit the function if styles are already injected.
    }

    const style = document.createElement('style'); // Create a new style element
    style.id = styleId; // Assign the unique ID

    // Define CSS keyframe animations.
    const animations = `
      /* Keyframes for a subtle pulsing effect */
      @keyframes subtle-pulse {
        0% { transform: scale(1); } /* Start at normal size */
        50% { transform: scale(1.05); } /* Slightly enlarge */
        100% { transform: scale(1); } /* Return to normal size */
      }
      /* Keyframes for a fade-in and slight scale-up effect */
      @keyframes fadeInScale {
         0% { opacity: 0; transform: scale(0.8); } /* Start invisible and slightly smaller */
         100% { opacity: 1; transform: scale(1); } /* End fully visible and at normal size */
      }
    `;

    // Define CSS rules for positioning, appearance, layering (z-index), and applying animations.
    const styles = `
      /* Shared positioning styles for the image and SVG bubble */
      /* These elements are fixed to the viewport and positioned on the bottom-left. */
      .visitor-bubble-base {
        position: fixed; /* Fixed positioning relative to the viewport */
        bottom: 20px; /* Distance from the bottom edge */
        left: 20px; /* Distance from the left edge */
        user-select: none; /* Prevent text selection on the elements */
        /* Ensure elements are above most main content but below high-priority modals/overlays */
        z-index: 9998; /* A high z-index value */
      }

      /* Styles for the flag image element which acts as the background */
      .visitor-bubble-image {
        /* Inherit basic positioning from .visitor-bubble-base */
        bottom: 20px;
        left: 20px;
        user-select: none;
        position: fixed; /* Explicitly fixed positioning */
        width: 60px; /* Set the width to match the desired bubble size */
        height: 60px; /* Set the height to match the desired bubble size */
        border-radius: 50%; /* Make the image element circular */
        z-index: 9997; /* Slightly lower z-index than the SVG bubble so the bubble layers on top */
        pointer-events: none; /* Important: Allows mouse events (like clicks) to pass through the image to the SVG bubble behind it */
        object-fit: cover; /* Ensure the image covers the entire circular area without distortion */
        filter: brightness(0.9) grayscale(0.2); /* Optional: Apply subtle visual effects to the image */
      }

      /* Styles for the main SVG bubble element */
      .visitor-bubble-svg {
        /* Inherit basic positioning from .visitor-bubble-base */
        bottom: 20px;
        left: 20px;
        user-select: none;
        position: fixed; /* Explicitly fixed positioning */
        width: 60px; /* Set the desired size of the SVG element */
        height: 60px;
        cursor: pointer; /* Change cursor to a pointer to indicate interactivity */
        z-index: 9998; /* Layer above the image */
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); /* Apply a subtle drop shadow */
        transition: transform 0.3s ease; /* Smooth transition for the hover scale effect */
      }

      /* Hover effect for the SVG bubble: slightly scale up on mouse hover */
      .visitor-bubble-svg:hover {
        transform: scale(1.1); /* Scale up by 10% */
      }

      /* Animation class for the pulse effect, applied dynamically by JavaScript */
      .visitor-bubble-svg.pulse {
        animation: subtle-pulse 0.5s ease-in-out; /* Apply the subtle-pulse animation */
      }


      /* Styles for the tooltip element that appears on hover */
      .visitor-bubble-tooltip {
        position: fixed; /* Fixed positioning relative to the viewport */
        bottom: 85px; /* Position 85px from the bottom edge (above the 60px bubble + some gap) */
        left: 20px; /* Align with the left edge of the bubble */
        padding: 8px 12px; /* Internal padding */
        background: rgba(79, 70, 229, 0.9); /* Background color (Indigo-600) with some opacity */
        color: white; /* Text color */
        border-radius: 8px; /* Rounded corners */
        font-family: 'Inter', sans-serif; /* Use the site's primary font */
        font-weight: 600; /* Semi-bold font weight */
        font-size: 14px; /* Font size */
        pointer-events: none; /* Important: The tooltip itself should not block mouse events */
        opacity: 0; /* Initially hidden */
        transition: opacity 0.3s ease; /* Smooth fade transition */
        z-index: 9999; /* Highest z-index to ensure it appears on top of everything else */
        white-space: nowrap; /* Prevent the tooltip text from wrapping */
        user-select: none; /* Prevent text selection on the tooltip */
      }

      /* Styles for the text element inside the SVG bubble */
      .visitor-bubble-svg text {
        font-family: 'Inter', sans-serif; /* Ensure the correct font is applied to SVG text */
        font-weight: 700; /* Bold font weight */
        fill: white; /* Text color */
        user-select: none; /* Prevent text selection */
      }
      /* Styles for the icon path inside the SVG bubble */
      .visitor-bubble-svg .icon-path {
        fill: white; /* Color of the icon */
        opacity: 0.9; /* Slightly transparent icon */
      }
    `;

    // Combine animations and styles and set the text content of the style element.
    style.textContent = animations + styles;
    // Append the created style element to the document's head.
    document.head.appendChild(style);
    console.log('VisitorCountBubble: Styles injected into document head.');
  }

  /**
   * Creates the necessary DOM elements for the visitor bubble functionality:
   * the flag image, the main SVG bubble (containing circle, icon, and text), and the tooltip.
   * These elements are created but not yet appended to the DOM by this function.
   */
  createElements() {
    console.log('VisitorCountBubble: Creating DOM elements...');
    // 1. Create Image Element (Flag background)
    this.image = document.createElement('img'); // Create an img element
    this.image.className = 'visitor-bubble-image'; // Assign CSS class for styling
    // Using a reliable public domain flag image URL.
    // If you have a specific flag image URL from fla-shop or another source, replace this URL.
    this.image.src = 'https://flagcdn.com/us.svg'; // <-- REPLACE if using a different flag image URL
    this.image.alt = 'Country Flag'; // Add descriptive alt text for accessibility

    // 2. Create Main SVG Bubble Element
    // Use `createElementNS` for creating SVG elements in JavaScript. The namespace URI is required.
    this.bubble = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.bubble.className = 'visitor-bubble-svg'; // Assign CSS class for styling
    // Set the viewBox attribute to define the coordinate system within the SVG.
    // Matching it to width/height (60x60) simplifies positioning children.
    this.bubble.setAttribute("viewBox", "0 0 60 60");
    // Add ARIA attributes for accessibility. Hide from screen readers as the count is in the tooltip.
    this.bubble.setAttribute("aria-hidden", "true"); // Indicates the element is not visible to accessibility tools.

    // Create SVG Definitions (<defs>) for reusable elements like gradients.
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    // Create a radial gradient for the bubble's fill.
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
    // Assign a unique ID to the gradient, incorporating a timestamp to reduce collision risk if multiple instances exist.
    const gradientId = "bubbleGradient_" + Date.now();
    gradient.setAttribute("id", gradientId); // Set the dynamic ID
    // Define the center and radius of the radial gradient.
    gradient.setAttribute("cx", "50%"); // Center X
    gradient.setAttribute("cy", "50%"); // Center Y
    gradient.setAttribute("r", "50%"); // Radius (covers the circle)
    gradient.setAttribute("fx", "50%"); // Focal point X (same as center for uniform gradient)
    gradient.setAttribute("fy", "50%"); // Focal point Y (same as center)

    // Define color stops for the gradient.
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%"); // Start color at the center
    stop1.setAttribute("stop-color", "#4f46e5"); // Indigo-600 (start color)
    stop1.setAttribute("stop-opacity", "1"); // Fully opaque
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%"); // End color at the edge
    // Corrected typo in namespace URI for stop2:
    // stop2.setAttribute("stop-color", "#6366f1"); // Indigo-400 (end color) - Using a slightly different indigo for gradient effect
    stop2.setAttribute("stop-color", "#3b82f6"); // Blue-500 (end color, matching shadow)
    stop2.setAttribute("stop-opacity", "1"); // Fully opaque

    // Append the color stops to the gradient element.
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    // Append the gradient to the definitions element.
    defs.appendChild(gradient);
    // Append the definitions element to the main SVG bubble.
    this.bubble.appendChild(defs);

    // Create the main circle element for the bubble shape.
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "30"); // Center X within the 60x60 viewBox
    circle.setAttribute("cy", "30"); // Center Y within the 60x60 viewBox
    circle.setAttribute("r", "28"); // Radius (slightly less than half the size to leave space for potential stroke, though not used here)
    // Set the fill of the circle to the gradient defined earlier, referencing its dynamic ID.
    circle.setAttribute("fill", "url(#" + gradientId + ")"); // Reference the dynamic gradient ID
    // Append the circle to the main SVG bubble.
    this.bubble.appendChild(circle);

    // Create a group element (<g>) to contain the icon path.
    // This allows applying transformations (scale and translate) to the icon as a whole.
    const iconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    // Calculate the transformation needed to scale the original 24x24 icon path
    // and move its center from (12, 12) to the center of the 60x60 bubble (30, 30).
    // Scale factor = desired icon size / original icon size = 30px / 24px = 1.25
    // Translation needed = New center - (Original center * Scale factor)
    // Translation X = 30 - (12 * 1.25) = 30 - 15 = 15
    // Translation Y = 30 - (12 * 1.25) = 30 - 15 = 15
    iconGroup.setAttribute("transform", "translate(15 15) scale(1.25)"); // Apply translate then scale

    // Create the path element (<path>) for the user/visitor icon.
    const userIconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    userIconPath.className = 'icon-path'; // Assign CSS class for styling the path
    // Set the 'd' attribute with the SVG path data for the user icon.
    userIconPath.setAttribute("d", "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"); // User icon path data
    // Append the path element to the icon group.
    iconGroup.appendChild(userIconPath);
    // Append the icon group to the main SVG bubble.
    this.bubble.appendChild(iconGroup);


    // Create the text element (<text>) to display the visitor count number.
    this.countText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    this.countText.setAttribute("x", "30"); // Position X at the horizontal center (30) of the 60x60 viewBox
    this.countText.setAttribute("y", "35"); // Position Y slightly below the vertical center (30) to align baseline visually
    this.countText.setAttribute("text-anchor", "middle"); // Anchor the text's start point at the middle horizontally
    this.countText.setAttribute("dominant-baseline", "middle"); // Align the text's baseline to the middle vertically (attempts true vertical centering)
    this.countText.setAttribute("font-size", "20"); // Set the font size in SVG units
    // Font family, weight, and fill color are applied via CSS classes targeting `.visitor-bubble-svg text`.

    // Append the text element to the main SVG bubble.
    this.bubble.appendChild(this.countText);

    // 3. Create Tooltip Element
    this.tooltip = document.createElement("div"); // Create a standard HTML div element for the tooltip
    this.tooltip.className = 'visitor-bubble-tooltip'; // Assign CSS class for styling
    this.tooltip.setAttribute("role", "tooltip"); // Add accessibility role

    // The text content of the tooltip will be updated by the `updateCountDisplay` method.

    // Append all created elements to the document body.
    // The order of appending matters for stacking context and z-index.
    document.body.appendChild(this.image); // Append the flag image first (lowest z-index)
    document.body.appendChild(this.bubble); // Append the SVG bubble next (middle z-index)
    document.body.appendChild(this.tooltip); // Append the tooltip last (highest z-index)

    console.log('VisitorCountBubble: DOM elements created and appended to body.');

    // Add event listeners to the SVG bubble to show/hide the tooltip on hover.
    this.bubble.addEventListener("mouseenter", () => {
      console.log('VisitorCountBubble: Mouse entered bubble, showing tooltip.');
      if (this.tooltip) this.tooltip.style.opacity = "1"; // Make tooltip visible
    });
    this.bubble.addEventListener("mouseleave", () => {
      console.log('VisitorCountBubble: Mouse left bubble, hiding tooltip.');
      if (this.tooltip) this.tooltip.style.opacity = "0"; // Hide tooltip
    });
     // Note: The bubble scale hover effect is handled purely by the CSS `:hover` rule on `.visitor-bubble-svg`.
  }

  /**
   * Updates the internal visitor count and the displayed text in the SVG bubble
   * and the tooltip element.
   *
   * @param {number} newCount - The new visitor count to set and display.
   */
  updateCount(newCount) {
    this.count = newCount; // Update the internal count
    console.log('VisitorCountBubble: Updating count display to', newCount);
    this.updateCountDisplay(); // Call the method to update the DOM elements
  }

  /**
   * Updates the text content of the SVG text element and the tooltip element
   * based on the current `this.count`.
   */
  updateCountDisplay() {
      // Check if the SVG text element exists before trying to update its text.
      if (this.countText) {
           // Set the text content of the SVG text element to the current count.
           this.countText.textContent = this.count.toString(); // Convert number to string
      } else {
           console.error('VisitorCountBubble: SVG count text element not found, cannot update display.');
           // In a robust application, you might try to recreate the element here or handle this error differently.
      }
      // Check if the tooltip element exists before trying to update its text.
      if (this.tooltip) {
           // Set the text content of the tooltip.
           this.tooltip.innerText = `Visitors: ${this.count}`; // Use innerText for plain text, include a label
      } else {
           console.error('VisitorCountBubble: Tooltip element not found, cannot update display.');
      }
  }


  /**
   * Increments the visitor count by 1 and triggers the subtle pulse animation on the bubble.
   * This method is typically called periodically by an interval timer.
   */
  increment() {
    console.log('VisitorCountBubble: Incrementing count...');
    // Increment the internal count and update the display.
    this.updateCount(this.count + 1);

    // Trigger the pulse animation on the SVG bubble element.
    if (this.bubble) { // Check if the bubble element exists.
      // Remove the 'pulse' class first. This is necessary to allow the animation to be re-triggered
      // even if the class was already present from a previous increment.
      this.bubble.classList.remove('pulse');
      // Use `requestAnimationFrame` twice. This is a common technique to ensure the browser
      // has a chance to repaint (remove the class) before the class is added back,
      // guaranteeing the animation restarts from the beginning.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Add the 'pulse' class back to trigger the animation.
          this.bubble.classList.add('pulse');
          console.log('VisitorCountBubble: Triggered pulse animation.');
          // Remove the 'pulse' class after the animation duration completes.
          // This prepares the element for the next time the animation needs to be triggered.
          // The duration (500ms) should match the animation duration defined in the CSS for `.visitor-bubble-svg.pulse`.
          setTimeout(() => {
            this.bubble.classList.remove('pulse');
            // console.log('VisitorCountBubble: Removed pulse class after animation.'); // Uncomment for detailed logging
          }, 500); // Match animation duration (0.5s)
        });
      });
    } else {
        console.warn('VisitorCountBubble: Bubble element not found, cannot trigger pulse animation.');
    }
  }

  /**
   * Starts the periodic simulation of new visitors by setting up an interval timer.
   * The timer calls the `increment` method at a fixed interval.
   * This method should be called once after the VisitorCountBubble instance is created.
   */
  start() {
    console.log('VisitorCountBubble: Starting interval for count increments.');
    // The initial count was set in the constructor, and `updateCountDisplay` was called.
    // We can optionally trigger an initial increment immediately upon starting,
    // or rely solely on the interval for subsequent increments.
    // Let's trigger one initial increment to start the effect immediately.
    this.increment(); // Simulate the first visitor arrival immediately

    // Define the duration for the interval timer (how often to simulate a new visitor).
    const intervalDuration = 9000; // 9 seconds (in milliseconds)
    // Set up the interval timer. It will repeatedly call the provided function (which increments the count and triggers the bubble effect).
    this.bubbleInterval = setInterval(() => {
      this.increment(); // Call the increment method on each interval tick
       console.log(`VisitorCountBubble: Interval triggered. Incrementing count. Next increment in ${intervalDuration / 1000}s.`);
    }, intervalDuration); // Repeat every 9 seconds

    // Return the instance to allow method chaining if desired (e.g., `new VisitorCountBubble(10).start();`)
    return this;
  }

  /**
   * Stops the periodic simulation of new visitors by clearing the interval timer.
   * This method can be called to pause or stop the visitor count effect.
   */
  stop() {
    console.log('VisitorCountBubble: Stopping interval.');
    if (this.bubbleInterval) { // Check if the interval timer is currently active
      clearInterval(this.bubbleInterval); // Clear the interval timer using its ID
      this.bubbleInterval = null; // Reset the property to indicate the interval is stopped
    }
  }

  /**
   * Optional: Method to explicitly show the bubble and tooltip elements if they were hidden.
   */
  show() {
      console.log('VisitorCountBubble: Showing elements.');
      if (this.image) this.image.style.display = ''; // Reset display to default (e.g., 'block' or '')
      if (this.bubble) this.bubble.style.display = ''; // Reset display
      // Tooltip visibility is still controlled by hover/focus, so we don't force show it here.
  }

  /**
   * Optional: Method to explicitly hide the bubble and tooltip elements.
   */
  hide() {
      console.log('VisitorCountBubble: Hiding elements.');
      if (this.image) this.image.style.display = 'none'; // Hide the image
      if (this.bubble) this.bubble.style.display = 'none'; // Hide the bubble
      if (this.tooltip) this.tooltip.style.opacity = '0'; // Hide tooltip if it's currently visible
  }
}

// Export the VisitorCountBubble class as the default export of this module.
// This is required for the `import VisitorCountBubble from './visitorCountBubble.js';` statement in index.html to work correctly.
export default VisitorCountBubble;

// Removed the old window.addEventListener('load', ...) usage example at the bottom,
// as the initialization and starting of the bubble effect are handled by the
// <script type="module"> block within the index.html file.
