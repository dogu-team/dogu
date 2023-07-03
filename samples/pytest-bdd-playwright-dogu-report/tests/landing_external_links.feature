Feature: Landing external links
    a user should be able to land on the correct page when clicking on an external link

    Scenario: Go to the documentation page
        Given I am on the landing page
        When I click on the documentation link
        Then I should be on the documentation page

    Scenario: Go to the community page
        Given I am on the landing page
        When I click on the community link
        Then I should be on the community page

    Scenario: Go to the Github page
        Given I am on the landing page
        When I click on the Github link
        Then I should be on the Github page
