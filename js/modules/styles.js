/* ============================================
   Rewind Lab - Styles Page Module
   处理风格筛选、搜索、详情弹窗
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // 风格数据（包含参数预设）
    const styleData = {
        'vhs': {
            title: 'VHS 录像带',
            en: 'Video Home System',
            era: '1980s-90s',
            story: '磁带噪点，那是时间的呼吸声。1980 年代的家庭影像记忆，温暖而模糊。VHS 格式定义了整整一代人的家庭录像体验，那种独特的色彩偏移和画面抖动，如今成为怀旧的代名词。',
            features: ['磁带颗粒', '扫描线', '暖色调', '画面抖动', '色彩偏移'],
            use: '生日录像、家庭聚会、怀旧 Vlog、复古广告',
            params: {
                intensity: '65%',
                grain: '70%',
                color: '45%',
                speed: '30fps'
            }
        },
        'film': {
            title: '经典胶片',
            en: 'Classic Film',
            era: '1970s-80s',
            story: '胶片颗粒，留住光线原本的质感。70-80 年代电影工业的黄金时代，柯达胶卷与富士胶卷定义了那个时代的视觉语言。高动态范围与独特的色彩科学，让胶片影像具有不可替代的温暖质感。',
            features: ['胶片颗粒', '电影色彩', '高动态', '宽色域', '柔和对比'],
            use: '旅行纪录片、电影感 Vlog、艺术短片、品牌宣传片',
            params: {
                intensity: '55%',
                grain: '50%',
                color: '60%',
                speed: '24fps'
            }
        },
        'dv': {
            title: '数字摄像机',
            en: 'Digital Video',
            era: '1990s-2000s',
            story: '数字像素，找回千禧年的电子感。DV 时代记录下的家庭记忆与街头文化，数字压缩带来的像素感和时间戳，构成了千禧年独特的视觉记忆。',
            features: ['数字像素', '时间戳', '冷色调', '低分辨率', '数字噪点'],
            use: '千禧年复古、电子感 MV、Y2K 风格内容、赛博怀旧',
            params: {
                intensity: '70%',
                grain: '40%',
                color: '55%',
                speed: '25fps'
            }
        },
        'cam': {
            title: '家庭录像',
            en: 'Home Camcorder',
            era: '1980s-90s',
            story: '晃动效果，回忆中才是真实的。父辈手持摄像机记录下的温暖瞬间，那种不完美的晃动、过曝的灯光、温暖的色调，构成了最真实的家庭记忆。',
            features: ['晃动效果', '暖黄光', '回忆感', '过曝', '手持感'],
            use: '家庭聚会、婚礼记录、怀旧纪念视频、生日庆祝',
            params: {
                intensity: '60%',
                grain: '45%',
                color: '50%',
                speed: '30fps'
            }
        },
        'super8': {
            title: '超级 8 毫米',
            en: 'Super 8mm Film',
            era: '1960s-70s',
            story: '胶片时代的家庭电影。60-70 年代最普及的家庭摄影格式，那种独特的胶片抖动、暖橙色调和胶片划痕，赋予影像无法复制的时间质感。',
            features: ['胶片抖动', '暖橙色调', '胶片划痕', '低对比', '复古颗粒'],
            use: '艺术短片、复古广告、年代剧质感、品牌怀旧营销',
            params: {
                intensity: '75%',
                grain: '80%',
                color: '65%',
                speed: '18fps'
            }
        },
        'cyber': {
            title: '赛博朋克',
            en: 'Cyberpunk',
            era: '1990s',
            story: '90 年代科幻美学的巅峰。蓝紫霓虹与黑暗都市的结合，高对比度与饱和色彩，充满未来与反乌托邦气质，致敬《银翼杀手》与《攻壳机动队》。',
            features: ['霓虹色彩', '高对比度', '未来感', '蓝紫调', '科技光效'],
            use: '科技类内容、夜景城市、科幻题材、游戏宣传片',
            params: {
                intensity: '80%',
                grain: '30%',
                color: '85%',
                speed: '30fps'
            }
        },
        'minimal': {
            title: '极简数码',
            en: 'Minimal Digital',
            era: '2000s',
            story: '千禧年初期的数码影像美学。干净、明亮、不带多余情绪的记录风格，高白平衡与低对比度，追求纯粹的真实感。',
            features: ['高白平衡', '低对比度', '干净质感', '中性色', '清晰画质'],
            use: '产品展示、教学视频、清新 Vlog、企业宣传片',
            params: {
                intensity: '30%',
                grain: '20%',
                color: '35%',
                speed: '30fps'
            }
        },
        'silent': {
            title: '黑白默片',
            en: 'Silent Era',
            era: '1920s',
            story: '电影最早的视觉语言。20 世纪 20 年代的默片时代，纯粹的黑白光影艺术，高对比度与胶片噪点，营造出经典而永恒的电影质感。',
            features: ['高对比度', '胶片噪点', '24fps', '纯黑白', '经典质感'],
            use: '艺术短片、纪录片、高级感品牌视频、时尚影像',
            params: {
                intensity: '85%',
                grain: '60%',
                color: '95%',
                speed: '24fps'
            }
        }
    };

    // 获取卡片对应的风格键名
    const styleKeys = ['vhs', 'film', 'dv', 'cam', 'super8', 'cyber', 'minimal', 'silent'];
    document.querySelectorAll('.style-item').forEach((item, index) => {
        item.dataset.style = styleKeys[index];
    });

    // 筛选标签
    const filterTabs = document.querySelectorAll('.filter-tab');
    const styleItems = document.querySelectorAll('.style-item');
    const emptyState = document.getElementById('emptyState');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.dataset.filter;
            
            // 更新激活状态
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 筛选逻辑
            let visibleCount = 0;
            styleItems.forEach(item => {
                if (filter === 'all' || item.dataset.decade.includes(filter)) {
                    item.style.display = '';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            // 显示/隐藏空状态
            emptyState.classList.toggle('hidden', visibleCount > 0);
        });
    });

    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        let visibleCount = 0;

        styleItems.forEach(item => {
            const keywords = item.dataset.keywords || '';
            if (keywords.includes(query)) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        emptyState.classList.toggle('hidden', styleItems.length > 0);
        });

    // 重置筛选
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchInput.value = '';
        filterTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');
        styleItems.forEach(item => item.style.display = '');
        emptyState.classList.add('hidden');
    });

    // 详情弹窗
    const modal = document.getElementById('styleModal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalCreate = document.getElementById('modalCreate');

    function openModal(styleKey) {
        const data = styleData[styleKey];
        if (!data) return;

        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalEn').textContent = data.en;
        document.getElementById('modalEra').textContent = data.era;
        document.getElementById('modalStory').textContent = data.story;
        document.getElementById('modalUse').textContent = data.use;

        // 特征标签
        const featuresEl = document.getElementById('modalFeatures');
        featuresEl.innerHTML = data.features.map(f => 
            `<span class="feature-tag">${f}</span>`
        ).join('');

        // 参数预设
        const paramsEl = document.getElementById('modalParams');
        paramsEl.innerHTML = Object.entries(data.params).map(([key, value]) => {
            const labels = { intensity: '复古强度', grain: '颗粒感', color: '色彩偏移', speed: '帧率' };
            return `
                <div class="param-item">
                    <div class="param-label">${labels[key] || key}</div>
                    <div class="param-value">${value}</div>
                </div>
            `;
        }).join('');

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // 绑定卡片点击
    document.querySelectorAll('.style-item').forEach(item => {
        item.addEventListener('click', () => {
            openModal(item.dataset.style);
        });
    });

    modalClose?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', closeModal);

    // ESC 关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // 立即创作按钮
    modalCreate?.addEventListener('click', () => {
        closeModal();
        window.location.href = 'create.html';
    });
});
