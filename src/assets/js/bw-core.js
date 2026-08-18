/**
 * BWTools Core Client-Side Utilities
 * Standardised helper routines for zero-upload browser processing.
 * Locale: en-GB
 */
export const BWCore = {
    /**
     * Standardised download trigger conforming to: bwtools_[tool-name]_[timestamp].[ext]
     * @param {Blob|string} blobOrUrl - Blob object or object URL to download
     * @param {string} toolName - Tool identifier slug (e.g., 'image-compressor')
     * @param {string} ext - Target file extension without leading dot (e.g., 'webp', 'pdf')
     */
    download(blobOrUrl, toolName, ext) {
        const isBlob = blobOrUrl instanceof Blob;
        const url = isBlob ? URL.createObjectURL(blobOrUrl) : blobOrUrl;
        const timestamp = Date.now();
        const cleanExt = ext.replace(/^\./, '').toLowerCase();
        const filename = `bwtools_${toolName}_${timestamp}.${cleanExt}`;

        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        if (isBlob) {
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
    },

    /**
     * Binds drag-and-drop and input file selection with visual active states.
     * @param {HTMLElement} dropZoneEl - Target drag-and-drop wrapper
     * @param {HTMLInputElement} fileInputEl - Hidden file input
     * @param {Function} fileCallback - Callback receiving single or array of File objects
     * @param {boolean} [multiple=false] - Whether multiple files are accepted
     */
    bindDropZone(dropZoneEl, fileInputEl, fileCallback, multiple = false) {
        if (!dropZoneEl || !fileInputEl) return;

        const highlight = (e) => {
            e.preventDefault();
            dropZoneEl.classList.add('border-blue-500', 'bg-blue-50/60', 'dark:bg-gray-800/80');
        };

        const unhighlight = (e) => {
            e.preventDefault();
            dropZoneEl.classList.remove('border-blue-500', 'bg-blue-50/60', 'dark:bg-gray-800/80');
        };

        ['dragenter', 'dragover'].forEach(evt => dropZoneEl.addEventListener(evt, highlight, false));
        ['dragleave', 'drop'].forEach(evt => dropZoneEl.addEventListener(evt, unhighlight, false));

        dropZoneEl.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            if (!dt || !dt.files || dt.files.length === 0) return;
            fileCallback(multiple ? Array.from(dt.files) : dt.files[0]);
        });

        fileInputEl.addEventListener('change', (e) => {
            const target = e.target;
            if (!target.files || target.files.length === 0) return;
            fileCallback(multiple ? Array.from(target.files) : target.files[0]);
        });
    },

    /**
     * Updates standardised processing state elements.
     * @param {number} percentage - Integer 0 to 100
     * @param {string} status - Primary title status text
     * @param {string} [subStatus] - Secondary subtitle status text
     */
    setProgress(percentage, status, subStatus) {
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const statusMsg = document.getElementById('statusMessage');
        const subStatusMsg = document.getElementById('subStatusMessage');

        const clamped = Math.min(100, Math.max(0, Math.round(percentage)));

        if (progressBar) progressBar.style.width = `${clamped}%`;
        if (progressPercent) progressPercent.textContent = `${clamped}%`;
        if (statusMsg && status) statusMsg.textContent = status;
        if (subStatusMsg && subStatus) subStatusMsg.textContent = subStatus;
    },

    /**
     * Formats bytes into clean British English metric units.
     * @param {number} bytes 
     * @param {number} [decimals=2] 
     * @returns {string} Formatted size (e.g., '1.42 MB')
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    /**
     * Copy text to clipboard with automated visual button feedback.
     * @param {string} text - Content to copy
     * @param {HTMLButtonElement} [triggerBtn] - Optional button to temporarily restyle
     * @param {string} [feedbackText='Copied!'] 
     */
    async copyToClipboard(text, triggerBtn, feedbackText = 'Copied!') {
        try {
            await navigator.clipboard.writeText(text);
            if (triggerBtn) {
                const originalText = triggerBtn.innerHTML;
                triggerBtn.textContent = feedbackText;
                triggerBtn.classList.add('bg-green-600', 'text-white');
                setTimeout(() => {
                    triggerBtn.innerHTML = originalText;
                    triggerBtn.classList.remove('bg-green-600', 'text-white');
                }, 2000);
            }
            this.toast('Copied to clipboard', 'success');
        } catch {
            this.toast('Failed to copy to clipboard', 'error');
        }
    },

    /**
     * Non-blocking accessible toast notification.
     * @param {string} message 
     * @param {'info'|'success'|'error'} [type='info'] 
     * @param {number} [duration=3000] 
     */
    toast(message, type = 'info', duration = 3000) {
        let container = document.getElementById('bw-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'bw-toast-container';
            container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(container);
        }

        const colours = {
            info: 'bg-gray-900 text-white border-gray-700',
            success: 'bg-emerald-700 text-white border-emerald-600',
            error: 'bg-rose-700 text-white border-rose-600'
        };

        const toast = document.createElement('div');
        toast.className = `px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium border flex items-center gap-2 pointer-events-auto transition-all transform translate-y-2 opacity-0 ${colours[type]}`;
        toast.textContent = message;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Verifies browser hardware and API capabilities before tool execution.
     * @param {Object} requirements 
     * @param {boolean} [requirements.webWorker=false]
     * @param {boolean} [requirements.wasm=false]
     * @param {boolean} [requirements.offscreenCanvas=false]
     * @returns {boolean} True if all required APIs exist
     */
    verifyCapabilities(requirements = {}) {
        const missing = [];
        if (requirements.webWorker && typeof Worker === 'undefined') missing.push('Web Workers');
        if (requirements.wasm && typeof WebAssembly === 'undefined') missing.push('WebAssembly');
        if (requirements.offscreenCanvas && typeof OffscreenCanvas === 'undefined') missing.push('Offscreen Canvas');

        if (missing.length > 0) {
            this.toast(`Your browser does not support: ${missing.join(', ')}. Please update your browser.`, 'error', 6000);
            return false;
        }
        return true;
    }
};