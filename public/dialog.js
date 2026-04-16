/**
 * Custom dialog utility — replaces native alert() and confirm()
 * Usage:
 *   await Dialog.alert('Something went wrong')
 *   const yes = await Dialog.confirm('Are you sure?')
 */

const Dialog = (() => {
  function injectStyles() {
    if (document.getElementById('custom-dialog-styles')) return;
    const style = document.createElement('style');
    style.id = 'custom-dialog-styles';
    style.textContent = `
      .cdialog-backdrop {
        position: fixed;
        inset: 0;
        background: oklch(0 0 0 / 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: cdialog-fade-in 0.15s ease;
      }
      @keyframes cdialog-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .cdialog-box {
        background: var(--bg-primary, #fff);
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 14px;
        padding: 1.75rem 1.75rem 1.25rem;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 20px 40px oklch(0 0 0 / 0.18);
        animation: cdialog-slide-in 0.18s ease;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      @keyframes cdialog-slide-in {
        from { opacity: 0; transform: translateY(-12px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      .cdialog-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        flex-shrink: 0;
      }
      .cdialog-icon.info  { background: var(--primary-light, #e0f2fe); }
      .cdialog-icon.error { background: oklch(0.95 0.05 25); }
      .cdialog-icon.warn  { background: oklch(0.96 0.06 85); }
      .cdialog-header {
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
      }
      .cdialog-message {
        font-size: 0.95rem;
        color: var(--text-primary, #111);
        line-height: 1.55;
        flex: 1;
        padding-top: 0.1rem;
      }
      .cdialog-actions {
        display: flex;
        gap: 0.6rem;
        justify-content: flex-end;
      }
      .cdialog-btn {
        padding: 0.5rem 1.2rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid var(--border, #e5e7eb);
        transition: all 0.15s;
        background: var(--bg-secondary, #f9fafb);
        color: var(--text-primary, #111);
      }
      .cdialog-btn:hover {
        border-color: var(--border-hover, #d1d5db);
        background: var(--bg-tertiary, #f3f4f6);
      }
      .cdialog-btn.primary {
        background: var(--primary, #0ea5e9);
        color: #fff;
        border-color: var(--primary, #0ea5e9);
      }
      .cdialog-btn.primary:hover {
        background: var(--primary-hover, #0284c7);
        border-color: var(--primary-hover, #0284c7);
      }
      .cdialog-btn.danger {
        background: oklch(0.577 0.245 27.325);
        color: #fff;
        border-color: oklch(0.577 0.245 27.325);
      }
      .cdialog-btn.danger:hover {
        background: oklch(0.5 0.22 27.325);
        border-color: oklch(0.5 0.22 27.325);
      }
    `;
    document.head.appendChild(style);
  }

  function getIcon(type) {
    if (type === 'error') return { emoji: '✕', cls: 'error' };
    if (type === 'warn')  return { emoji: '!', cls: 'warn' };
    return { emoji: 'i', cls: 'info' };
  }

  function create(message, type = 'info') {
    injectStyles();
    const icon = getIcon(type);
    const backdrop = document.createElement('div');
    backdrop.className = 'cdialog-backdrop';
    backdrop.innerHTML = `
      <div class="cdialog-box" role="dialog" aria-modal="true">
        <div class="cdialog-header">
          <div class="cdialog-icon ${icon.cls}">${icon.emoji}</div>
          <p class="cdialog-message">${message}</p>
        </div>
        <div class="cdialog-actions"></div>
      </div>
    `;
    document.body.appendChild(backdrop);
    return backdrop;
  }

  /**
   * Show an alert overlay. Returns a Promise that resolves when OK is clicked.
   * @param {string} message
   * @param {'info'|'error'|'warn'} [type='info']
   */
  function alert(message, type = 'info') {
    return new Promise((resolve) => {
      const backdrop = create(message, type);
      const actions = backdrop.querySelector('.cdialog-actions');
      const ok = document.createElement('button');
      ok.className = 'cdialog-btn primary';
      ok.textContent = 'OK';
      actions.appendChild(ok);
      ok.focus();
      const close = () => { backdrop.remove(); resolve(); };
      ok.addEventListener('click', close);
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Enter' || e.key === 'Escape') { document.removeEventListener('keydown', esc); close(); }
      });
    });
  }

  /**
   * Show a confirm overlay. Returns a Promise<boolean>.
   * @param {string} message
   * @param {'info'|'warn'|'error'} [type='warn']
   * @param {string} [confirmLabel='Confirm']
   * @param {boolean} [danger=false]  — makes confirm button red
   */
  function confirm(message, type = 'warn', confirmLabel = 'Confirm', danger = false) {
    return new Promise((resolve) => {
      const backdrop = create(message, type);
      const actions = backdrop.querySelector('.cdialog-actions');

      const cancel = document.createElement('button');
      cancel.className = 'cdialog-btn';
      cancel.textContent = 'Cancel';

      const ok = document.createElement('button');
      ok.className = 'cdialog-btn ' + (danger ? 'danger' : 'primary');
      ok.textContent = confirmLabel;

      actions.appendChild(cancel);
      actions.appendChild(ok);
      ok.focus();

      const close = (val) => { backdrop.remove(); resolve(val); };
      ok.addEventListener('click', () => close(true));
      cancel.addEventListener('click', () => close(false));
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(false); });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { document.removeEventListener('keydown', esc); close(false); }
        if (e.key === 'Enter')  { document.removeEventListener('keydown', esc); close(true); }
      });
    });
  }

  return { alert, confirm };
})();

window.Dialog = Dialog;
