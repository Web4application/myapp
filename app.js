import logging
import common
from autotest_lib.client.bin import test
from autotest_lib.client.common_lib import error
from autotest_lib.client.cros import httpd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService
import shutil
import csv
import json
import os
import time
import zipfile
from datetime import datetime
from collections import defaultdict
import matplotlib.pyplot as plt


class desktopui_UrlFetchMultiBrowser(test.test):
    """Test fetching repo URL and cookies across multiple browsers with logs & graphs."""
    version = 3

    def initialize(self, browser="chrome", live=True):
        """
        Initialize the test.
        @param browser: "chrome", "firefox", or "edge".
        @param live: True = access external site, False = local server.
        """
        self._live = live
        self._browser = browser.lower()
        super(desktopui_UrlFetchMultiBrowser, self).initialize()

        # Repo test URL (can be replaced by user input)
        if self._live:
            self._test_url = "https://github.com/Web4application/ChatGPT-5"
            self._expected_title = "GitHub"
            self._domain = "github.com"
        else:
            self._test_url = "http://localhost:8000/hello.html"
            self._expected_title = "Hello World"
            self._domain = "localhost"
            self._testServer = httpd.HTTPListener(8000, docroot=self.bindir)
            self._testServer.run()

        # Log files
        self._json_file = "repo_ui_results.json"
        self._csv_file = "repo_ui_results.csv"
        if not os.path.exists(self._csv_file):
            with open(self._csv_file, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["timestamp", "browser", "title", "cookies"])

    def cleanup(self):
        """Stop local HTTP server if running."""
        if not self._live and hasattr(self, "_testServer"):
            self._testServer.stop()
        super(desktopui_UrlFetchMultiBrowser, self).cleanup()

    def _get_driver(self):
        """Return the right Selenium WebDriver based on self._browser."""
        if self._browser == "chrome":
            if shutil.which("chromedriver") is None:
                raise error.TestError("ChromeDriver not found in PATH")
            return webdriver.Chrome(service=ChromeService())
        elif self._browser == "firefox":
            if shutil.which("geckodriver") is None:
                raise error.TestError("GeckoDriver not found in PATH")
            return webdriver.Firefox(service=FirefoxService())
        elif self._browser == "edge":
            if shutil.which("msedgedriver") is None:
                raise error.TestError("EdgeDriver not found in PATH")
            return webdriver.Edge(service=EdgeService())
        else:
            raise error.TestError("Unsupported browser: %s" % self._browser)

    def _save_result(self, title, cookie_found):
        """Save test result to JSON and CSV logs."""
        ts = datetime.now().isoformat()
        result = {
            "timestamp": ts,
            "browser": self._browser,
            "title": title,
            "cookies": "Found" if cookie_found else "None",
        }

        # Append JSON
        with open(self._json_file, "a") as f:
            f.write(json.dumps(result) + "\n")

        # Append CSV
        with open(self._csv_file, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([ts, self._browser, title, result["cookies"]])

        logging.info("✅ Result saved: %s", result)

    def run_once(self, repo_url=None, check_cookies=True):
        """Run the test with the chosen browser."""
        if repo_url:
            self._test_url = repo_url

        driver = self._get_driver()
        try:
            driver.delete_all_cookies()
            driver.get(self._test_url)

            logging.info("Expected title: %s. Got: %s",
                         self._expected_title, driver.title)

            # Title check
            if self._expected_title not in driver.title:
                raise error.TestError("Title mismatch: got %s" % driver.title)

            # Cookie check
            cookie_found = any(
                cookie for cookie in driver.get_cookies()
                if self._domain in cookie["domain"]
            ) if check_cookies else True

            if check_cookies and not cookie_found:
                raise error.TestError("Expected cookie for %s" % self._test_url)

            # Save run results
            self._save_result(driver.title, cookie_found)

        finally:
            driver.quit()

        # Auto-generate graphs + zip
        self._export_graphs()

    def _export_graphs(self):
        """Generate 4 graphs + zip them (with logs)."""
        data_titles = defaultdict(list)
        data_cookies = defaultdict(list)

        # Read CSV data
        with open(self._csv_file, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ts = datetime.fromisoformat(row["timestamp"])
                browser = row["browser"]
                title = row["title"]
                cookies = row["cookies"]
                data_titles[browser].append((ts, title))
                data_cookies[browser].append((ts, 1 if cookies == "Found" else 0))

        ts_label = time.strftime("%Y%m%d-%H%M%S")

        browser_styles = {
            "chrome": {"color": "red", "marker": "o"},
            "firefox": {"color": "orange", "marker": "s"},
            "edge": {"color": "blue", "marker": "D"},
        }

        outputs = []

        # --- 1. Title history ---
        plt.figure(figsize=(12, 6))
        for browser, entries in data_titles.items():
            entries.sort(key=lambda x: x[0])
            timestamps = [e[0] for e in entries]
            titles = [e[1] for e in entries]
            style = browser_styles.get(browser, {"color": "black", "marker": "x"})
            plt.plot(timestamps, titles, label=browser.capitalize(),
                     color=style["color"], marker=style["marker"], linewidth=2)
            for i in range(1, len(entries)):
                if entries[i][1] != entries[i-1][1]:
                    plt.annotate(f"→ {entries[i][1][:15]}...",
                                 (timestamps[i], titles[i]),
                                 textcoords="offset points", xytext=(0, 10),
                                 ha="center", fontsize=8, color=style["color"],
                                 arrowprops=dict(arrowstyle="->", color=style["color"]))
        plt.title("Repository UI Title History")
        plt.xlabel("Timestamp"); plt.ylabel("Page Title")
        plt.legend(); plt.grid(True, linestyle="--", alpha=0.7)
        plt.tight_layout()
        fname1 = f"repo_ui_title_history_{ts_label}.png"
        plt.savefig(fname1); outputs.append(fname1)

        # --- 2. Cookie history ---
        plt.figure(figsize=(12, 6))
        for browser, entries in data_cookies.items():
            entries.sort(key=lambda x: x[0])
            style = browser_styles.get(browser, {"color": "black", "marker": "x"})
            plt.plot([e[0] for e in entries], [e[1] for e in entries],
                     label=browser.capitalize(),
                     color=style["color"], marker=style["marker"],
                     linestyle="--", linewidth=2)
        plt.title("Cookie Presence Over Time")
        plt.xlabel("Timestamp"); plt.ylabel("Cookies (1=Found, 0=None)")
        plt.yticks([0, 1], ["None", "Found"])
        plt.legend(); plt.grid(True, linestyle="--", alpha=0.7)
        plt.tight_layout()
        fname2 = f"repo_ui_cookie_history_{ts_label}.png"
        plt.savefig(fname2); outputs.append(fname2)

        # --- 3. Dashboard (stacked) ---
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)
        for browser, entries in data_titles.items():
            entries.sort(key=lambda x: x[0])
            ax1.plot([e[0] for e in entries], [e[1] for e in entries],
                     label=browser.capitalize(),
                     color=browser_styles[browser]["color"],
                     marker=browser_styles[browser]["marker"])
        ax1.set_title("Repo Title History"); ax1.set_ylabel("Page Title")
        ax1.legend(); ax1.grid(True, linestyle="--", alpha=0.7)

        for browser, entries in data_cookies.items():
            entries.sort(key=lambda x: x[0])
            ax2.plot([e[0] for e in entries], [e[1] for e in entries],
                     label=browser.capitalize(),
                     color=browser_styles[browser]["color"],
                     marker=browser_styles[browser]["marker"], linestyle="--")
        ax2.set_title("Repo Cookie Presence"); ax2.set_ylabel("Cookies")
        ax2.set_yticks([0, 1]); ax2.set_yticklabels(["None", "Found"])
        ax2.legend(); ax2.grid(True, linestyle="--", alpha=0.7)
        plt.xlabel("Timestamp"); plt.tight_layout()
        fname3 = f"repo_ui_dashboard_{ts_label}.png"
        plt.savefig(fname3); outputs.append(fname3)

        # --- 4. Overlay (clean) ---
        fig, ax1 = plt.subplots(figsize=(14, 6))
        for browser, entries in data_titles.items():
            entries.sort(key=lambda x: x[0])
            ax1.plot([e[0] for e in entries], [e[1] for e in entries],
                     label=f"{browser.capitalize()} Title",
                     color=browser_styles[browser]["color"],
                     marker=browser_styles[browser]["marker"])
        ax1.set_ylabel("Page Title", color="black")
        ax1.tick_params(axis="y", labelcolor="black")

        ax2 = ax1.twinx()
        for browser, entries in data_cookies.items():
            entries.sort(key=lambda x: x[0])
            ax2.plot([e[0] for e in entries], [e[1] for e in entries],
                     label=f"{browser.capitalize()} Cookies",
                     color=browser_styles[browser]["color"],
                     marker=browser_styles[browser]["marker"],
                     linestyle="--", alpha=0.7)
        ax2.set_ylabel("Cookies (1=Found, 0=None)")
        ax2.set_yticks([0, 1]); ax2.set_yticklabels(["None", "Found"])
        lines, labels = ax1.get_legend_handles_labels()
        lines2, labels2 = ax2.get_legend_handles_labels()
        ax1.legend(lines + lines2, labels + labels2, loc="upper left")
        plt.title("Repo UI Timeline Overlay (Titles + Cookies)")
        plt.xlabel("Timestamp"); plt.grid(True, linestyle="--", alpha=0.7)
        plt.tight_layout()
        fname4 = f"repo_ui_overlay_{ts_label}.png"
        plt.savefig(fname4); outputs.append(fname4)

        # --- 5. Zip results ---
        zip_name = f"repo_ui_results_{ts_label}.zip"
        with zipfile.ZipFile(zip_name, "w", zipfile.ZIP_DEFLATED) as zipf:
            # Add graphs
            for fname in outputs:
                if os.path.exists(fname):
                    zipf.write(fname)
            # Add logs
            if os.path.exists(self._csv_file):
                zipf.write(self._csv_file)
            if os.path.exists(self._json_file):
                zipf.write(self._json_file)
        logging.info("📦 All results zipped as %s", zip_name)
