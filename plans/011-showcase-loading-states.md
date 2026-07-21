# Plan 011: Showcase Loading States and Image Transition (UX)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1928924..HEAD -- apps/web/src/routes/\(app\)/_home/showcase/index.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `1928924`, 2026-07-21

## Why this matters

The showcase page presents real products built with Tanship. In production environments, screenshots loaded from Cloudflare R2 can take a few hundred milliseconds to fully load. Currently, when the page renders, the image containers remain empty and then suddenly flash into view as each image finishes loading, resulting in an unpolished user experience. Implementing a loading state with a smooth transition (opacity fade-in) eliminates this raw behavior and aligns with high-end frontend design standards.

## Current state

- Relevant files:
    - `apps/web/src/routes/(app)/_home/showcase/index.tsx` — manages the public showcase listing page.

- Existing card image rendering code in `ShowcaseCard`:
    ```tsx
    {
    	/* Image */
    }
    <div className="col-span-2 aspect-[14/9] overflow-hidden rounded-xl bg-card">
    	{imageUrl ? (
    		<img
    			src={imageUrl}
    			alt={item.projectName}
    			className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
    		/>
    	) : (
    		<div className="flex h-full w-full items-center justify-center bg-secondary">
    			<HugeiconsIcon
    				icon={GlobeIcon}
    				className="size-10 text-muted-foreground/20"
    			/>
    		</div>
    	)}
    </div>;
    ```

## Commands you will need

| Purpose   | Command                 | Expected on success |
| --------- | ----------------------- | ------------------- |
| Typecheck | `pnpm -F web run build` | exit 0, no errors   |

## Scope

**In scope**:

- `apps/web/src/routes/(app)/_home/showcase/index.tsx`

**Out of scope**:

- Direct edits to the Showcase submission logic or database structure.

## Git workflow

- Branch: `advisor/011-showcase-loading-states`
- Commit message: standard lowercase git message style (e.g. `improve showcase page image loading states with smooth transitions`)

## Steps

### Step 1: Implement Image State tracking in `ShowcaseCard`

Introduce a React `useState` state in the `ShowcaseCard` component to track if the image has finished loading:

- `const [isLoaded, setIsLoaded] = useState(false);`

### Step 2: Update Image Element

Wrap the image element and attach the `onLoad` callback:

```tsx
<div className="relative col-span-2 aspect-[14/9] overflow-hidden rounded-xl bg-card">
	{imageUrl && (
		<img
			src={imageUrl}
			alt={item.projectName}
			onLoad={() => setIsLoaded(true)}
			className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${
				isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
			}`}
		/>
	)}

	{/* Loading Skeleton */}
	{imageUrl && !isLoaded && (
		<div className="absolute inset-0 bg-muted/20 animate-pulse" />
	)}

	{!imageUrl && (
		<div className="flex h-full w-full items-center justify-center bg-secondary">
			<HugeiconsIcon
				icon={GlobeIcon}
				className="size-10 text-muted-foreground/20"
			/>
		</div>
	)}
</div>
```

### Step 3: Run Typechecks and build checks

Run the build script to ensure no typescript issues in `apps/web`.

**Verify**: `pnpm -F web run build` exits 0.

## Done criteria

- [ ] `pnpm -F web run build` exits 0.
- [ ] ShowcaseCard displays a smooth skeleton animation while the screenshot loads.
- [ ] Loaded images fade in with a 500ms transition instead of snapping into view.
