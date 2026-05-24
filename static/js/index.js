window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
  const dropdown = document.getElementById("moreWorksDropdown");
  const button = document.querySelector(".more-works-btn");

  if (dropdown.classList.contains("show")) {
    dropdown.classList.remove("show");
    button.classList.remove("active");
  } else {
    dropdown.classList.add("show");
    button.classList.add("active");
  }
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const container = document.querySelector(".more-works-container");
  const dropdown = document.getElementById("moreWorksDropdown");
  const button = document.querySelector(".more-works-btn");

  if (container && !container.contains(event.target)) {
    dropdown.classList.remove("show");
    button.classList.remove("active");
  }
});

// Close dropdown on escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const dropdown = document.getElementById("moreWorksDropdown");
    const button = document.querySelector(".more-works-btn");
    dropdown.classList.remove("show");
    button.classList.remove("active");
  }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
  const bibtexElement = document.getElementById("bibtex-code");
  const button = document.querySelector(".copy-bibtex-btn");
  const copyText = button.querySelector(".copy-text");

  if (bibtexElement) {
    navigator.clipboard
      .writeText(bibtexElement.textContent)
      .then(function () {
        // Success feedback
        button.classList.add("copied");
        copyText.textContent = "Cop";

        setTimeout(function () {
          button.classList.remove("copied");
          copyText.textContent = "Copy";
        }, 2000);
      })
      .catch(function (err) {
        console.error("Failed to copy: ", err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = bibtexElement.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        button.classList.add("copied");
        copyText.textContent = "Cop";
        setTimeout(function () {
          button.classList.remove("copied");
          copyText.textContent = "Copy";
        }, 2000);
      });
  }
}

// Scroll to top functionality
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Show/hide scroll to top button
window.addEventListener("scroll", function () {
  const scrollButton = document.querySelector(".scroll-to-top");
  if (window.pageYOffset > 300) {
    scrollButton.classList.add("visible");
  } else {
    scrollButton.classList.remove("visible");
  }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
  const carouselVideos = document.querySelectorAll(".results-carousel video");

  if (carouselVideos.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          // Video is in view, play it
          video.play().catch((e) => {
            // Autoplay failed, probably due to browser policy
            console.log("Autoplay prevented:", e);
          });
        } else {
          // Video is out of view, pause it
          video.pause();
        }
      });
    },
    {
      threshold: 0.5, // Trigger when 50% of the video is visible
    },
  );

  carouselVideos.forEach((video) => {
    observer.observe(video);
  });
}

function setupDatasetTablePreviewModal() {
  const table = document.querySelector(".dataset-table");
  const modal = document.getElementById("dataset-cell-modal");
  const modalContent = document.getElementById("dataset-modal-content");
  const fullscreenRoot = document.getElementById("dataset-preview-card");

  if (!table || !modal || !modalContent) return;

  // Ensure modal is inside fullscreen root so it remains visible in fullscreen mode.
  if (fullscreenRoot && modal.parentElement !== fullscreenRoot) {
    fullscreenRoot.appendChild(modal);
  }

  const LONG_TEXT_THRESHOLD = 100;
  const cells = table.querySelectorAll("tbody td");

  cells.forEach((cell) => {
    const text = (cell.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length <= LONG_TEXT_THRESHOLD) return;

    cell.dataset.fullText = text;
    cell.innerHTML = "";

    const preview = document.createElement("div");
    preview.className = "cell-preview-text";
    preview.textContent = text;

    const moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.className = "cell-see-more";
    moreBtn.textContent = "See more...";
    moreBtn.setAttribute("aria-label", "See full cell content");
    moreBtn.addEventListener("click", () => {
      modalContent.textContent = text;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    });

    cell.appendChild(preview);
    cell.appendChild(moreBtn);
  });

  table.addEventListener("click", (event) => {
    const trigger = event.target.closest(".cell-see-more");
    if (!trigger) return;

    const td = trigger.closest("td");
    if (!td || !td.dataset.fullText) return;
    event.preventDefault();
    modalContent.textContent = td.dataset.fullText;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  });

  modal.addEventListener("click", (event) => {
    const shouldClose = event.target.closest("[data-close-modal='true']");
    if (!shouldClose) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      modal.hidden = true;
      document.body.style.overflow = "";
    }
  });
}

