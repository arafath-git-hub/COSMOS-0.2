
(() => {
  "use strict";

  let installPrompt = null;

  const isHomePage = () => {
    const path = window.location.pathname;
    return path.endsWith("/") || path.endsWith("/index.html");
  };

  function initCOSMOSPWA() {
    // Register offline support.
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./service-worker.js")
          .catch((error) => {
            console.error("COSMOS service worker registration failed:", error);
          });
      });
    }

    // Install controls belong on the Home page only.
    if (!isHomePage()) return;

    const installButton = document.getElementById("installAppButton");
    const installHelp = document.getElementById("installAppHelp");

    if (!installButton) {
      console.warn("COSMOS: Install button was not found in index.html.");
      return;
    }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    function showMessage(message) {
      if (!installHelp) return;
      installHelp.textContent = message;
      installHelp.hidden = false;
    }

    function hideMessage() {
      if (!installHelp) return;
      installHelp.textContent = "";
      installHelp.hidden = true;
    }

    if (isStandalone) {
      installButton.hidden = true;
      return;
    }

    // iOS normally installs through the browser's Share menu.
    if (isIOS) {
      installButton.hidden = false;
      installButton.textContent = "How to Install";
    } else {
      installButton.hidden = true;
    }

    // The browser decides when native installation is available.
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;

      installButton.hidden = false;
      installButton.textContent = "Install App";
      hideMessage();
    });

    installButton.addEventListener("click", async () => {
      hideMessage();

      if (isStandalone) {
        installButton.hidden = true;
        return;
      }

      if (installPrompt) {
        const promptEvent = installPrompt;
        installPrompt = null;

        try {
          await promptEvent.prompt();
          const choice = await promptEvent.userChoice;

          if (choice.outcome === "accepted") {
            showMessage("COSMOS installation was accepted by your browser.");
          } else {
            showMessage("Installation was cancelled. You can try again later.");
          }
        } catch (error) {
          console.error("COSMOS installation prompt failed:", error);
          showMessage("Installation is unavailable right now. Try your browser menu.");
        }

        return;
      }

      if (isIOS) {
        showMessage(
          "To install COSMOS: open the Share menu in Safari, then choose Add to Home Screen."
        );
      } else {
        showMessage(
          "Installation is not available through this button yet. Try your browser menu and look for Install app or Add to Home Screen."
        );
      }
    });

    window.addEventListener("appinstalled", () => {
      installButton.hidden = true;
      installPrompt = null;
      showMessage("COSMOS has been installed successfully.");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCOSMOSPWA, { once: true });
  } else {
    initCOSMOSPWA();
  }
})();
