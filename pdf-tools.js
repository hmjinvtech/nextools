const { PDFDocument, PDFPage, rgb } = PDFLib;

// PDF Tool Switching
function switchPdfTool(toolName) {
    document.querySelectorAll('.pdf-tool').forEach(tool => {
        tool.classList.remove('active');
    });
    document.getElementById(toolName + '-tool').classList.add('active');

    document.querySelectorAll('.tool-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ===== PDF VIEWER =====
let pdfDoc = null;
let currentPage = 1;

async function loadPDF(event) {
    const file = event.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    currentPage = 1;
    displayPDFPage();

    document.getElementById('pdfControls').style.display = 'flex';
}

async function displayPDFPage() {
    if (!pdfDoc) return;
    
    const page = pdfDoc.getPage(currentPage - 1);
    const { width, height } = page.getSize();
    
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    const preview = document.getElementById('pdfPreview');
    preview.innerHTML = '';
    preview.appendChild(canvas);
    
    document.getElementById('pageInfo').textContent = 
        `Page ${currentPage} of ${pdfDoc.getPageCount()}`;
}

function nextPage() {
    if (pdfDoc && currentPage < pdfDoc.getPageCount()) {
        currentPage++;
        displayPDFPage();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPDFPage();
    }
}

// ===== MERGE PDFs =====
let filesToMerge = [];

async function addMergeFiles(event) {
    const files = Array.from(event.target.files);
    filesToMerge = files;
    displayMergeList();
}

function displayMergeList() {
    const list = document.getElementById('mergeList');
    list.innerHTML = '';
    
    filesToMerge.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <span>${index + 1}. ${file.name}</span>
            <button onclick="removeMergeFile(${index})">Remove</button>
        `;
        list.appendChild(item);
    });
}

function removeMergeFile(index) {
    filesToMerge.splice(index, 1);
    displayMergeList();
}

async function mergePDFs() {
    if (filesToMerge.length < 2) {
        alert('Please select at least 2 PDFs to merge');
        return;
    }

    try {
        const mergedPdf = await PDFLib.PDFDocument.create();

        for (const file of filesToMerge) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        downloadPDF(pdfBytes, 'merged.pdf');
        filesToMerge = [];
        document.getElementById('mergeFiles').value = '';
        document.getElementById('mergeList').innerHTML = '';
    } catch (error) {
        alert('Error merging PDFs: ' + error.message);
    }
}

// ===== IMAGE TO PDF =====
let imagesToProcess = [];

async function addImages(event) {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagesToProcess.push({
                name: file.name,
                data: e.target.result
            });
            displayImageList();
        };
        reader.readAsDataURL(file);
    }
}

function displayImageList() {
    const list = document.getElementById('imageList');
    list.innerHTML = '';
    
    imagesToProcess.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.innerHTML = `
            <span>${index + 1}. ${img.name}</span>
            <button onclick="removeImage(${index})">Remove</button>
        `;
        list.appendChild(item);
    });
}

function removeImage(index) {
    imagesToProcess.splice(index, 1);
    displayImageList();
}

async function imagesToPDF() {
    if (imagesToProcess.length === 0) {
        alert('Please select at least one image');
        return;
    }

    try {
        const pdf = await PDFLib.PDFDocument.create();

        for (const img of imagesToProcess) {
            let imageData;
            
            if (img.data.includes('data:image/png')) {
                imageData = await pdf.embedPng(img.data);
            } else if (img.data.includes('data:image/jpeg')) {
                imageData = await pdf.embedJpg(img.data);
            } else {
                continue;
            }

            const page = pdf.addPage([imageData.width, imageData.height]);
            page.drawImage(imageData, { x: 0, y: 0, width: imageData.width, height: imageData.height });
        }

        const pdfBytes = await pdf.save();
        downloadPDF(pdfBytes, 'images.pdf');
        imagesToProcess = [];
        document.getElementById('imageFiles').value = '';
        document.getElementById('imageList').innerHTML = '';
    } catch (error) {
        alert('Error creating PDF: ' + error.message);
    }
}

// ===== ROTATE PDF =====
let rotatePDF = null;
let rotatePageCount = 0;

async function loadRotatePDF(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const arrayBuffer = await file.arrayBuffer();
        rotatePDF = await PDFLib.PDFDocument.load(arrayBuffer);
        rotatePageCount = rotatePDF.getPageCount();

        const preview = document.getElementById('rotatePreview');
        preview.innerHTML = `<p style="color: #d4a574;">Loaded ${rotatePageCount} pages</p>`;
        document.getElementById('rotateControls').style.display = 'flex';
    } catch (error) {
        alert('Error loading PDF: ' + error.message);
    }
}

async function applyRotation() {
    if (!rotatePDF) {
        alert('Please load a PDF first');
        return;
    }

    try {
        const angle = parseInt(document.getElementById('rotationAngle').value);
        const pages = rotatePDF.getPages();

        pages.forEach((page) => {
            const currentRotation = page.getRotation().angle || 0;
            page.setRotation(PDFLib.degrees(currentRotation + angle));
        });

        const pdfBytes = await rotatePDF.save();
        downloadPDF(pdfBytes, 'rotated.pdf');
        rotatePDF = null;
        document.getElementById('rotateFile').value = '';
        document.getElementById('rotateControls').style.display = 'none';
    } catch (error) {
        alert('Error rotating PDF: ' + error.message);
    }
}

// ===== DELETE PAGES =====
let deletePDF = null;
let deletePageCount = 0;

async function loadDeletePDF(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const arrayBuffer = await file.arrayBuffer();
        deletePDF = await PDFLib.PDFDocument.load(arrayBuffer);
        deletePageCount = deletePDF.getPageCount();

        const preview = document.getElementById('deletePreview');
        preview.innerHTML = `<p style="color: #d4a574;">Loaded ${deletePageCount} pages. Enter pages to delete (1-indexed)</p>`;
        document.getElementById('deleteControls').style.display = 'flex';
    } catch (error) {
        alert('Error loading PDF: ' + error.message);
    }
}

async function applyDelete() {
    if (!deletePDF) {
        alert('Please load a PDF first');
        return;
    }

    try {
        const input = document.getElementById('pagesToDelete').value;
        const pagesToDelete = input.split(',').map(p => parseInt(p.trim()) - 1).filter(p => p >= 0);

        // Sort in reverse to delete from end first
        pagesToDelete.sort((a, b) => b - a);

        for (const pageIndex of pagesToDelete) {
            if (pageIndex < deletePageCount) {
                deletePDF.removePage(pageIndex);
            }
        }

        const pdfBytes = await deletePDF.save();
        downloadPDF(pdfBytes, 'deleted.pdf');
        deletePDF = null;
        document.getElementById('deleteFile').value = '';
        document.getElementById('pagesToDelete').value = '';
        document.getElementById('deleteControls').style.display = 'none';
    } catch (error) {
        alert('Error deleting pages: ' + error.message);
    }
}

// ===== UTILITY =====
function downloadPDF(bytes, filename) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
