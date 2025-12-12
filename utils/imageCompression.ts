
export const compressImage = async (file: File, maxWidth: number, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        // Create Object URL for the file
        const objectUrl = URL.createObjectURL(file);
        image.src = objectUrl;

        image.onload = () => {
            // Clean up the URL object to free memory immediately
            URL.revokeObjectURL(objectUrl);

            const canvas = document.createElement('canvas');
            let width = image.width;
            let height = image.height;

            // Calculate new dimensions keeping aspect ratio
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                reject(new Error("Canvas context unavailable"));
                return;
            }

            // Draw image on canvas
            ctx.drawImage(image, 0, 0, width, height);

            // Convert to JPEG with compression (JPEG is safer than WebP for mobile uploads)
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Compression failed"));
                    return;
                }
                // Force .jpg extension for compatibility
                const newName = file.name.split('.')[0].replace(/[^a-z0-9]/gi, '_') + ".jpg";
                
                const compressedFile = new File([blob], newName, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                });
                resolve(compressedFile);
            }, 'image/jpeg', quality);
        };
        
        image.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(err);
        };
    });
};