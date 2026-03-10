# LogoLoader Everywhere Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace every ad-hoc loading spinner/text across the real app with the `LogoLoader` component.

**Architecture:** Pure find/replace — add one import line per file, swap the loading JSX. No state changes, no logic changes. Fullscreen page loaders use `<LogoLoader fullscreen />`, modal/inline loaders use `<LogoLoader size="sm" />` or `size="md"` inside their existing containers.

**Tech Stack:** React JSX, existing `LogoLoader` component at `src/components/LogoLoader.jsx`.

---

### Task 1: Fullscreen page loaders — home-dashboard + rewards-catalog

**Files:**
- Modify: `src/pages/home-dashboard/index.jsx`
- Modify: `src/pages/rewards-catalog/index.jsx`

Both files have identical loading patterns: a `min-h-screen` div with centered "Загрузка..." text.

**Step 1: Edit `src/pages/home-dashboard/index.jsx`**

Add import after the last import line:
```jsx
import LogoLoader from '../../components/LogoLoader';
```

Replace the loading block:
```jsx
// OLD
if (isLoading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    </div>
  );
}
```
```jsx
// NEW
if (isLoading) {
  return <LogoLoader fullscreen />;
}
```

**Step 2: Edit `src/pages/rewards-catalog/index.jsx`**

Add import after the last import line:
```jsx
import LogoLoader from '../../components/LogoLoader';
```

Replace the loading block (identical pattern to home-dashboard):
```jsx
// OLD
if (isLoading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    </div>
  );
}
```
```jsx
// NEW
if (isLoading) {
  return <LogoLoader fullscreen />;
}
```

**Step 3: Commit**
```bash
git add src/pages/home-dashboard/index.jsx src/pages/rewards-catalog/index.jsx
git commit -m "feat: use LogoLoader in home-dashboard and rewards-catalog"
```

---

### Task 2: User profile modal loader

**Files:**
- Modify: `src/pages/user-profile-management/index.jsx`

This loading state lives inside a `ModalOverlay`, so we keep the modal wrapper and replace only the inner content with `size="md"`.

**Step 1: Add import**

After the last import line, add:
```jsx
import LogoLoader from '../../components/LogoLoader';
```

**Step 2: Replace loading block**

```jsx
// OLD
if (isLoading) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-center p-6">
          <div className="text-muted-foreground">Загрузка...</div>
        </div>
      </div>
    </ModalOverlay>
  );
}
```
```jsx
// NEW
if (isLoading) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose}>
      <div className="flex items-center justify-center p-12">
        <LogoLoader size="md" />
      </div>
    </ModalOverlay>
  );
}
```

**Step 3: Commit**
```bash
git add src/pages/user-profile-management/index.jsx
git commit -m "feat: use LogoLoader in user-profile-management modal"
```

---

### Task 3: Admin full-return loaders — AdminDashboard + CustomersEditor + NewsBannerEditor + RewardsEditor + EventsEditor

**Files:**
- Modify: `src/pages/admin/AdminDashboard.jsx`
- Modify: `src/pages/admin/CustomersEditor.jsx`
- Modify: `src/pages/admin/NewsBannerEditor.jsx`
- Modify: `src/pages/admin/RewardsEditor.jsx`
- Modify: `src/pages/admin/EventsEditor.jsx`

**Step 1: Edit `src/pages/admin/AdminDashboard.jsx`**

Add import (after `import { adminApiRequest } from '../../utils/adminApiClient';`):
```jsx
import LogoLoader from '../../components/LogoLoader';
```

Replace loading block:
```jsx
// OLD
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Загрузка статистики...</p>
      </div>
    </div>
  );
}
```
```jsx
// NEW
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <LogoLoader size="sm" />
    </div>
  );
}
```

**Step 2: Edit `src/pages/admin/CustomersEditor.jsx`**

Add import (after `import { adminApiRequest } from '../../utils/adminApiClient';`):
```jsx
import LogoLoader from '../../components/LogoLoader';
```

