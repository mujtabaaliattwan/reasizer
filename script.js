document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadArea = document.getElementById('upload-area');
    const uploadContent = document.getElementById('upload-content');
    const fileInput = document.getElementById('file-input');
    const selectImageBtn = document.getElementById('select-image-btn');
    const editorContainer = document.getElementById('editor-container');
    const previewImage = document.getElementById('preview-image');
    const originalSize = document.getElementById('original-size');
    const originalDimensions = document.getElementById('original-dimensions');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const maintainAspectRatio = document.getElementById('maintain-aspect-ratio');
    const qualityInput = document.getElementById('quality-input');
    const qualityValue = document.getElementById('quality-value');
    const formatSelect = document.getElementById('format-select');
    const resizeBtn = document.getElementById('resize-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultContainer = document.getElementById('result-container');
    const resultImage = document.getElementById('result-image');
    const newSize = document.getElementById('new-size');
    const newDimensions = document.getElementById('new-dimensions');

    // Variables
    let originalImage = null;
    let aspectRatio = 0;
    let resizedImageUrl = null;

    // Event Listeners
    selectImageBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    widthInput.addEventListener('input', handleWidthChange);
    heightInput.addEventListener('input', handleHeightChange);
    qualityInput.addEventListener('input', updateQualityValue);
    resizeBtn.addEventListener('click', resizeImage);
    downloadBtn.addEventListener('click', downloadImage);
    resetBtn.addEventListener('click', resetEditor);

    // Functions
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && isValidImageFile(file)) {
            processImageFile(file);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadContent.classList.add('highlight');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadContent.classList.remove('highlight');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadContent.classList.remove('highlight');
        
        const file = e.dataTransfer.files[0];
        if (file && isValidImageFile(file)) {
            processImageFile(file);
        }
    }

    function isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
            return false;
        }
        return true;
    }

    function processImageFile(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                originalImage = img;
                aspectRatio = img.width / img.height;
                
                // Display image preview
                previewImage.src = e.target.result;
                
                // Set original image info
                originalSize.textContent = formatFileSize(file.size);
                originalDimensions.textContent = `${img.width} x ${img.height}`;
                
                // Set initial resize values
                widthInput.value = img.width;
                heightInput.value = img.height;
                
                // Show editor
                uploadArea.style.display = 'none';
                editorContainer.style.display = 'grid';
                resultContainer.style.display = 'none';
                downloadBtn.disabled = true;
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }

    function handleWidthChange() {
        if (!originalImage) return;
        
        const width = parseInt(widthInput.value);
        if (isNaN(width) || width <= 0) return;
        
        if (maintainAspectRatio.checked) {
            const height = Math.round(width / aspectRatio);
            heightInput.value = height;
        }
    }

    function handleHeightChange() {
        if (!originalImage) return;
        
        const height = parseInt(heightInput.value);
        if (isNaN(height) || height <= 0) return;
        
        if (maintainAspectRatio.checked) {
            const width = Math.round(height * aspectRatio);
            widthInput.value = width;
        }
    }

    function updateQualityValue() {
        qualityValue.textContent = `${qualityInput.value}%`;
    }

    function resizeImage() {
        if (!originalImage) return;
        
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        const quality = parseInt(qualityInput.value) / 100;
        const format = formatSelect.value;
        
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            alert('Please enter valid dimensions');
            return;
        }
        
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        // Fill the canvas with black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        // Calculate dimensions that maintain aspect ratio
        const originalAspectRatio = originalImage.width / originalImage.height;
        let newWidth, newHeight, x, y;
        
        if (width / height > originalAspectRatio) {
            // The canvas is wider than the original aspect ratio
            newHeight = height;
            newWidth = height * originalAspectRatio;
            x = (width - newWidth) / 2;
            y = 0;
        } else {
            // The canvas is taller than the original aspect ratio
            newWidth = width;
            newHeight = width / originalAspectRatio;
            x = 0;
            y = (height - newHeight) / 2;
        }
        
        // Draw resized image on canvas while maintaining aspect ratio
        ctx.drawImage(originalImage, x, y, newWidth, newHeight);
        
        // Convert canvas to image data URL
        let mimeType;
        switch(format) {
            case 'jpeg':
                mimeType = 'image/jpeg';
                break;
            case 'png':
                mimeType = 'image/png';
                break;
            case 'webp':
                mimeType = 'image/webp';
                break;
            default:
                mimeType = 'image/jpeg';
        }
        
        // Get resized image as data URL
        resizedImageUrl = canvas.toDataURL(mimeType, quality);
        
        // Display resized image
        resultImage.src = resizedImageUrl;
        resultContainer.style.display = 'block';
        
        // Calculate new file size (approximate)
        const base64Data = resizedImageUrl.split(',')[1];
        const binaryData = atob(base64Data);
        const newFileSize = binaryData.length;
        
        // Update info
        newSize.textContent = formatFileSize(newFileSize);
        newDimensions.textContent = `${width} x ${height}`;
        
        // Enable download button
        downloadBtn.disabled = false;
    }

    function downloadImage() {
        if (!resizedImageUrl) return;
        
        const format = formatSelect.value;
        const link = document.createElement('a');
        
        link.href = resizedImageUrl;
        link.download = `resized-image.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function resetEditor() {
        // Reset the editor to initial state
        uploadArea.style.display = 'block';
        editorContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        
        // Clear image data
        previewImage.src = '';
        resultImage.src = '';
        originalImage = null;
        resizedImageUrl = null;
        
        // Reset form values
        fileInput.value = '';
        widthInput.value = '';
        heightInput.value = '';
        qualityInput.value = 90;
        updateQualityValue();
        formatSelect.value = 'jpeg';
        
        // Reset info displays
        originalSize.textContent = '0 KB';
        originalDimensions.textContent = '0 x 0';
        newSize.textContent = '0 KB';
        newDimensions.textContent = '0 x 0';
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1048576) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return (bytes / 1048576).toFixed(2) + ' MB';
        }
    }
});