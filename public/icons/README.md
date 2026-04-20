# Icons

Drop any `.svg` file into this folder — this folder IS the icon library, there is no registration step.

Reference by filename in SCSS via the mixin: `@include m.svg(arrow-right);` which sizes and colors it.

Use `currentColor` inside your SVGs so icons automatically reskin with the surrounding text color.

`$theme-icon-path` (defined in `scss/theme/_icons.scss`) points at this folder.
