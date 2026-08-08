/* ============================================
   Rewind Lab - Navbar Module
   修复iPad分屏模式下click事件不触发问题
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');

    function toggleMenu() {
        if (navToggle) navToggle.classList.toggle('active');
        if (navMenu) navMenu.classList.toggle('active');
    }

    if (navToggle) {
        // 同时监听 click 和 touchstart，确保iPad分屏模式下也能触发
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
        navToggle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        }, {passive: false});
    }

    if (navMenu) {
        var links = navMenu.querySelectorAll('a');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function() {
                if (navToggle) navToggle.classList.remove('active');
                if (navMenu) navMenu.classList.remove('active');
            });
            links[i].addEventListener('touchend', function() {
                if (navToggle) navToggle.classList.remove('active');
                if (navMenu) navMenu.classList.remove('active');
            });
        }
    }

    document.addEventListener('click', function(e) {
        if (navToggle && navMenu && 
            !navToggle.contains(e.target) && 
            !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // 滚动时导航栏阴影
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                navbar.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }
        });
    }
});
