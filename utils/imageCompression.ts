export const compressImage = async (file: File, maxWidth: number, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
        const image = new Image();

        const objectUrl = URL.createObjectURL(file);
        image.src = objectUrl;

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);

            const canvas = document.createElement('canvas');
            let width = image.width;
            let height = image.height;

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

            ctx.drawImage(image, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Compression failed"));
                    return;
                }
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