function setupDatasetTableFullscreen() {
  const fullscreenRoot = document.getElementById("dataset-preview-card");
  const wrap = document.querySelector(".dataset-table-wrap");
  const button = document.getElementById("dataset-fullscreen-btn");
  if (!fullscreenRoot || !wrap || !button) return;

  const icon = button.querySelector("i");
  const label = button.querySelector("span");

  const updateButtonState = () => {
    const isFullscreen =
      document.fullscreenElement === fullscreenRoot ||
      document.webkitFullscreenElement === fullscreenRoot;

    if (isFullscreen) {
      if (icon) {
        icon.classList.remove("fa-expand");
        icon.classList.add("fa-compress");
      }
      if (label) label.textContent = "Exit full screen";
    } else {
      if (icon) {
        icon.classList.remove("fa-compress");
        icon.classList.add("fa-expand");
      }
      if (label) label.textContent = "Full screen";
    }
  };

  button.addEventListener("click", async () => {
    const isFullscreen =
      document.fullscreenElement === fullscreenRoot ||
      document.webkitFullscreenElement === fullscreenRoot;

    try {
      if (!isFullscreen) {
        if (fullscreenRoot.requestFullscreen) {
          await fullscreenRoot.requestFullscreen();
        } else if (fullscreenRoot.webkitRequestFullscreen) {
          fullscreenRoot.webkitRequestFullscreen();
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } catch (_) {
      // Ignore failure and keep current state.
    } finally {
      updateButtonState();
    }
  });

  document.addEventListener("fullscreenchange", updateButtonState);
  document.addEventListener("webkitfullscreenchange", updateButtonState);
  updateButtonState();
}

// Dataset request form submit
function setupDatasetRequestForm() {
  const form = document.getElementById("dataset-request-form");
  if (!form) return;

  const submitBtn = document.getElementById("dataset-submit-btn");
  const successMsg = document.getElementById("dataset-success");
  const errorMsg = document.getElementById("dataset-error");
  const defaultBtnText = submitBtn ? submitBtn.textContent : "";
  const endpoint = (form.dataset.endpoint || "").trim();

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (successMsg) successMsg.hidden = true;
    if (errorMsg) errorMsg.hidden = true;

    if (!endpoint || endpoint === "https://YOUR_PUBLIC_ENDPOINT_HERE") {
      if (errorMsg) {
        errorMsg.textContent = " Public endpoint is not configured yet.";
        const icon = document.createElement("i");
        icon.className = "fas fa-exclamation-circle";
        errorMsg.prepend(icon);
        errorMsg.hidden = false;
      }
      return;
    }

    const formData = new FormData(form);
    const payload = {
      data: Object.fromEntries(formData.entries()),
    };

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
        redirect: "follow",
      });

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (_) {
        // Some endpoints may return empty body or non-JSON.
      }

      if (!response.ok) {
        throw new Error("Request failed");
      }

      // Support APIs that always return HTTP 200 and encode status in JSON body.
      if (responseData && typeof responseData === "object") {
        const statusValue = responseData.status;

        const statusIsOk = statusValue === 200 || statusValue === 201;

        const apiIndicatesFailure = "status" in responseData && !statusIsOk;

        if (apiIndicatesFailure) {
          throw new Error(responseData.message);
        }
      }

      form.reset();
      if (successMsg) successMsg.hidden = false;
    } catch (error) {
      if (errorMsg) errorMsg.hidden = false;
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultBtnText;
      }
    }
  });
}

$(document).ready(function () {
  // Check for click events on the navbar burger icon

  var options = {
    slidesToScroll: 1,
    slidesToShow: 1,
    loop: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  // Initialize all div with carousel class
  var carousels = bulmaCarousel.attach(".carousel", options);

  bulmaSlider.attach();

  // Setup video autoplay for carousel
  setupVideoCarouselAutoplay();

  // Setup dataset request form submission
  setupDatasetRequestForm();

  // Setup dataset table long-content preview modal
  setupDatasetTablePreviewModal();

  // Setup dataset table fullscreen button
  setupDatasetTableFullscreen();
});
