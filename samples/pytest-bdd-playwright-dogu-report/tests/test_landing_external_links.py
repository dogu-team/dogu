from pytest_bdd import given, scenarios, when, then
from playwright.sync_api import Page, expect


scenarios("landing_external_links.feature")


@given("I am on the landing page")
def go_to_landing(page: Page):
    page.goto("https://dogutech.io")


@when("I click on the documentation link", target_fixture="docs_page")
def click_documentation_link(page: Page):
    with page.context.expect_page() as new_page_info:
        page.click(
            'xpath=//*[@id="__next"]/section/section/header/div/div/div[1]/div/div/span[3]/a'
        )
    return new_page_info.value


@then("I should be on the documentation page")
def on_documentation_page(docs_page: Page):
    expect(docs_page).to_have_url("https://docs.dogutech.io/")


@when("I click on the community link", target_fixture="community_page")
def click_community_link(page: Page):
    with page.context.expect_page() as new_page_info:
        page.click(
            'xpath=//*[@id="__next"]/section/section/header/div/div/div[1]/div/div/span[4]/a'
        )
    return new_page_info.value


@then("I should be on the community page")
def on_community_page(community_page: Page):
    expect(community_page).to_have_url("https://docs.dogutech.io/community/discord")


@when("I click on the Github link", target_fixture="github_page")
def click_github_link(page: Page):
    with page.context.expect_page() as new_page_info:
        page.click(
            'xpath=//*[@href="https://github.com/dogu-team/dogu"]'
        )
    return new_page_info.value


@then("I should be on the Github page")
def on_github_page(github_page: Page):
    expect(github_page).to_have_url("https://github.com/dogu-team/dogu")
