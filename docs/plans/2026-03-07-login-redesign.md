# Login Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the student login page title to "内蒙古师范大学" and redesign the page with a stronger campus-branded layout while preserving existing login behavior.

**Architecture:** Keep all authentication and redirect logic in `src/pages/LoginPage.vue` unchanged in behavior. Rework only the page structure and add a small set of login-specific styles in `src/style.css` so the change stays isolated and reviewable.

**Tech Stack:** Vue 3, Vue Router, TypeScript, Tailwind CSS v4, Vite

---

### Task 1: Record the design intent

**Files:**
- Create: `docs/plans/2026-03-07-login-redesign-design.md`

**Step 1: Write the design note**

Document the issue goal, scope, chosen visual direction, constraints, and verification commands.

**Step 2: Verify the file exists**

Run: `sed -n '1,200p' docs/plans/2026-03-07-login-redesign-design.md`
Expected: the design note renders with the title and scope.

### Task 2: Redesign the login page

**Files:**
- Modify: `src/pages/LoginPage.vue`
- Modify: `src/style.css`

**Step 1: Update the page content structure**

- Replace the generic title area with a campus-branded hero.
- Set the main heading to `内蒙古师范大学`.
- Preserve form state, submit handler, and error display.

**Step 2: Add scoped visual classes**

- Add login-specific layout, surface, metric, and decorative classes.
- Keep the new styles independent from shared shell/page styles.

**Step 3: Verify the diff**

Run: `git diff -- src/pages/LoginPage.vue src/style.css`
Expected: only login page structure and related styles change.

### Task 3: Validate the change

**Files:**
- No file changes required

**Step 1: Run type check**

Run: `pnpm run check`
Expected: exit code 0

**Step 2: Run production build**

Run: `pnpm run build`
Expected: exit code 0
