# SEC-04 — Eliminar sinks XSS (`innerHTML` con datos de usuario)

## Diagnóstico
46 usos de `.innerHTML` en el PMS. Varios interpolan nombres de trabajadores, contratas o mensajes de toast sin escapar.

## Regla
- Datos de usuario → `textContent` o `createElement`
- Markup estático de confianza → plantillas sin interpolación dinámica, o sanitizer (DOMPurify) si es inevitable

## Antes (vulnerable) — aprox. L6471 / L6663 / L7793

```js
card.innerHTML = `<p class="font-black">${asig.trabajador}</p>`;
dniBadge.innerHTML = `<span>Editando datos de ${asig.trabajador}</span>`;
toast.innerHTML = `<span>${message}</span>`;
```

## Después (seguro)

```js
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// Nombre de trabajador
const nameEl = el('p', 'font-black text-slate-900 truncate leading-tight', asig.trabajador);
card.replaceChildren(nameEl);

// Badge edición
dniBadge.replaceChildren();
const span = el('span', 'text-blue-600 font-semibold flex items-center gap-1');
span.append(el('span', null, 'Editando datos de '), document.createTextNode(asig.trabajador));
dniBadge.append(span);

// Toast
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = String(message);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
```

## Checklist de barrido
Buscar y remediar cada:
- `.innerHTML\s*=`
- `insertAdjacentHTML`
- `document.write`
- template strings dentro de HTML con `${...}` de origen DB/form
