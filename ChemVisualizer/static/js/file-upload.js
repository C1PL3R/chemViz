document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('sdf-upload');
    const fileUploadBox = document.querySelector('.file-upload-box');
    const fileNameDisplay = document.querySelector('.file-name');
    const fileSizeDisplay = document.querySelector('.file-size');
    const form = document.querySelector('form');

    const MAX_FILE_SIZE_KB = 100;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024;

    const updateFileInfo = (file) => {
        if (file) {
            if (!file.name.toLowerCase().endsWith('.sdf')) {
                alert('Будь ласка, оберіть файл з розширенням .sdf');
                fileNameDisplay.textContent = 'Перетягніть файл .sdf сюди або клікніть';
                fileSizeDisplay.textContent = '';
                fileInput.value = '';
                return false;
            }

            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert(`Розмір файлу завеликий! Максимальний розмір: ${MAX_FILE_SIZE_KB} KB.`);
                fileNameDisplay.textContent = 'Перетягніть файл .sdf сюди або клікніть';
                fileSizeDisplay.textContent = '';
                fileInput.value = '';
                return false;
            }

            fileNameDisplay.textContent = file.name;
            const fileSizeKB = (file.size / 1024).toFixed(1);
            fileSizeDisplay.textContent = `${fileSizeKB} KB`;

            return true;
        } else {
            fileNameDisplay.textContent = 'Перетягніть файл .sdf сюди або клікніть';
            fileSizeDisplay.textContent = '';
            return false;
        }
    };

    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            updateFileInfo(files[0]);
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUploadBox.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        fileUploadBox.addEventListener(eventName, () => {
            fileUploadBox.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileUploadBox.addEventListener(eventName, () => {
            fileUploadBox.classList.remove('drag-over');
        }, false);
    });

    fileUploadBox.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const selectedFile = files[0];
            const isValidFile = updateFileInfo(selectedFile);

            if (isValidFile) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(selectedFile);
                fileInput.files = dataTransfer.files;
            } else {
                fileInput.value = '';
            }
        }
    }, false);
});