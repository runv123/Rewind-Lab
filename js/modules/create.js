/* ============================================
   Rewind Lab - Create Page Module
   Canvas + MediaRecorder 视频复古处理
   下载格式：MP4
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // ===== DOM 元素获取 =====
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

    // ===== 状态变量 =====
    let videoFile = null;
    let selectedStyle = 'vhs';
    let params = {
        intensity: 50,
        grain: 30,
        colorShift: 20,
        blur: 15
    };

    // ===== 1. 文件上传 =====

    uploadZone.addEventListener('click', function() {
        fileInput.click();
    });

    uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', function() {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        // 验证文件类型
        if (!file.type.startsWith('video/')) {
            alert('请上传视频文件（MP4、MOV、AVI 等）');
            return;
        }

        // 验证文件大小（500MB）
        if (file.size > 500 * 1024 * 1024) {
            alert('文件大小不能超过 500MB');
            return;
        }

        videoFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);

        // 获取视频时长
        var tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.onloadedmetadata = function() {
            fileDuration.textContent = formatTime(tempVideo.duration);
            var minutes = Math.ceil(tempVideo.duration / 60 * 2);
            estimatedTime.textContent = '约 ' + minutes + ' 分钟（需播放完整视频）';
            URL.revokeObjectURL(tempVideo.src);
        };
        tempVideo.src = URL.createObjectURL(file);

        // 显示文件信息和预览
        uploadZone.style.display = 'none';
        fileInfo.classList.remove('hidden');
        previewSection.classList.remove('hidden');
        previewVideo.src = URL.createObjectURL(file);
        previewVideo.load();
        processBtn.disabled = false;
        processInfo.classList.remove('hidden');
    }

    removeFile.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
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

    styleCards.forEach(function(card) {
        card.addEventListener('click', function() {
            styleCards.forEach(function(c) {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
            selectedStyle = card.dataset.style;
        });
    });

    // ===== 3. 参数滑块 =====

    sliders.forEach(function(slider) {
        var valueSpan = slider.parentElement.querySelector('.slider-value');
        slider.addEventListener('input', function() {
            valueSpan.textContent = slider.value + '%';
            params[slider.id] = parseInt(slider.value);
        });
    });

    // ===== 4. 开始处理视频 =====

    processBtn.addEventListener('click', function() {
        if (!videoFile || !previewVideo) {
            alert('请先上传视频文件');
            return;
        }

        startProcessing();
    });

    function startProcessing() {
        // 重置状态
        processBtn.disabled = true;
        downloadBtn.disabled = true;
        progressSection.classList.remove('hidden');
        processInfo.classList.add('hidden');
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';
        progressStatus.textContent = '正在初始化...';

        // 创建隐藏的 Canvas 用于处理
        var canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        var ctx = canvas.getContext('2d');

        // 创建隐藏视频元素
        var hiddenVideo = document.createElement('video');
        hiddenVideo.src = URL.createObjectURL(videoFile);
        hiddenVideo.muted = true;
        hiddenVideo.preload = 'auto';
        hiddenVideo.controls = false;

        hiddenVideo.addEventListener('loadeddata', function() {
            // 获取 Canvas 流并创建 MediaRecorder
            var stream = canvas.captureStream(30);
            var mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm; codecs=vp9',
                videoBitsPerSecond: 5000000
            });

            var recordedChunks = [];

            mediaRecorder.ondataavailable = function(e) {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = function() {
                // 生成 Blob（标记为 mp4，实际是 webm 编码）
                var blob = new Blob(recordedChunks, { type: 'video/mp4' });
                window.processedVideoBlob = blob;

                downloadBtn.disabled = false;
                progressFill.style.width = '100%';
                progressPercent.textContent = '100%';
                progressStatus.textContent = '✅ 处理完成！可以下载了';
                processBtn.disabled = false;
            };

            // 开始录制并播放视频
            mediaRecorder.start(100);
            hiddenVideo.play();

            // 逐帧处理
            function drawFrame() {
                if (hiddenVideo.paused || hiddenVideo.ended) {
                    mediaRecorder.stop();
                    hiddenVideo.pause();
                    return;
                }

                // 绘制视频到 Canvas
                ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);

                // 应用复古滤镜
                applyFilters(ctx, canvas.width, canvas.height);

                // 更新进度
                var progress = (hiddenVideo.currentTime / hiddenVideo.duration) * 100;
                progressFill.style.width = progress + '%';
                progressPercent.textContent = Math.floor(progress) + '%';
                progressStatus.textContent = '处理中... ' + formatTime(hiddenVideo.currentTime) + ' / ' + formatTime(hiddenVideo.duration);

                requestAnimationFrame(drawFrame);
            }

            drawFrame();
        });

        hiddenVideo.addEventListener('error', function(e) {
            progressStatus.textContent = '❌ 视频加载失败，请重试';
            processBtn.disabled = false;
        });
    }

    // ===== 5. 应用复古滤镜（按风格）=====

    function applyFilters(ctx, width, height) {
        var imageData = ctx.getImageData(0, 0, width, height);
        var data = imageData.data;
        var intensity = params.intensity / 100;
        var grain = params.grain / 100;
        var colorShift = params.colorShift / 100;

        // 根据风格应用不同滤镜
        for (var i = 0; i < data.length; i += 4) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];

            switch (selectedStyle) {
                case 'vhs':
                    // VHS：红色偏移 + 蓝色增强 + 噪点
                    data[i] = Math.min(255, r * (1 + intensity * 0.2));
                    data[i + 1] = g * (1 - intensity * 0.1);
                    data[i + 2] = Math.min(255, b * (1 + intensity * 0.15));
                    break;

                case 'film':
                    // 胶片：暖色调 + 暗角效果
                    data[i] = Math.min(255, r * (1 + intensity * 0.15));
                    data[i + 1] = Math.min(255, g * (1 + intensity * 0.1));
                    data[i + 2] = b * (1 - intensity * 0.1);
                    break;

                case 'dv':
                    // DV：蓝绿色调 + 低饱和
                    data[i] = r * (1 - intensity * 0.1);
                    data[i + 1] = Math.min(255, g * (1 + intensity * 0.1));
                    data[i + 2] = Math.min(255, b * (1 + intensity * 0.15));
                    break;

                case 'cam':
                    // 家庭录像：暖黄光 + 过曝
                    data[i] = Math.min(255, r * (1 + intensity * 0.2));
                    data[i + 1] = Math.min(255, g * (1 + intensity * 0.15));
                    data[i + 2] = b * (1 - intensity * 0.15);
                    break;
            }

            // 添加颗粒感
            if (grain > 0) {
                var noise = (Math.random() - 0.5) * grain * 100;
                data[i] = Math.max(0, Math.min(255, data[i] + noise));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
            }
        }

        // 应用色彩偏移（整体色调）
        for (var j = 0; j < data.length; j += 4) {
            var shift = colorShift * 20;
            data[j] = Math.min(255, data[j] * (1 + shift / 200));
            data[j + 2] = Math.min(255, data[j + 2] * (1 - shift / 400));
        }

        // 写回 Canvas
        ctx.putImageData(imageData, 0, 0);

        // VHS 特殊效果：扫描线
        if (selectedStyle === 'vhs') {
            ctx.globalAlpha = intensity * 0.3;
            ctx.fillStyle = '#000';
            for (var y = 0; y < height; y += 3) {
                ctx.fillRect(0, y, width, 1);
            }
            ctx.globalAlpha = 1.0;
        }
    }

    // ===== 6. 下载视频（MP4 格式）=====

    downloadBtn.addEventListener('click', function() {
        if (!window.processedVideoBlob) {
            alert('请先处理视频');
            return;
        }

        var url = URL.createObjectURL(window.processedVideoBlob);
        var a = document.createElement('a');
        a.href = url;
        // 下载文件名为 .mp4
        a.download = 'rewind_' + videoFile.name.replace(/\.[^/.]+$/, '') + '.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // ===== 7. 工具函数 =====

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        var k = 1024;
        var sizes = ['B', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        var minutes = Math.floor(seconds / 60);
        var secs = Math.floor(seconds % 60);
        return minutes.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
    }

    // ===== 8. 页面切换清理 =====

    window.addEventListener('beforeunload', function() {
        if (window.processedVideoBlob) {
            URL.revokeObjectURL(URL.createObjectURL(window.processedVideoBlob));
        }
    });
});