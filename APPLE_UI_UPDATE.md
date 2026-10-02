# KIBO EFFECT — Apple-style UI update

Applied across the main app, 1-DARS, 2-DARS, and dynamically loaded lesson/test modules.

## UI changes
- Cleaner Apple-style neutral palette for Day/Night.
- Reduced visual noise, gradients, and heavy shadows.
- Consistent spacing, typography, borders, radii, and controls.
- Full-width desktop layout for DARS pages and module viewer.
- Responsive mobile layouts with no horizontal overflow.
- Day/Night remains controlled from the main KIBO EFFECT menu.
- DARS/module-level theme controls are hidden to keep one global theme source.
- Test/vocabulary iframe modules receive the same visual system automatically.

## Functional fix
- Replaced the broken `addModuleMenuButton()` implementation in `dars/1.html` and `dars/2.html`.
- The previous implementation contained an invalid multiline single-quoted JavaScript string, which caused `SyntaxError: Invalid or unexpected token` and prevented `openModule()` from being defined.
- The replacement keeps module loading, back navigation, theme synchronization, and fullscreen behavior while removing the syntax error.

## Deploy
Upload the contents of the `kibo` folder to the same Vercel project. Keep the existing Vercel/Firebase environment variables unchanged.
