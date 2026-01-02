import { test, expect } from '@playwright/test'

test.describe('Template Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  // Helper to get the Templates dropdown button in the header (not the sidebar tab)
  const getTemplatesDropdownButton = (page: import('@playwright/test').Page) =>
    page.locator('header').getByRole('button', { name: 'Templates' })

  test('loads with default demo template', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check the template name is visible
    const templateNameInput = page.locator('input[placeholder="Template name"]')
    await expect(templateNameInput).toBeVisible()
    
    // The default template should be loaded
    const nameValue = await templateNameInput.inputValue()
    expect(nameValue.length).toBeGreaterThan(0)
  })

  test('can edit template name', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const templateNameInput = page.locator('input[placeholder="Template name"]')
    await templateNameInput.click()
    await templateNameInput.fill('My Custom Template')
    
    await expect(templateNameInput).toHaveValue('My Custom Template')
    
    // Check dirty indicator appears
    const dirtyDot = page.locator('span[aria-label="Unsaved changes"]')
    await expect(dirtyDot).toBeVisible()
  })

  test('can save template', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Edit the template name
    const templateNameInput = page.locator('input[placeholder="Template name"]')
    await templateNameInput.fill('Saved Template')

    // Click save button
    const saveButton = page.locator('button:has-text("Save")')
    await saveButton.click()

    // Dirty indicator should disappear
    const dirtyDot = page.locator('span[aria-label="Unsaved changes"]')
    await expect(dirtyDot).not.toBeVisible()
  })

  test('can create new template', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open templates dropdown (header button, not sidebar tab)
    const templatesButton = getTemplatesDropdownButton(page)
    await templatesButton.click()

    // Click "New template..."
    await page.locator('button:has-text("New template…")').click()

    // Should have a new template with "Untitled Template" name
    const templateNameInput = page.locator('input[placeholder="Template name"]')
    const nameValue = await templateNameInput.inputValue()
    expect(nameValue).toContain('Untitled Template')
  })

  test('can switch between templates', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Get the initial template name
    const templateNameInput = page.locator('input[placeholder="Template name"]')
    const initialName = await templateNameInput.inputValue()

    // Create a new template first (header button, not sidebar tab)
    const templatesButton = getTemplatesDropdownButton(page)
    await templatesButton.click()
    await page.locator('button:has-text("New template…")').click()
    
    // Wait for the new template to be selected
    await page.waitForTimeout(500)
    
    // Get the new template name
    const newName = await templateNameInput.inputValue()
    expect(newName).toContain('Untitled Template')

    // Switch back to the original template
    await templatesButton.click()
    
    // Click on the first template in the list (original)
    const templateButtons = page.locator('button').filter({ hasText: initialName })
    if (await templateButtons.count() > 0) {
      await templateButtons.first().click()
      
      // Verify we switched back
      await page.waitForTimeout(500)
      const currentName = await templateNameInput.inputValue()
      expect(currentName).toBe(initialName)
    }
  })

  test('can delete template', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // First create a second template so we can delete one (header button, not sidebar tab)
    const templatesButton = getTemplatesDropdownButton(page)
    await templatesButton.click()
    await page.locator('button:has-text("New template…")').click()
    await page.waitForTimeout(500)

    // Click delete button
    const deleteButton = page.locator('button[aria-label="Delete template"]')
    await deleteButton.click()

    // Confirm deletion in modal
    const confirmButton = page.locator('button:has-text("Delete")').last()
    await confirmButton.click()

    // Should switch to another template after deletion
    await page.waitForTimeout(500)
    const templateNameInput = page.locator('input[placeholder="Template name"]')
    const nameValue = await templateNameInput.inputValue()
    expect(nameValue.length).toBeGreaterThan(0)
  })

  test('persists template across page reload', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Edit and save the template
    const templateNameInput = page.locator('input[placeholder="Template name"]')
    await templateNameInput.fill('Persistent Template')
    
    const saveButton = page.locator('button:has-text("Save")')
    await saveButton.click()
    
    await page.waitForTimeout(500)

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify the template name persisted
    const reloadedNameInput = page.locator('input[placeholder="Template name"]')
    await expect(reloadedNameInput).toHaveValue('Persistent Template')
  })

  test('can duplicate current template', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Set a specific name
    const templateNameInput = page.locator('input[placeholder="Template name"]')
    await templateNameInput.fill('Original Template')
    
    // Save it
    const saveButton = page.locator('button:has-text("Save")')
    await saveButton.click()
    await page.waitForTimeout(300)

    // Open export menu and duplicate
    const exportButton = page.locator('button:has-text("Export")').first()
    await exportButton.click()
    
    await page.locator('button:has-text("Duplicate current template")').click()
    await page.waitForTimeout(500)

    // Should now have "Copy of Original Template"
    const newName = await templateNameInput.inputValue()
    expect(newName).toBe('Copy of Original Template')
  })

  test('shows dirty indicator when template has unsaved changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Initially should not show dirty indicator
    const dirtyDot = page.locator('span[aria-label="Unsaved changes"]')
    await expect(dirtyDot).not.toBeVisible()

    // Make a change
    const templateNameInput = page.locator('input[placeholder="Template name"]')
    await templateNameInput.fill('Modified Template')

    // Dirty indicator should appear
    await expect(dirtyDot).toBeVisible()

    // Save the template
    const saveButton = page.locator('button:has-text("Save")')
    await saveButton.click()

    // Dirty indicator should disappear after save
    await expect(dirtyDot).not.toBeVisible()
  })
})
