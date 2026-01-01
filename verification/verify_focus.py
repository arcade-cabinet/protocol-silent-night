from playwright.sync_api import sync_playwright

def verify_focus(page):
    page.goto("http://localhost:3000")

    # Wait for the start screen to load
    page.wait_for_selector("text=Protocol: Silent Night")

    # Get the Santa class card - use exact property or first() if needed, but here we can be more specific
    # The error said name="Santa" matched "MECHA-SANTA..." and "SANTA'S WORKSHOP"
    # Let's target the card specifically via class or text inside it

    # The card title has "MECHA-SANTA", let's use that.
    # Or just use the first button that looks like a card.

    # Using CSS selector for classCard to be safe and specific about the element we modified
    # We can't know the hashed class name easily, but we know the structure.

    # Let's try to get by text "MECHA-SANTA" and find the parent button
    santa_text = page.get_by_text("MECHA-SANTA")
    santa_card = page.locator("button").filter(has=santa_text).first

    # Focus the card
    santa_card.focus()

    # Take a screenshot
    page.screenshot(path="verification/focus_state.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_focus(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
