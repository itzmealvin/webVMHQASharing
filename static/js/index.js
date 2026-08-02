window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
  const dropdown = document.getElementById("moreWorksDropdown");
  const button = document.querySelector(".more-works-btn");

  if (!dropdown || !button) return;

  if (dropdown.classList.contains("show")) {
    dropdown.classList.remove("show");
    button.classList.remove("active");
    button.setAttribute("aria-expanded", "false");
  } else {
    dropdown.classList.add("show");
    button.classList.add("active");
    button.setAttribute("aria-expanded", "true");
  }
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const container = document.querySelector(".more-works-container");
  const dropdown = document.getElementById("moreWorksDropdown");
  const button = document.querySelector(".more-works-btn");

  if (container && dropdown && button && !container.contains(event.target)) {
    dropdown.classList.remove("show");
    button.classList.remove("active");
    button.setAttribute("aria-expanded", "false");
  }
});

// Close dropdown on escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const dropdown = document.getElementById("moreWorksDropdown");
    const button = document.querySelector(".more-works-btn");
    if (dropdown && button) {
      dropdown.classList.remove("show");
      button.classList.remove("active");
      button.setAttribute("aria-expanded", "false");
    }
  }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
  const bibtexElement = document.getElementById("bibtex-code");
  const button = document.querySelector(".copy-bibtex-btn");
  const copyText = button && button.querySelector(".copy-text");

  if (!bibtexElement || !button || !copyText) return;

  const showFeedback = (message, status) => {
    button.classList.toggle("copied", status === "success");
    button.classList.toggle("copy-failed", status === "error");
    copyText.textContent = message;

    setTimeout(function () {
      button.classList.remove("copied", "copy-failed");
      copyText.textContent = "Copy";
    }, 2000);
  };

  const fallbackCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = bibtexElement.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);
    if (!copied) throw new Error("Copy command was not accepted");
  };

  const writeToClipboard = navigator.clipboard
    ? navigator.clipboard.writeText(bibtexElement.textContent)
    : Promise.reject(new Error("Clipboard API is unavailable"));

  writeToClipboard
    .catch(fallbackCopy)
    .then(() => showFeedback("Copied", "success"))
    .catch(() => showFeedback("Copy failed", "error"));
}

// Scroll to top functionality
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior:
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
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

  const closeButton = modal.querySelector(".dataset-modal-close");
  let lastModalTrigger = null;
  const inertedElements = new Map();

  const setElementInert = (element, isInert) => {
    if ("inert" in element) {
      element.inert = isInert;
    } else if (isInert) {
      element.setAttribute("inert", "");
    } else {
      element.removeAttribute("inert");
    }
  };

  const setModalBackgroundInert = (isInert) => {
    if (!isInert) {
      inertedElements.forEach((wasInert, element) => {
        setElementInert(element, wasInert);
      });
      inertedElements.clear();
      return;
    }

    let current = modal;
    while (current && current.parentElement) {
      Array.from(current.parentElement.children).forEach((sibling) => {
        if (sibling === current || inertedElements.has(sibling)) return;
        inertedElements.set(
          sibling,
          "inert" in sibling ? sibling.inert : sibling.hasAttribute("inert"),
        );
        setElementInert(sibling, true);
      });
      current = current.parentElement;
      if (current === document.body) break;
    }
  };

  const getFocusableElements = () =>
    Array.from(
      modal.querySelectorAll(
        'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hidden);

  const closeModal = () => {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    setModalBackgroundInert(false);
    if (lastModalTrigger && lastModalTrigger.isConnected) {
      lastModalTrigger.focus();
    }
  };

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
    moreBtn.textContent = "See more…";
    moreBtn.setAttribute("aria-label", "See full cell content");

    cell.appendChild(preview);
    cell.appendChild(moreBtn);
  });

  table.addEventListener("click", (event) => {
    const trigger = event.target.closest(".cell-see-more");
    if (!trigger) return;

    const td = trigger.closest("td");
    if (!td || !td.dataset.fullText) return;
    event.preventDefault();
    lastModalTrigger = trigger;
    modalContent.textContent = td.dataset.fullText;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setModalBackgroundInert(true);
    if (closeButton) closeButton.focus();
  });

  modal.addEventListener("click", (event) => {
    const shouldClose = event.target.closest("[data-close-modal='true']");
    if (!shouldClose) return;
    closeModal();
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });
}

function setupDatasetTableFullscreen() {
  const fullscreenRoot = document.getElementById("dataset-preview-card");
  const wrap = document.querySelector(".dataset-table-wrap");
  const button = document.getElementById("dataset-fullscreen-btn");
  if (!fullscreenRoot || !wrap || !button) return;

  const icon = button.querySelector("i");
  const label = button.querySelector(".dataset-fullscreen-label");

  const lockLandscapeOrientation = async () => {
    if (!screen.orientation || !screen.orientation.lock) return;

    try {
      await screen.orientation.lock("landscape");
    } catch (_) {
      // Some mobile browsers only allow orientation locking in installed apps.
    }
  };

  const unlockOrientation = () => {
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  };

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
      button.setAttribute("aria-label", "Exit full screen");
    } else {
      unlockOrientation();
      if (icon) {
        icon.classList.remove("fa-compress");
        icon.classList.add("fa-expand");
      }
      if (label) label.textContent = "Full screen";
      button.setAttribute("aria-label", "View table in full screen");
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
          await lockLandscapeOrientation();
        } else if (fullscreenRoot.webkitRequestFullscreen) {
          fullscreenRoot.webkitRequestFullscreen();
          await lockLandscapeOrientation();
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
  const submitLabel = submitBtn && submitBtn.querySelector(".submit-label");
  const successMsg = document.getElementById("dataset-success");
  const errorMsg = document.getElementById("dataset-error");
  const defaultBtnText = submitLabel
    ? submitLabel.textContent
    : submitBtn
      ? submitBtn.textContent
      : "";
  const endpoint = (form.dataset.endpoint || "").trim();
  let formIsDirty = false;

  const markFormDirty = () => {
    formIsDirty = true;
  };

  form.addEventListener("input", markFormDirty);
  form.addEventListener("change", markFormDirty);
  window.addEventListener("beforeunload", (event) => {
    if (!formIsDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    formIsDirty = true;

    if (successMsg) successMsg.hidden = true;
    if (errorMsg) errorMsg.hidden = true;

    if (!endpoint || endpoint === "https://YOUR_PUBLIC_ENDPOINT_HERE") {
      if (errorMsg) {
        errorMsg.textContent =
          "Dataset requests are not configured yet. Use the contact details in the paper to request access.";
        const icon = document.createElement("i");
        icon.className = "fas fa-exclamation-circle";
        icon.setAttribute("aria-hidden", "true");
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
        submitBtn.classList.add("is-loading");
        submitBtn.setAttribute("aria-busy", "true");
        if (submitLabel) {
          submitLabel.textContent = "Submitting…";
        }
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
      formIsDirty = false;
      if (successMsg) successMsg.hidden = false;
    } catch (error) {
      if (errorMsg) errorMsg.hidden = false;
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
        submitBtn.removeAttribute("aria-busy");
        if (submitLabel) {
          submitLabel.textContent = defaultBtnText;
        } else {
          submitBtn.textContent = defaultBtnText;
        }
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
