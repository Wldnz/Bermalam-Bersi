
export default function DownloadQRCodeHandler(
    id : string,
    downloadName : string,
) {
    const containerDiv = document.getElementById(id);
    const canvas = containerDiv?.querySelector('canvas');

    if (canvas) {
        const link = document.createElement('a');
        document.body.appendChild(link);
        
        link.href = canvas.toDataURL("image/png");
        link.download = downloadName;
        link.click();
        
        document.body.removeChild(link);
    }
}