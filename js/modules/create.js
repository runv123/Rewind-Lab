/* ============================================
   Rewind Lab - Create Page Module
   使用 Canvas + MediaRecorder 实现视频处理
   无需 FFmpeg.wasm，兼容所有设备
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // DOM 元素
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileDuration = document.getElementById('fileDuration');
    const removeFile = document.getElementById('removeFile');
    const previewSection = document.getElementById('previewSection');
    const previewVideo = document.getElementById('previewVideo');
    const styleCards = document.querySelectorAll('.style-card');
    const sliders = document.querySelectorAll('.slider');
    const processBtn = document.getElementById('processBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressStatus = document.getElementById('progressStatus');
    const processInfo = document.getElementById('processInfo');
    const estimatedTime = document.getElementById('estimatedTime');

    // 状态变量
    let videoFile = null;
    let selectedStyle = 'vhs';
    let params = { intensity: 50, grain: 30, colorShift: 20, blur: 15 };
    let mediaRecorder = null;
    let recordedChunks = [];

    // ===== 1. 文件上传 =====

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

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('video/')) {
            alert('请上传视频文件（MP4、MOV、AVI 等）');
            return;
        }
        if (file.size > 500 * 1024 * 1024) {
            alert('文件大小不能超过 500MB');
            return;
        }

        videoFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);

        // 获取视频时长
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.onloadedmetadata = () => {
            fileDuration.textContent = formatTime(tempVideo.duration);
            // 估算处理时间（MediaRecorder 需要播放完整视频）
            const minutes = Math.ceil(tempVideo.duration / 60 * 2);
            estimatedTime.textContent = `约 ${minutes} 分钟（需播放完整视频）`;
            // 清理
            URL.revokeObjectURL(tempVideo.src);
        };
        tempVideo.src = URL.createObjectURL(file);

        uploadZone.style.display = 'none';
        fileInfo.classList.remove('hidden');
        previewSection.classList.remove('hidden');
        previewVideo.src = URL.createObjectURL(file);
        previewVideo.load();
        processBtn.disabled = false;
        processInfo.classList.remove('hidden');
    }

    removeFile.addEventListener('click', (e) => {
        e.preventDefault();
        removeVideoFile();
    });

    function removeVideoFile() {
        videoFile = null;
        fileInput.value = '';
        previewVideo.src = '';
        uploadZone.style.display = '';
        fileInfo.classList.add('hidden');
        previewSection.classList.add('hidden');
        processBtn.disabled = true;
        downloadBtn.disabled = true;
        processInfo.classList.add('hidden');
        progressSection.classList.add('hidden');
    }

    // ===== 2. 风格选择 =====

    styleCards.forEach(card => {
        card.addEventListener('click', () => {
            styleCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedStyle = card.dataset.style;
        });
    });

    // ===== 3. 参数滑块 =====

    sliders.forEach(slider => {
        const valueSpan = slider.parentElement.querySelector('.slider-value');
        slider.addEventListener('input', () => {
            valueSpan.textContent = slider.value + '%';
            params[slider.id] = parseInt(slider.value);
        });
    });

    // ===== 4. 开始处理（Canvas + MediaRecorder）=====

    processBtn.addEventListener('click', () => {
        if (!videoFile || !previewVideo) {
            alert('请先上传视频文件');
            return;
        }

        processBtn.disabled = true;
        downloadBtn.disabled = true;
        progressSection.classList.remove('hidden');
        processInfo.classList.add('hidden');

        startProcessing();
    });

    async function startProcessing() {
        // 创建隐藏的 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');

        // 创建隐藏视频元素
        const hiddenVideo = document.createElement('video');
        hiddenVideo.src = URL.createObjectURL(videoFile);
        hiddenVideo.muted = true;
        hiddenVideo.preload = 'auto';

        // 等待视频加载
        await new Promise((resolve) => {
            hiddenVideo.onloadeddata = resolve;
            hiddenVideo.load();
        });

        // 设置 MediaRecorder
        const stream = canvas.captureStream(30); // 30fps
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/mp4; codecs=vp9',
            videoBitsPerSecond: 5000000 // 5Mbps
        });

        recordedChunks = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            // 完成处理
            const blob = new Blob(recordedChunks, { type: 'video/mp4' });
            downloadBtn.disabled = false;
            progressFill.style.width = '100%';
            progressPercent.textContent = '100%';
            progressStatus.textContent = '✅ 处理完成！可以下载了';
            processBtn.disabled = false;

            // 全局存储用于下载
            window.processedVideoBlob = blob;
        };

        // 开始录制
        mediaRecorder.start(100); // 每100ms收集一次

        // 播放视频并绘制到 Canvas
        hiddenVideo.play();

        function drawFrame() {
            if (hiddenVideo.paused || hiddenVideo.ended) {
                mediaRecorder.stop();
                hiddenVideo.pause();
                return;
            }

            // 绘制原始视频
            ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);

            // 应用复古滤镜
            applyVhsFilter(ctx, canvas.width, canvas.height);

            // 更新进度
            const progress = (hiddenVideo.currentTime / hiddenVideo.duration) * 100;
            progressFill.style.width = progress + '%';
            progressPercent.textContent = Math.floor(progress) + '%';
            progressStatus.textContent = `正在处理... ${formatTime(hiddenVideo.currentTime)} / ${formatTime(hiddenVideo.duration)}`;

            requestAnimationFrame(drawFrame);
        }

        drawFrame();
    }

    // ===== 5. 应用复古滤镜（Canvas 版本）=====

    function applyVhsFilter(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const intensity = params.intensity / 100;
        const grain = params.grain / 100;

        // VHS 风格：红色偏移 + 噪点
        for (let i = 0; i < data.length; i += 4) {
            // 增加红色通道
            data[i] = Math.min(255, data[i] * (1 + intensity * 0.2));
            // 降低绿色通道
            data[i + 1] = data[i + 1] * (1 - intensity * 0.1);
            // 增加蓝色通道
            data[i + 2] = Math.min(255, data[i + 2] * (1 + intensity * 0.15));

            // 添加噪点
            if (grain > 0) {
                const noise = (Math.random() - 0.5) * grain * 80;
                data[i] = Math.max(0, Math.min(255, data[i] + noise));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
            }
        }

        // 添加扫描线效果
        ctx.putImageData(imageData, 0, 0);

        // 绘制扫描线
        ctx.globalAlpha = intensity * 0.3;
        ctx.fillStyle = '#000';
        for (let y = 0; y < height; y += 3) {
            ctx.fillRect(0, y, width, 1);
        }
        ctx.globalAlpha = 1.0;
    }

    // ===== 6. 下载视频 =====

    downloadBtn.addEventListener('click', () => {
        if (!window.processedVideoBlob) {
            alert('请先处理视频');
            return;
        }

        const url = URL.createObjectURL(window.processedVideoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rewind_' + videoFile.name.replace(/\.[^/.]+$/, '') + '.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // ===== 7. 工具函数 =====

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return minutes.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
    }
});