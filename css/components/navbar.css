/* ============================================
   Rewind Lab - Navbar Component
   ============================================ */

.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    z-index: 1000;
    box-shadow: var(--shadow-sm);
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-lg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.nav-logo {
    width: 36px;
    height: 36px;
}

.nav-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.02em;
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    list-style: none;
}

.nav-link {
    color: var(--color-text-light);
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    transition: color var(--transition-fast);
}

.nav-link:hover,
.nav-link.active {
    color: var(--color-primary);
}

.nav-btn {
    padding: 8px 16px;
    font-size: 14px;
    border-radius: var(--radius-md);
    text-decoration: none;
    font-weight: 600;
    transition: all var(--transition-fast);
}

.nav-btn-primary {
    background: var(--color-primary);
    color: #fff;
}

.nav-btn-primary:hover {
    background: var(--color-primary-dark);
}

/* 汉堡菜单按钮（移动端） */
.nav-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    padding: var(--space-sm);
    background: none;
    border: none;
    cursor: pointer;
}

.hamburger-line {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--color-text);
    transition: all var(--transition-normal);
    border-radius: 1px;
}

/* 移动端样式 */
@media (max-width: 768px) {
    .nav-container {
        padding: 0 var(--space-md);
    }

    .nav-toggle {
        display: flex;
    }

    .nav-menu {
        position: fixed;
        top: 64px;
        left: 0;
        right: 0;
        background: var(--color-background);
        flex-direction: column;
        padding: var(--space-lg);
        border-bottom: 1px solid var(--color-border);
        box-shadow: var(--shadow-lg);
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all var(--transition-normal);
    }

    .nav-menu.active {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
    }

    .nav-menu li {
        width: 100%;
    }

    .nav-link {
        display: block;
        padding: var(--space-md) 0;
        font-size: 16px;
        border-bottom: 1px solid var(--color-border);
    }

    .nav-link:last-child {
        border-bottom: none;
    }

    .nav-btn {
        width: 100%;
        text-align: center;
        margin-top: var(--space-sm);
    }

    /* 汉堡按钮动画 */
    .nav-toggle.active .hamburger-line:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .nav-toggle.active .hamburger-line:nth-child(2) {
        opacity: 0;
    }

    .nav-toggle.active .hamburger-line:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
}