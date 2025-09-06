// ==UserScript==
// @name         Auto Undo Reposts (Dropdown Fix)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Clicks green repost icons and selects "Undo repost" from dropdown
// @match        https://x.com/*
// @match        https://twitter.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let isRunning = false;

  async function clickUndoRepost() {
    console.log("🔍 Looking for green repost buttons...");

    // Find all green/active repost buttons
    const repostButtons = document.querySelectorAll(
      '[data-testid="unretweet"]'
    );
    console.log(`Found ${repostButtons.length} active repost buttons`);

    let processedCount = 0;

    for (const button of repostButtons) {
      try {
        // Skip if already processed
        if (button.dataset.processed) continue;
        button.dataset.processed = "true";

        console.log(`🖱️ Clicking repost button ${processedCount + 1}...`);

        // Click the green repost button to open dropdown
        button.click();

        // Wait for dropdown to appear
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Look for "Undo repost" in the dropdown menu
        const undoOptions = [
          // Different possible selectors for the dropdown option
          'div[role="menuitem"]:has-text("Undo repost")',
          '[role="menuitem"] span:contains("Undo repost")',
          'div[data-testid="unretweetConfirm"]',
          // Fallback: look for any menu item containing "Undo"
          '[role="menuitem"]:contains("Undo")',
        ];

        let undoButton = null;

        // Try different methods to find the undo button
        for (const selector of undoOptions) {
          try {
            if (
              selector.includes(":has-text") ||
              selector.includes(":contains")
            ) {
              // Use XPath for text content search
              const xpath = selector.includes("Undo repost")
                ? "//div[@role='menuitem'][contains(., 'Undo repost')]"
                : "//div[@role='menuitem'][contains(., 'Undo')]";

              const result = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              );
              undoButton = result.singleNodeValue;
            } else {
              undoButton = document.querySelector(selector);
            }

            if (undoButton) break;
          } catch (e) {
            // Continue to next selector
          }
        }

        if (undoButton) {
          console.log('✅ Found "Undo repost" option, clicking...');
          undoButton.click();
          processedCount++;

          // Wait before processing next one
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          console.log('❌ Could not find "Undo repost" option in dropdown');

          // Click elsewhere to close dropdown
          document.body.click();
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error("Error processing repost button:", error);
      }
    }

    console.log(`✨ Processed ${processedCount} repost buttons`);
    return processedCount;
  }

  async function scrollAndProcess() {
    if (!isRunning) return;

    const processed = await clickUndoRepost();

    // Clear processed markers periodically
    if (Math.random() < 0.1) {
      document.querySelectorAll('[data-processed="true"]').forEach((el) => {
        delete el.dataset.processed;
      });
    }

    // Scroll down to load more content
    window.scrollBy(0, 600);
    console.log("📜 Scrolled down...");

    // Continue with random delay to avoid detection
    const delay = 2000 + Math.random() * 2000; // 2-4 seconds
    setTimeout(scrollAndProcess, delay);
  }

  // Start/stop with Alt+U
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "u") {
      isRunning = !isRunning;

      if (isRunning) {
        console.log("🚀 Started auto-undoing reposts (Alt+U to stop)");
        console.log("📋 This script will:");
        console.log("   1. Click green repost buttons");
        console.log("   2. Wait for dropdown menu");
        console.log('   3. Click "Undo repost" option');
        scrollAndProcess();
      } else {
        console.log("⏹️ Stopped auto-undoing reposts");
      }
    }
  });

  // Manual test function - Alt+T to test on current page
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "t") {
      console.log("🧪 Testing on current page...");
      clickUndoRepost();
    }
  });

  console.log("🎯 Script loaded!");
  console.log("   Alt+U = Start/Stop automatic mode");
  console.log("   Alt+T = Test on current page only");
})();
