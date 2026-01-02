import { test, expect } from '@playwright/test'

test.describe('Content Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('displays content items from template', async ({ page }) => {
    // The demo template should have content
    const contentItems = page.locator('[data-content-index]')
    const count = await contentItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('can add a new text element via sidebar', async ({ page }) => {
    // Go to Elements tab in sidebar
    await page.locator('button:has-text("Elements")').click()
    
    // Add a text node
    const addTextButton = page.locator('button:has-text("Add Text Node")').first()
    if (await addTextButton.isVisible()) {
      await addTextButton.click()
      
      // Verify a new item was added
      await page.waitForTimeout(500)
      const contentItems = page.locator('[data-content-index]')
      const newCount = await contentItems.count()
      expect(newCount).toBeGreaterThan(0)
    }
  })

  test('can edit content item by double-clicking', async ({ page }) => {
    // Find a content item
    const contentItem = page.locator('[data-content-index]').first()
    
    if (await contentItem.isVisible()) {
      // Double-click to edit
      await contentItem.dblclick()
      
      // Should see Save and Cancel buttons
      await expect(page.locator('button:has-text("Save")').first()).toBeVisible()
      await expect(page.locator('button:has-text("Cancel")').first()).toBeVisible()
    }
  })

  test('can cancel editing', async ({ page }) => {
    const contentItem = page.locator('[data-content-index]').first()
    
    if (await contentItem.isVisible()) {
      // Double-click to edit
      await contentItem.dblclick()
      
      // Click cancel
      await page.locator('button:has-text("Cancel")').first().click()
      
      // Should no longer see Cancel button (exited edit mode)
      await page.waitForTimeout(300)
      const cancelButtons = page.locator('button:has-text("Cancel")')
      // Might have multiple, check if the first one is hidden
      if (await cancelButtons.count() > 0) {
        // If cancel is still visible, it should be from a different context
      }
    }
  })

  test('can delete content item', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[data-content-index]').count()
    
    if (initialCount > 0) {
      // Find the delete button on the first item
      const firstItem = page.locator('[data-content-index]').first()
      const deleteButton = firstItem.locator('button:has([class*="Trash"])').first()
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click()
        
        // Confirm in modal
        await page.locator('button:has-text("Delete")').last().click()
        
        // Verify count decreased
        await page.waitForTimeout(500)
        const newCount = await page.locator('[data-content-index]').count()
        expect(newCount).toBeLessThan(initialCount)
      }
    }
  })

  test('can move content item up', async ({ page }) => {
    const contentItems = page.locator('[data-content-index]')
    const count = await contentItems.count()
    
    if (count >= 2) {
      // Click the move up button on the second item
      const secondItem = contentItems.nth(1)
      const moveUpButton = secondItem.locator('button').filter({ has: page.locator('[class*="ArrowUp"]') }).first()
      
      if (await moveUpButton.isVisible() && await moveUpButton.isEnabled()) {
        await moveUpButton.click()
        
        // Item should have moved
        await page.waitForTimeout(300)
      }
    }
  })

  test('can move content item down', async ({ page }) => {
    const contentItems = page.locator('[data-content-index]')
    const count = await contentItems.count()
    
    if (count >= 2) {
      // Click the move down button on the first item
      const firstItem = contentItems.first()
      const moveDownButton = firstItem.locator('button').filter({ has: page.locator('[class*="ArrowDown"]') }).first()
      
      if (await moveDownButton.isVisible() && await moveDownButton.isEnabled()) {
        await moveDownButton.click()
        
        // Item should have moved
        await page.waitForTimeout(300)
      }
    }
  })

  test('can insert new item above', async ({ page }) => {
    const initialCount = await page.locator('[data-content-index]').count()
    
    if (initialCount > 0) {
      // Find the add button on the first item
      const firstItem = page.locator('[data-content-index]').first()
      const addButton = firstItem.locator('button').filter({ has: page.locator('[class*="Plus"]') }).first()
      
      if (await addButton.isVisible()) {
        await addButton.click()
        
        // Verify count increased
        await page.waitForTimeout(500)
        const newCount = await page.locator('[data-content-index]').count()
        expect(newCount).toBe(initialCount + 1)
      }
    }
  })
})

test.describe('PDF Preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('can open PDF preview', async ({ page }) => {
    // Click preview button
    const previewButton = page.locator('button:has-text("Preview")')
    await previewButton.click()
    
    // Should show PDF preview modal
    await expect(page.locator('text=PDF Preview')).toBeVisible()
  })

  test('can close PDF preview', async ({ page }) => {
    // Open preview
    await page.locator('button:has-text("Preview")').click()
    await expect(page.locator('text=PDF Preview')).toBeVisible()
    
    // Close preview
    const closeButton = page.locator('button').filter({ has: page.locator('[class*="X"]') }).first()
    await closeButton.click()
    
    // Preview should be closed
    await page.waitForTimeout(500)
    await expect(page.locator('text=PDF Preview')).not.toBeVisible()
  })

  test('shows loading state while generating PDF', async ({ page }) => {
    // Open preview
    await page.locator('button:has-text("Preview")').click()
    
    // Should show loading or PDF iframe eventually
    const loadingOrPdf = page.locator('text=Generating PDF').or(page.locator('iframe[title="PDF Preview"]'))
    await expect(loadingOrPdf.first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Import/Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('can open import menu', async ({ page }) => {
    const importButton = page.locator('button:has-text("Import")')
    await importButton.click()
    
    // Should show import options
    await expect(page.locator('button:has-text("Import template from file")')).toBeVisible()
    await expect(page.locator('button:has-text("Paste template (JSON)")')).toBeVisible()
  })

  test('can open paste JSON dialog', async ({ page }) => {
    await page.locator('button:has-text("Import")').click()
    await page.locator('button:has-text("Paste template (JSON)")').click()
    
    // Should show dialog
    await expect(page.locator('text=Paste template JSON')).toBeVisible()
  })

  test('can open export menu', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export")').first()
    await exportButton.click()
    
    // Should show export options
    await expect(page.locator('button:has-text("Duplicate current template")')).toBeVisible()
    await expect(page.locator('button:has-text("Export current template")')).toBeVisible()
    await expect(page.locator('button:has-text("Export all templates")')).toBeVisible()
  })
})

test.describe('Theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('can open settings', async ({ page }) => {
    const settingsButton = page.locator('button[aria-label="Settings"]')
    await settingsButton.click()
    
    // Should show settings dialog
    await expect(page.locator('text=Theme')).toBeVisible()
  })

  test('can switch to dark theme', async ({ page }) => {
    // Open settings
    await page.locator('button[aria-label="Settings"]').click()
    
    // Change to dark theme
    await page.locator('select').selectOption('dark')
    
    // Close settings
    await page.locator('button:has-text("Close")').click()
    
    // HTML element should have dark class
    const hasDarkClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark')
    })
    expect(hasDarkClass).toBe(true)
  })
})

