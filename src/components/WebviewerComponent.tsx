import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import { apryseConfig } from '../config/apryse';


const WebviewerComponent = ({ documentUrl, viewerSize, showUIComponents }) => {
    const viewer = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);
    const instanceRef = useRef<any>(null);
    const [webViewerInstance, setWebViewerInstance] = useState(null);
    const [loading, setLoading] = useState(true);
    //const isDevelopment = process.env.NODE_ENV === 'development';

    useEffect(() => {
        if (isInitialized.current && !viewer.current) return;

        const initializeWebViewer = async () => {
            try {
                setLoading(true);
                const instance = await WebViewer({
                    path: '/lib/webviewer',
                    initialDoc: documentUrl,
                    licenseKey: apryseConfig.licenseKey,
                    enableFilePicker: true,
                    disabledElements: [
                        'header',
                        'viewControlsButton',
                        'leftPanel'
                    ],
                    enableRedaction: true,
                    enableMeasurement: true,
                }, viewer.current);

                setWebViewerInstance(instance);
                isInitialized.current = true;
                instanceRef.current = instance;

                //check additional features
                instance.UI.enableFeatures([
                instance.UI.Feature.ContentEdit,
                instance.UI.Feature.Annotations
                ]);

                //simulate loading overlay delay
                setTimeout(() => {
                    console.log('initialization completed');
                    setLoading(false);
                    }, 300);

                //check if document is loaded
                instance.UI.addEventListener('documentLoaded', () => {
                console.log('Document loaded successfully');
                setLoading(false);
                });
            } catch (error) {
                console.error('Error initializing WebViewer:', error);
                setLoading(false);
            }
        };

        initializeWebViewer();

        return () => {
            if (instanceRef.current) {
                console.log('Disposing WebViewer instance');
                instanceRef.current.UI.dispose();
                instanceRef.current = null;
                isInitialized.current = false;
            }         
        };
    },[]);

    //document change effect
    useEffect(() => {
        if (webViewerInstance && documentUrl) {
            webViewerInstance.UI.loadDocument(documentUrl);
        }
    }, [documentUrl, webViewerInstance]);

    //visibility change effect
    useEffect(() => {
        if (webViewerInstance) {
            const elementsHeader = ['header', 'toolsHeader'];
            elementsHeader.forEach(element => {
            //webViewerInstance.UI.setElementVisibility(element, showUIComponents);
            });
        }
    }, [showUIComponents, webViewerInstance]);

    return (
         <div className="webviewer-wrapper">
                {loading && (
                    <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading WebViewer...</p>
                    </div>
                )}
                <div 
                    className="webviewer" 
                    ref={viewer}
                    style={{
                    width: viewerSize.width,
                    height: viewerSize.height,
                    minHeight: '500px'
                    }}
                ></div>
            </div>

    );

    };

export default WebviewerComponent;