/* ============================================
   Rewind Lab - Create Page Module
   视频上传、预览、处理和下载
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // DOM 元素
    var uploadZone = document.getElementById('uploadZone');
    var fileInput = document.getElementById('fileInput');
    var fileInfo = document.getElementById('fileInfo');
    var fileName = document.getElementById('fileName');
    var fileSize = document.getElementById('fileSize');
    var removeFile = document.getElementById('removeFile');
    var previewSection = document.getElementById('previewSection');
    var previewCanvas = document.getElementById('previewCanvas');
    var playPause = document.getElementById('playPause');
    var timeDisplay = document.getElementById('timeDisplay');
    var muteToggle = document.getElementById('muteToggle');
    var styleCards = document.querySelectorAll('.style-card');
    var sliders = document.querySelectorAll('.slider');
    var processBtn = document.getElementById('processBtn');
    var downloadBtn = document.getElementById('downloadBtn');
    var progressSection = document.getElementById('progressSection');
    var progressFill = document.getElementById('progressFill');
    var progressPercent = document.getElementById('progressPercent');
    var progressStatus = document.getElementById('progressStatus');

    // 状态变量
    var videoFile = null;
    var video = null;
    var isPlaying = false;
    var isMuted = false;
    var selectedStyle = 'vhs';
    var params = {
        intensity: 50,
        grain: 30,
        colorShift: 20,
        blur: 15
    };

    // ===== 文件上传 =====
    
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
        if (!file.type.startsWith('video/')) {
            alert('请上传视频文件');
            return;
        }

        if (file.size > 500 * 1024 * 1024) {
            alert('文件大小不能超过 500MB');
            return;
        }

        videoFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);

        uploadZone.style.display = 'none';
        fileInfo.classList.remove('hidden');

        createVideoPreview();
        processBtn.disabled = false;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        var k = 1024;
        var sizes = ['B', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    removeFile.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        removeVideoFile();
    });

    function removeVideoFile() {
        videoFile = null;
        if (video) {
            video.pause();
            video.src = '';
            video = null;
        }
        fileInput.value = '';
        uploadZone.style.display = 'block';
        fileInfo.classList.add('hidden');
        previewSection.classList.add('hidden');
        processBtn.disabled = true;
        downloadBtn.disabled = true;
    }

    // ===== 视频预览 =====
    
    function createVideoPreview() {
        var url = URL.createObjectURL(videoFile);
        video = document.createElement('video');
        video.src = url;
        video.crossOrigin = 'anonymous';
        video.style.display = 'none';

        video.addEventListener('loadedmetadata', function() {
            timeDisplay.textContent = '00:00 / ' + formatTime(video.duration);
        });

        video.addEventListener('timeupdate', function() {
            timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
        });

        document.body.appendChild(video);
        previewSection.classList.remove('hidden');
        startPreview();
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        var minutes = Math.floor(seconds / 60);
        var secs = Math.floor(seconds % 60);
        return minutes.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
    }

    function startPreview() {
        if (!video) return;

        var ctx = previewCanvas.getContext('2d');
        var animId;

        function drawFrame() {
            if (video.paused || video.ended) {
                ctx.drawImage(video, 0, 0, previewCanvas.width, previewCanvas.height);
                return;
            }

            ctx.drawImage(video, 0, 0, previewCanvas.width, previewCanvas.height);
            applyFilters(ctx, previewCanvas.width, previewCanvas.height);
            animId = requestAnimationFrame(drawFrame);
        }

        drawFrame();
    }

    playPause.addEventListener('click', function() {
        if (!video) return;
        if (isPlaying) {
            video.pause();
            playPause.textContent = '▶ 播放';
        } else {
            video.play();
            playPause.textContent = '⏸ 暂停';
        }
        isPlaying = !isPlaying;
    });

    muteToggle.addEventListener('click', function() {
        if (!video) return;
        isMuted = !isMuted;
        video.muted = isMuted;
        muteToggle.textContent = isMuted ? '🔇 静音' : '🔊 静音';
    });

    // ===== 风格选择 =====
    
    styleCards.forEach(function(card) {
        card.addEventListener('click', function() {
            styleCards.forEach(function(c) { c.classList.remove('selected'); });
            card.classList.add('selected');
            selectedStyle = card.dataset.style;
        });
    });

    // ===== 参数滑块 =====
    
    sliders.forEach(function(slider) {
        var valueSpan = slider.parentElement.querySelector('.slider-value');
        var paramKey = slider.id;
        
        slider.addEventListener('input', function() {
            valueSpan.textContent = slider.value + '%';
            params[paramKey] = parseInt(slider.value);
        });
    });

    // ===== 应用滤镜效果 =====
    
    function applyFilters(ctx, width, height) {
        // 获取当前图像数据
        var imageData = ctx.getImageData(0, 0, width, height);
        var data = imageData.data;

        // 复古强度
        var intensity = params.intensity / 100;
        var grainAmount = params.grain / 100;
        var colorShiftAmount = params.colorShift / 100;
        var blurAmount = params.blur / 100;

        // 应用像素级滤镜
        for (var i = 0; i < data.length; i += 4) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];

            // VHS 风格：增加红色和蓝色偏移
            if (selectedStyle === 'vhs') {
                data[i] = Math.min(255, r * (1 + intensity * 0.2));
                data[i + 1] = g * (1 - intensity * 0.1);
                data[i + 2] = Math.min(255, b * (1 + intensity * 0.15));
            }
            // 胶片风格：暖色调，增加颗粒
            else if (selectedStyle === 'film') {
                data[i] = Math.min(255, r * 1.1);
                data[i + 1] = g * 1.05;
                data[i + 2] = b * 0.9;
            }
            // DV 风格：增加蓝绿色调
            else if (selectedStyle === 'dv') {
                data[i] = r * (1 - intensity * 0.1);
                data[i + 1] = Math.min(255, g * (1 + intensity * 0.1));
                data[i + 2] = Math.min(255, b * (1 + intensity * 0.15));
            }
            // 家庭录像：暖黄色调
            else if (selectedStyle === 'cam') {
                data[i] = Math.min(255, r * (1 + intensity * 0.15));
                data[i + 1] = Math.min(255, g * (1 + intensity * 0.1));
                data[i + 2] = b * (1 - intensity * 0.1);
            }

            // 添加颗粒效果
            if (grainAmount > 0) {
                var noise = (Math.random() - 0.5) * grainAmount * 100;
                data[i] = Math.max(0, Math.min(255, data[i] + noise));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
            }
        }

        // 应用色彩偏移（整体色调调整）
        for (var j = 0; j < data.length; j += 4) {
            var shift = colorShiftAmount * 20;
            data[j] = Math.min(255, data[j] * (1 + shift / 100));
            data[j + 2] = Math.min(255, data[j + 2] * (1 - shift / 200));
        }
    }

    // ===== 处理视频 =====
    
    processBtn.addEventListener('click', function() {
        if (!videoFile || !video) {
            alert('请先上传视频文件');
            return;
        }

        processBtn.disabled = true;
        progressSection.classList.remove('hidden');
        downloadBtn.disabled = true;

        simulateProcessing();
    });

    function simulateProcessing() {
        var progress = 0;
        var statuses = [
            '正在初始化...',
            '正在分析视频...',
            '正在应用滤镜效果...',
            '正在处理帧...',
            '正在渲染输出...',
            '处理完成！'
        ];

        var statusIndex = 0;

        var interval = setInterval(function() {
            progress += Math.random() * 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                setTimeout(function() {
                    progressStatus.textContent = '✅ 处理完成！可以下载了';
                    downloadBtn.disabled = false;
                }, 500);
            }

            progressFill.style.width = progress + '%';
            progressPercent.textContent = Math.floor(progress) + '%';

            if (progress > 20 && statusIndex === 0) statusIndex = 1;
            if (progress > 40 && statusIndex === 1) statusIndex = 2;
            if (progress > 60 && statusIndex === 2) statusIndex = 3;
            if (progress > 80 && statusIndex === 3) statusIndex = 4;
            if (progress >= 100) statusIndex = 5;

            progressStatus.textContent = statuses[statusIndex];
        }, 100);
    }

    // ===== 下载视频 =====
    
    downloadBtn.addEventListener('click', function() {
        if (!videoFile) {
            alert('请先上传并处理视频');
            return;
        }

        // 实际项目中，这里应该调用 WebCodecs API 或 FFmpeg.wasm 进行视频转码
        // 当前演示版本直接下载原文件（已应用预览效果说明）
        
        var link = document.createElement('a');
        link.href = URL.createObjectURL(videoFile);
        link.download = 'rewind_' + videoFile.name;
        link.click();

        alert('视频下载已开始！\n\n注意：当前版本为演示模式，下载的文件为原始视频。\n完整功能将在 V1.1 版本中实现真正的视频转码。');
    });

    // 清理资源
    window.addEventListener('beforeunload', function() {
        if (video) {
            video.pause();
            video.src = '';
        }
    });
});