Replace loading block:
```jsx
// OLD
if (loading && customers.length === 0) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка клиентов...</p>
        </div>
      </div>
    </div>
  );
}
```
```jsx
// NEW
if (loading && customers.length === 0) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LogoLoader size="sm" />
    </div>
  );
}
```

**Step 3: Edit `src/pages/admin/NewsBannerEditor.jsx`**

Add import (after `import { adminApiRequest } from '../../utils/adminApiClient';`):
```jsx
import LogoLoader from '../../components/LogoLoader';
```

Replace loading block:
```jsx
// OLD
if (loading) {
  return <div className="text-center p-8">Loading...</div>;
}
```
```jsx
// NEW
if (loading) {
  return (
    <div className="flex items-center justify-center p-8">
      <LogoLoader size="sm" />
    </div>
  );
}
```

**Step 4: Edit `src/pages/admin/RewardsEditor.jsx`**

Add import (after `import { adminApiRequest } from '../../utils/adminApiClient';`):
```jsx
import LogoLoader from '../../components/LogoLoader';
```

Replace loading block:
```jsx
// OLD
if (loading) {
  return <div className="text-center p-8">Loading...</div>;
}
```
```jsx
// NEW
if (loading) {
  return (
    <div className="flex items-center justify-center p-8">
      <LogoLoader size="sm" />
    </div>
  );
}
```

**Step 5: Edit `src/pages/admin/EventsEditor.jsx`**

Add import (after `import { adminApiRequest } from '../../utils/adminApiClient';`):
```jsx
import LogoLoader from '../../components/LogoLoader';
```

Replace loading block:
```jsx
// OLD
if (loading) {
  return <div className="text-center p-8">Loading...</div>;
}
```
```jsx
// NEW
if (loading) {
  return (
    <div className="flex items-center justify-center p-8">
      <LogoLoader size="sm" />
    </div>
  );
}
```

**Step 6: Commit**
```bash
git add src/pages/admin/AdminDashboard.jsx src/pages/admin/CustomersEditor.jsx src/pages/admin/NewsBannerEditor.jsx src/pages/admin/RewardsEditor.jsx src/pages/admin/EventsEditor.jsx
git commit -m "feat: use LogoLoader in admin dashboard and editors"
```

---

### Task 4: Conditional inline loaders — food-ordering-menu + MenuItemsEditor

**Files:**
- Modify: `src/pages/food-ordering-menu/index.jsx`
- Modify: `src/pages/admin/MenuItemsEditor.jsx`

These are ternary inline conditionals (not early returns) — replace only the truthy branch.

**Step 1: Edit `src/pages/food-ordering-menu/index.jsx`**

Add import (after `import { getApiUrl } from '../../config/api';`):
```jsx
import LogoLoader from '../../components/LogoLoader';
```

Replace the ternary truthy branch:
```jsx
// OLD
{isLoadingMenu ? (
  <div className="flex flex-col items-center justify-center py-12">
    <Icon name="Loader2" size={32} className="animate-spin text-accent mb-4" />
    <p className="text-muted-foreground">Загрузка меню...</p>
  </div>
) : (
```
```jsx
// NEW
{isLoadingMenu ? (
  <div className="flex items-center justify-center py-12">
    <LogoLoader size="sm" />
  </div>
) : (
```

**Step 2: Edit `src/pages/admin/MenuItemsEditor.jsx`**

Add import (after `import { adminApiRequest } from '../../utils/adminApiClient';`):
```jsx
import LogoLoader from '../../components/LogoLoader';
```

Replace the ternary truthy branch:
```jsx
// OLD
{loading ? (
  <div className="flex items-center justify-center py-12">
    <Icon name="Loader2" size={32} className="animate-spin text-primary" />
  </div>
) : (
```
```jsx
// NEW
{loading ? (
  <div className="flex items-center justify-center py-12">
    <LogoLoader size="sm" />
  </div>
) : (
```

**Step 3: Commit**
```bash
git add src/pages/food-ordering-menu/index.jsx src/pages/admin/MenuItemsEditor.jsx
git commit -m "feat: use LogoLoader in food menu and menu items editor"
```
