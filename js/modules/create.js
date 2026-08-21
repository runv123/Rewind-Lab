/* ============================================
   Rewind Lab - Create Page Module
   集成 FFmpeg.wasm 实现真正的视频处理
   ============================================ */

document.addEventListener('DOMContentLoaded', async function() {
    // DOM 元素
    const loadingBanner = document.getElementById('loadingBanner');
    const loadingText = document.getElementById('loadingText');
    const createWorkspace = document.getElementById('createWorkspace');
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
    let ffmpeg = null;
    let videoFile = null;
    let selectedStyle = 'vhs';
    let params = { intensity: 50, grain: 30, colorShift: 20, blur: 15 };
    let processedBlob = null;

    // ===== 1. 加载 FFmpeg.wasm =====
    
    try {
        loadingText.textContent = '正在加载视频处理引擎...';
        
        // 动态导入 FFmpeg.wasm
        const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
        const { toBlobURL } = await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/util.js');

        ffmpeg = new FFmpeg();

        // 设置进度回调
        ffmpeg.on('progress', ({ progress, time }) => {
            const percent = Math.round(progress * 100);
            progressFill.style.width = percent + '%';
            progressPercent.textContent = percent + '%';
            progressStatus.textContent = `正在处理... (${formatTime(time / 1000000)})`;
        });

        ffmpeg.on('log', ({ message }) => {
            console.log('FFmpeg:', message);
        });

        ffmpeg.on('start', () => {
            progressStatus.textContent = '正在初始化...';
        });

        // 加载 FFmpeg 核心
        loadingText.textContent = '正在下载处理引擎（约25MB）...';
        const coreURL = await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', 'text/javascript');
        await ffmpeg.load({ coreURL });

        // 加载完成
        loadingBanner.style.display = 'none';
        createWorkspace.style.display = '';
        loadingText.textContent = '视频处理引擎已就绪';
        
        console.log('FFmpeg.wasm 加载成功');
    } catch (error) {
        console.error('FFmpeg 加载失败:', error);
        loadingText.textContent = '⚠️ 视频处理引擎加载失败，请刷新页面重试';
        loadingBanner.innerHTML = `
            <div style="text-align:center;color:var(--color-error)">
                <p style="font-size:18px;margin-bottom:12px">⚠️ 视频处理引擎加载失败</p>
                <p>请检查网络连接后刷新页面</p>
                <p style="font-size:12px;color:var(--color-text-light);margin-top:12px">错误信息：${error.message}</p>
            </div>
        `;
    }

    // ===== 2. 文件上传 =====

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
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            fileDuration.textContent = formatTime(video.duration);
            // 估算处理时间
            estimateProcessingTime(video.duration);
        };
        video.src = URL.createObjectURL(file);

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
        processedBlob = null;
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

    // ===== 3. 风格选择 =====

    styleCards.forEach(card => {
        card.addEventListener('click', () => {
            styleCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedStyle = card.dataset.style;
        });
    });

    // ===== 4. 参数滑块 =====

    sliders.forEach(slider => {
        const valueSpan = slider.parentElement.querySelector('.slider-value');
        slider.addEventListener('input', () => {
            valueSpan.textContent = slider.value + '%';
            params[slider.id] = parseInt(slider.value);
        });
    });

    // ===== 5. 视频处理（核心功能）=====

    processBtn.addEventListener('click', async () => {
        if (!videoFile || !ffmpeg) {
            alert('请先上传视频文件');
            return;
        }

        // 禁用按钮
        processBtn.disabled = true;
        downloadBtn.disabled = true;
        progressSection.classList.remove('hidden');
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';

        try {
            // 将文件写入 FFmpeg 虚拟文件系统
            progressStatus.textContent = '正在写入文件...';
            await ffmpeg.writeFile('input.mp4', await fileToUint8Array(videoFile));

            // 构建 FFmpeg 命令
            progressStatus.textContent = '正在构建滤镜链...';
            const ffmpegCommand = buildFFmpegCommand();

            // 执行视频处理
            progressStatus.textContent = '正在处理视频...';
            await ffmpeg.exec(ffmpegCommand);

            // 读取输出文件
            progressStatus.textContent = '正在生成输出文件...';
            const data = await ffmpeg.readFile('output.mp4');
            processedBlob = new Blob([data.buffer], { type: 'video/mp4' });

            // 完成
            progressFill.style.width = '100%';
            progressPercent.textContent = '100%';
            progressStatus.textContent = '✅ 处理完成！可以下载了';
            downloadBtn.disabled = false;

            // 清理虚拟文件系统
            await ffmpeg.deleteFile('input.mp4');
            await ffmpeg.deleteFile('output.mp4');

        } catch (error) {
            console.error('视频处理失败:', error);
            progressStatus.textContent = '❌ 处理失败：' + error.message;
            processBtn.disabled = false;
        }
    });

    // ===== 6. 下载视频 =====

    downloadBtn.addEventListener('click', () => {
        if (!processedBlob) {
            alert('请先处理视频');
            return;
        }

        const url = URL.createObjectURL(processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rewind_' + videoFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // ===== 7. 工具函数 =====

    function fileToUint8Array(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(new Uint8Array(reader.result));
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

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

    function estimateProcessingTime(duration) {
        // 根据视频时长估算处理时间（分钟）
        const minutes = Math.ceil(duration / 60 * 1.5); // 1.5倍时长
        estimatedTime.textContent = `约 ${minutes} 分钟`;
    }

    // ===== 8. 构建 FFmpeg 命令（核心）=====

    function buildFFmpegCommand() {
        const style = selectedStyle;
        const intensity = params.intensity / 100;
        const grain = params.grain / 100;
        const colorShift = params.colorShift / 100;
        const blurAmount = params.blur / 100;

        // 基础命令
        let command = ['-i', 'input.mp4'];

        // 滤镜链
        let filters = [];

        switch (style) {
            case 'vhs':
                // VHS 录像带效果：扫描线 + 色彩偏移 + 噪点
                filters.push(`hue=s=${1 - intensity * 0.3}:H=${intensity * 20}`); // 色调调整
                filters.push(`eq=brightness=${-intensity * 0.1}:contrast=${1 + intensity * 0.2}`); // 亮度对比度
                filters.push(`noise=alls=${grain * 64}:allf=t+st:fr=1`); // 噪点
                filters.push(`geq=r='X/W*255*sin((X+Y)/${10 + blurAmount * 5})':g='X/W*255':b='X/W*255*sin((X-Y)/${15 + blurAmount * 3})'`); // 色彩偏移
                filters.push(`split[a][b];[a]format=yuv420p[a2];[b]scale=854:480[b2];[a2][b2]overlay=0:0`); // 低分辨率
                break;

            case 'film':
                // 胶片效果：颗粒 + 暖色 + 暗角
                filters.push(`curves=vintage_75`); // 胶片曲线
                filters.push(`colorbalance=rb=${intensity * 0.2}:gb=${intensity * 0.1}:bb=${-intensity * 0.1}`); // 暖色调
                filters.push(`vignette=${1 - intensity * 0.3}:${1 + intensity * 0.2}`); // 暗角
                filters.push(`noise=alls=${grain * 32}:allf=t+st:fr=1`); // 颗粒
                filters.push(`format=yuv420p`);
                break;

            case 'dv':
                // DV 数字摄像机：低分辨率 + 色彩压缩
                filters.push(`scale=854:480`); // 降低分辨率
                filters.push(`unsharp=5:5:${intensity * 1.0}`); // 模糊
                filters.push(`eq=saturation=${1 - intensity * 0.3}:brightness=${-intensity * 0.05}`); // 降低饱和
                filters.push(`noise=alls=${grain * 16}:allf=t+st:fr=1`); // 轻微噪点
                filters.push(`metadata=mode=insert:file=metadata.txt`); // 时间戳
                filters.push(`format=yuv420p`);
                break;

            case 'cam':
                // 家庭录像：暖黄光 + 轻微晃动 + 过曝
                filters.push(`colorchannelmixer=rr=1.1:gg=1.05:bb=0.9`); // 暖色调
                filters.push(`eq=brightness=${intensity * 0.1}:contrast=${1 - intensity * 0.1}`); // 过曝
                filters.push(`geq=r='if(eq(X,0),0,PX+W*${blurAmount * 0.1})':g='if(eq(X,0),0,PX+W*${blurAmount * 0.1})':b='if(eq(X,0),0,PX+W*${blurAmount * 0.1})'`); // 轻微模糊
                filters.push(`noise=alls=${grain * 24}:allf=t+st:fr=1`); // 颗粒
                filters.push(`vignette=0.8:0.5`); // 暗角
                filters.push(`format=yuv420p`);
                break;
        }

        // 添加通用后处理
        filters.push(`fps=24`); // 帧率
        filters.push(`format=yuv420p`); // 色彩格式

        command.push('-vf', filters.join(','));
        command.push('-c:v', 'libx264'); // 视频编码器
        command.push('-preset', 'medium'); // 编码预设
        command.push('-crf', '23'); // 质量
        command.push('-c:a', 'aac'); // 音频编码器
        command.push('-b:a', '128k'); // 音频比特率
        command.push('-movflags', '+faststart'); // 优化网络播放
        command.push('output.mp4');

        return command;
    }

    // ===== 9. 页面切换清理 =====

    window.addEventListener('beforeunload', () => {
        if (ffmpeg) {
            ffmpeg.terminate();
        }
    });

    // 暴露到全局（供其他模块使用）
    window.rewindLab = {
        getFFmpeg: () => ffmpeg,
        isReady: () => ffmpeg !== null
    };
});