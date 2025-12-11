
export const compressImage = async (file: File, maxWidth: number, quality: number = 0.5): Promise<File> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
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

            // Convert to WebP with aggressive compression
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Compression failed"));
                    return;
                }
                // Force .webp extension
                const compressedFile = new File([blob], file.name.split('.')[0] + ".webp", {
                    type: "image/webp",
                    lastModified: Date.now(),
                });
                resolve(compressedFile);
            }, 'image/webp', quality);
        };
        image.onerror = (err) => reject(err);
    });
};