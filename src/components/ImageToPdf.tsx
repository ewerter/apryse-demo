import { useState, useRef, useEffect } from "react";
import { apryseConfig } from '../config/apryse';
import WebViewer from '@pdftron/webviewer';

const ImageToPdf = () => {
    const [images, setImages] = useState<File[]>([]);
    const [converting, setConverting] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const apryseLicenseKey = apryseConfig.licenseKey;
    const viewerRef = useRef<any>(null);

     useEffect(() => {
        const initWebViewer = async () => {
            try {
                // Create a hidden div for WebViewer
                const hiddenDiv = document.createElement('div');
                hiddenDiv.style.display = 'none';
                document.body.appendChild(hiddenDiv);

                const instance = await WebViewer({
                    path: '/lib/webviewer',
                    licenseKey: apryseLicenseKey,
                    fullAPI: true,
                }, hiddenDiv);

                viewerRef.current = instance;
                console.log('WebViewer initialized for conversion');
            } catch (error) {
                console.error('Failed to initialize WebViewer:', error);
            }
        };

        initWebViewer();

        return () => {
            // Cleanup
            if (viewerRef.current) {
                viewerRef.current.UI.dispose();
            }
        };
    }, []);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/') || ['image/jpeg', 'image/png', 'image/gif'].includes(file.type));
        setImages(prev => [...prev, ...imageFiles]);
        setDownloadUrl(null);
    };
    
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };


    const handleConvertToPdf = async () => {
        if (images.length === 0) return;
        setConverting(true);
        setDownloadUrl(null);

        try {
            const {Core} = viewerRef.current;
            await Core.PDFNet.initialize(apryseLicenseKey);
            const pdfDoc = await Core.PDFNet.PDFDoc.create();

            for (const imageFile of images) {
                let image;
                try {
                const base64Data = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const result = e.target?.result as string;
                        resolve(result.split(',')[1]);
                    };
                    reader.readAsDataURL(imageFile);
                });

                image = await Core.PDFNet.Image.createFromURL(
                    pdfDoc,
                    `data:${imageFile.type};base64,${base64Data}`
                );
            } catch (urlError) {
                console.log('createFromURL failed, trying memory approach:', urlError);
                const arrayBuffer = await imageFile.arrayBuffer();
                const imageData = new Uint8Array(arrayBuffer);
                const blobUrl = URL.createObjectURL(imageFile);
                image = await Core.PDFNet.Image.createFromURL(pdfDoc, blobUrl);
                URL.revokeObjectURL(blobUrl);
            }

                //const arrayBuffer = await imageFile.arrayBuffer();
                //const imageData = new Uint8Array(arrayBuffer);
                //const image = await Core.PDFNet.Image.createFromMemory2(pdfDoc, imageData, imageData.length );

                //log
                if (!image) {
                    console.error("Failed to create image object");
                    continue;
                }   
                
                const imageWidth = await image.getImageWidth();
                const imageHeight = await image.getImageHeight();
                const pageWidth = 612;
                const pageHeight = 792;
                console.log(`Image dimensions: ${imageWidth}x${imageHeight}`);

                const pageRect = await Core.PDFNet.Rect.init(0, 0, pageWidth, pageHeight);

                const page = await pdfDoc.pageCreate(pageRect);

                const writer = await Core.PDFNet.ElementWriter.create();
                await writer.beginOnPage(page);

                const builder = await Core.PDFNet.ElementBuilder.create();

                const maxWidth = pageWidth - 100;  
                const scale = maxWidth / imageWidth;
                const scaledHeight = imageHeight * scale;

                const x = 50;  // left margin
                const y = pageHeight - scaledHeight - 50;

                const imageElement = await builder.createImageScaled(image,
                x,           
                y,           
                maxWidth,    
                scaledHeight); 

                await writer.writeElement(imageElement);
                await writer.end();
                await pdfDoc.pagePushBack(page);
            }

        
        const pdfBuffer = await pdfDoc.saveMemoryBuffer(Core.PDFNet.SDFDoc.SaveOptions.e_linearized);

        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        console.log(`Successfully converted ${images.length} images to PDF`);
            
        } catch (error) {
             console.error('Conversion failed:', error);
            alert(`Conversion failed: ${error.message || 'Unknown error'}`);
            
        }

        // Test if WebViewer is properly initialized
        console.log("WebViewer ready:", !!viewerRef.current);
        console.log("Core available:", viewerRef.current?.Core ? "Yes" : "No");
        console.log("PDFNet available:", viewerRef.current?.Core?.PDFNet ? "Yes" : "No");

        
    };
    return(
            <div className="converter-container">
                    <h2>Image to PDF Converter</h2>
                    
                    {/* File selection */}
                    <div className="upload-section">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={converting}
                        >
                            Select Images
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleImageUpload}
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Selected images list */}
                    {images.length > 0 && (
                        <div className="images-list">
                            <h3>Selected Images ({images.length})</h3>
                            {images.map((img, index) => (
                                <div key={index} className="image-item">
                                    <span>{img.name}</span>
                                    <button 
                                        onClick={() => removeImage(index)}
                                        disabled={converting}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            
                            <button 
                                onClick={handleConvertToPdf}
                                disabled={converting}
                            >
                                {converting ? 'Converting...' : `Convert ${images.length} images to PDF`}
                            </button>
                        </div>
                    )}

                    {/* Download link */}
                    {downloadUrl && (
                        <div className="download-section">
                            <a 
                                href={downloadUrl}
                                download="converted.pdf"
                            >
                                Download PDF
                            </a>
                        </div>
                    )}
        </div>
        );
}

export default ImageToPdf;