/**
 * biosfera-cart.js
 * Utilidad compartida para el carrito de Biosfera Bahía Turquesa.
 * Persiste en localStorage con la clave 'biosfera_cart'.
 */

const BiosferaCart = (function () {
    'use strict';

    const KEY = 'biosfera_cart';

    function getAll() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function save(items) {
        localStorage.setItem(KEY, JSON.stringify(items));
        _notify();
    }

    function add(item) {
        const items = getAll();
        // Si ya existe la misma experiencia en la misma fecha, reemplaza
        const idx = items.findIndex(i =>
            i.experienceId === item.experienceId && i.date === item.date
        );
        if (idx >= 0) {
            items[idx] = { ...items[idx], ...item, cartId: items[idx].cartId };
        } else {
            item.cartId = Date.now().toString(36) + Math.random().toString(36).slice(2);
            items.push(item);
        }
        save(items);
        return item;
    }

    function remove(cartId) {
        const items = getAll().filter(i => i.cartId !== cartId);
        save(items);
    }

    function clear() {
        localStorage.removeItem(KEY);
        _notify();
    }

    function count() {
        return getAll().length;
    }

    function total() {
        return getAll().reduce((sum, i) => sum + (i.total || 0), 0);
    }

    // Actualiza todos los badges del carrito en el DOM
    function updateBadges() {
        const n = count();
        document.querySelectorAll('.biosfera-cart-badge').forEach(el => {
            el.textContent = n;
            el.style.display = n > 0 ? 'flex' : 'none';
        });
    }

    // Dispara un custom event para que cualquier componente pueda escuchar
    function _notify() {
        window.dispatchEvent(new CustomEvent('biosfera:cart:updated', { detail: { count: count(), total: total() } }));
    }

    // Auto-update badges when DOM is ready
    document.addEventListener('DOMContentLoaded', updateBadges);
    window.addEventListener('biosfera:cart:updated', updateBadges);

    return { getAll, add, remove, clear, count, total, updateBadges };
})();
