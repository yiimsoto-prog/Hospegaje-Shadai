# UI / A11Y — Contraste, temas, estados, ARIA

## Hallazgo: no hay modo oscuro
No implementar un “dark mode cosmétique” encima del caos actual. Primero:
1. Design tokens únicos (claro + oscuro) en CSS variables
2. Toggle `data-theme="light|dark"` en `<html>`
3. Respetar `prefers-color-scheme` como default

```css
:root, [data-theme="light"] {
  --bg: #f8fafc;
  --surface: #ffffff;
  --text: #0f172a;
  --text-muted: #475569; /* >= 4.5:1 sobre --surface */
  --border: #e2e8f0;
  --focus: #1d4ed8;
  --danger: #be123c;
}
[data-theme="dark"] {
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #f8fafc;
  --text-muted: #cbd5e1; /* no usar #94a3b8 sobre #1e293b para texto pequeño */
  --border: #334155;
  --focus: #93c5fd;
  --danger: #fb7185;
}
```

## Contraste tablas (remediar theads)

```html
<!-- ANTES: text-slate-400 sobre bg-slate-50 (falla AA) -->
<thead class="bg-slate-50 text-slate-400 ...">

<!-- DESPUÉS -->
<thead class="bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wide">
```

Equivalente con tokens:

```html
<thead style="background:var(--surface);color:var(--text-muted)">
```

## Check-out: quitar bloqueo de zoom

```html
<!-- ANTES -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- DESPUÉS -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Modal de auth accesible (reemplazo mínimo)

```html
<div id="modalStaffAuth" role="dialog" aria-modal="true" aria-labelledby="staffAuthModalTitle" class="hidden">
  <h2 id="staffAuthModalTitle">Panel Administrativo PMS</h2>
  <p id="staffAuthModalDesc">Acceso reservado para personal autorizado.</p>
  <label for="staffAuthInput">PIN de seguridad</label>
  <input id="staffAuthInput" type="password" autocomplete="current-password"
         aria-invalid="false" aria-describedby="staffAuthErrorText" />
  <p id="staffAuthErrorText" role="alert" class="hidden">PIN incorrecto</p>
  <button type="button" id="btnStaffAuthSubmit">Ingresar</button>
  <button type="button" id="btnStaffAuthCancel">Cancelar</button>
</div>
```

```js
function openStaffAuthModal() {
  const modal = document.getElementById('modalStaffAuth');
  modal.classList.remove('hidden');
  const previouslyFocused = document.activeElement;
  modal._restoreFocus = previouslyFocused;
  document.getElementById('staffAuthInput').focus();
  // implementar focus trap (Tab cicla dentro del dialog)
}
function closeModal() {
  const modal = document.getElementById('modalStaffAuth');
  modal.classList.add('hidden');
  modal._restoreFocus?.focus();
}
```

## Estados disabled / loading

```js
async function withButtonBusy(btn, work) {
  const prev = btn.disabled;
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  try { return await work(); }
  finally {
    btn.disabled = prev;
    btn.removeAttribute('aria-busy');
  }
}
```

## Focus visible (no solo `outline-none`)

```css
:focus { outline: none; }
:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
```

## Eliminar de la UI (ya)
- Tarjeta que imprime PINs
- Badge Wi‑Fi con password en portal público si el QR basta (o mostrar solo tras check-in autenticado del huésped de esa habitación)
