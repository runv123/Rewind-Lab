/* ============================================
   Rewind Lab - Create Page Module
   处理步骤切换、文件上传、风格选择
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.step');
    const contents = document.querySelectorAll('.step-content');
    let currentStep = 1;

    // 步骤导航
    function goToStep(step) {
        // 验证步骤合法性
        if (step < 1) step = 1;
        if (step > 5) step = 5;
        
        // 更新步骤指示器
        steps.forEach(s => {
            const stepNum = parseInt(s.dataset.step);
            s.classList.toggle('active', stepNum <= step);
        });

        // 更新内容区域
        contents.forEach(c => {
            c.classList.toggle('active', c.id === `step-${step}`);
        });

        currentStep = step;
    }

    // 绑定导航点击
    steps.forEach(s => {
        s.addEventListener('click', () => {
            goToStep(parseInt(s.dataset.step));
        });
    });

    // 步骤按钮绑定
    document.getElementById('btn-step-1-next')?.addEventListener('click', () => goToStep(2));
    document.getElementById('btn-step-2-prev')?.addEventListener('click', () => goToStep(1));
    document.getElementById('btn-step-2-next')?.addEventListener('click', () => goToStep(3));
    document.getElementById('btn-step-3-prev')?.addEventListener('click', () => goToStep(2));
    document.getElementById('btn-step-3-next')?.addEventListener('click', () => goToStep(4));
    document.getElementById('btn-step-4-prev')?.addEventListener('click', () => goToStep(3));
    document.getElementById('btn-step-4-next')?.addEventListener('click', startProcessing);
    document.getElementById('btnRecreate')?.addEventListener('click', () => {
        resetForm();
        goToStep(1);
    });

    // 文件上传逻辑
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFile = document.getElementById('removeFile');
    const btnStep1Next = document.getElementById('btn-step-1-next');

    let uploadedFile = null;

    if (uploadZone) {
        uploadZone.addEventListener('click', () => fileInput.click());
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFile(e.target.files[0]);
            }
        });
    }

    function handleFile(file) {
        // 简单验证
        if (!file.type.startsWith('video/')) {
            alert('请上传视频文件');
            return;
        }
        
        uploadedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatSize(file.size);
        
        uploadZone.classList.add('hidden');
        filePreview.classList.remove('hidden');
        btnStep1Next.disabled = false;
    }

    if (removeFile) {
        removeFile.addEventListener('click', () => {
            uploadedFile = null;
            fileInput.value = '';
            uploadZone.classList.remove('hidden');
            filePreview.classList.add('hidden');
            btnStep1Next.disabled = true;
        });
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // 风格选择逻辑
    const styleCards = document.querySelectorAll('.style-card');
    const btnStep2Next = document.getElementById('btn-step-2-next');
    let selectedStyle = null;

    styleCards.forEach(card => {
        card.addEventListener('click', () => {
            styleCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedStyle = card.dataset.style;
            btnStep2Next.disabled = false;
        });
    });

    // 参数滑块实时显示
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        const valueSpan = slider.parentElement.querySelector('.param-value');
        if (valueSpan) {
            valueSpan.textContent = slider.value + '%';
            slider.addEventListener('input', () => {
                valueSpan.textContent = slider.value + '%';
            });
        }
    });

    // 模拟处理过程
    function startProcessing() {
        const status = document.getElementById('processingStatus');
        const progress = document.getElementById('progressFill');
        const btnNext = document.getElementById('btn-step-4-next');
        
        btnNext.disabled = true;
        btnNext.textContent = '处理中...';
        
        const steps = [
            { msg: '正在初始化滤镜引擎...', percent: 10 },
            { msg: '正在分析视频帧...', percent: 30 },
            { msg: '正在应用复古效果...', percent: 60 },
            { msg: '正在渲染输出...', percent: 90 },
            { msg: '处理完成！', percent: 100 }
        ];

        let stepIndex = 0;

        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                status.textContent = steps[stepIndex].msg;
                progress.style.width = steps[stepIndex].percent + '%';
                stepIndex++;
            } else {
                clearInterval(interval);
                goToStep(5);
            }
        }, 800);
    }

    function resetForm() {
        uploadedFile = null;
        selectedStyle = null;
        styleCards.forEach(c => c.classList.remove('selected'));
        btnStep1Next.disabled = true;
        btnStep2Next.disabled = true;
        filePreview.classList.add('hidden');
        uploadZone.classList.remove('hidden');
        document.getElementById('progressFill').style.width = '0%';
    }

    // 下载按钮模拟
    document.getElementById('btnDownload')?.addEventListener('click', () => {
        alert('下载功能将在 V0.4 版本中实现本地文件生成');
    });
});
