const { PDFDocument, PDFPage, rgb } = PDFLib;

// Set up pdf.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

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
let pdfDocViewer = null;
let currentPage = 1;

async function loadPDF(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const arrayBuffer = await file.arrayBuffer();
        pdfDocViewer = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        currentPage = 1;
        await displayPDFPage();
        document.getElementById('pdfControls').style.display = 'flex';
    } catch (error) {
        alert('Error loading PDF: ' + error.message);
    }
}

async function displayPDFPage() {
    if (!pdfDocViewer) return;
    
    try {
        const page = await pdfDocViewer.getPage(currentPage);
        const viewport = page.getViewport({ scale: 2 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        const preview = document.getElementById('pdfPreview');
        preview.innerHTML = '';
        preview.appendChild(canvas);
        
        document.getElementById('pageInfo').textContent = 
            `Page ${currentPage} of ${pdfDocViewer.numPages}`;
    } catch (error) {
        alert('Error displaying page: ' + error.message);
    }
}

function nextPage() {
    if (pdfDocViewer && currentPage < pdfDocViewer.numPages) {
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

// ===== PDF ANALYZER =====
async function analyzePDF(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        // Get file size
        const fileSize = (file.size / (1024 * 1024)).toFixed(2);
        
        // Load PDF with pdf.js
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdfDoc.numPages;
        
        // Extract text from all pages
        let fullText = '';
        for (let i = 1; i <= pageCount; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }
        
        // Calculate statistics
        const words = fullText.trim().split(/\s+/).length;
        const characters = fullText.length;
        
        // Display results
        document.getElementById('pdfPages').textContent = pageCount;
        document.getElementById('pdfSize').textContent = fileSize + ' MB';
        document.getElementById('pdfWords').textContent = words;
        document.getElementById('pdfChars').textContent = characters;
        document.getElementById('extractedText').value = fullText;
        document.getElementById('analyzerStats').style.display = 'block';
        
    } catch (error) {
        alert('Error analyzing PDF: ' + error.message);
    }
}

function copyExtractedText() {
    const text = document.getElementById('extractedText').value;
    if (!text) {
        alert('No text to copy');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Text copied to clipboard!');
    }).catch(err => {
        alert('Error copying text: ' + err);
    });
}

function downloadExtractedText() {
    const text = document.getElementById('extractedText').value;
    if (!text) {
        alert('No text to download');
        return;
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted_text.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ===== PDF SPLITTER =====
let splitPdfDoc = null;
let splitPageCount = 0;

async function loadSplitPDF(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const arrayBuffer = await file.arrayBuffer();
        splitPdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        splitPageCount = splitPdfDoc.getPageCount();
        
        document.getElementById('splitterPageCount').textContent = splitPageCount;
        document.getElementById('splitterInfo').style.display = 'block';
    } catch (error) {
        alert('Error loading PDF: ' + error.message);
    }
}

async function splitPDF() {
    if (!splitPdfDoc) {
        alert('Please upload a PDF first');
        return;
    }

    const rangesInput = document.getElementById('pageRanges').value.trim();
    if (!rangesInput) {
        alert('Please enter page ranges (e.g., 1-2, 3-5, 6-10)');
        return;
    }

    try {
        // Parse ranges
        const ranges = rangesInput.split(',').map(r => r.trim());
        const validRanges = [];

        for (const range of ranges) {
            if (range.includes('-')) {
                const [start, end] = range.split('-').map(x => parseInt(x.trim()));
                if (isNaN(start) || isNaN(end)) {
                    alert(`Invalid range: ${range}`);
                    return;
                }
                if (start < 1 || end > splitPageCount || start > end) {
                    alert(`Invalid range: ${range}. Pages must be between 1 and ${splitPageCount}`);
                    return;
                }
                validRanges.push({ start: start - 1, end: end - 1, label: `pages_${start}-${end}` });
            } else {
                const page = parseInt(range);
                if (isNaN(page) || page < 1 || page > splitPageCount) {
                    alert(`Invalid page number: ${page}. Must be between 1 and ${splitPageCount}`);
                    return;
                }
                validRanges.push({ start: page - 1, end: page - 1, label: `page_${page}` });
            }
        }

        // Create PDFs for each range
        for (let i = 0; i < validRanges.length; i++) {
            const range = validRanges[i];
            const newPdf = await PDFLib.PDFDocument.create();
            
            // Create array of page indices to copy
            const pageIndices = [];
            for (let pageNum = range.start; pageNum <= range.end; pageNum++) {
                pageIndices.push(pageNum);
            }
            
            // Copy pages using copyPages method
            const copiedPages = await newPdf.copyPages(splitPdfDoc, pageIndices);
            copiedPages.forEach((page) => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            downloadPDF(pdfBytes, `split_${range.label}.pdf`);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        alert(`✅ ${validRanges.length} PDF(s) created and downloading!`);
        document.getElementById('splitterFile').value = '';
        document.getElementById('pageRanges').value = '';
    } catch (error) {
        alert('Error splitting PDF: ' + error.message);
    }
}
