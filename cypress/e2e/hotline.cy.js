describe('Test Hotline phone number', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  it('Verify App Hotline', () => {
    cy.get('body').find('[data-e2e="hotline-app"]').contains('Hotline App')
    cy.get('body').find('[data-e2e="hotline-app"]').contains('0800 7540001')
    cy.get('body').find('[data-e2e="hotline-app"]').contains('+49 30 498 75401')
  })
})
