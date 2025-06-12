document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURATION & DATA ---
    const photos = [
        { src: '/res/1.png', orientation: 'landscape'  },
        { src: '/res/2.png',  orientation: 'portrait'  },
        { src: '/res/3.png', orientation: 'landscape'  },
        { src: '/res/4.png', orientation: 'portrait' },
    ];

    const carousel = document.getElementById('photo-carousel');
    const modal = document.getElementById('photo-modal');
    const modalContent = document.getElementById('modal-content');
    const enlargedPhoto = document.getElementById('enlarged-photo');
    const closeBtn = document.getElementById('close-btn');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const body = document.getElementById('page-body');

    let activePhotoElement = null;

    // --- 2. INITIALIZE CAROUSEL ---
    // Create and add all photo elements to the DOM
    photos.forEach(photo => {
        const photoDiv = document.createElement('div');
        photoDiv.className = `photo-item ${photo.orientation}`;

        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = 'Instant wedding photo';
        img.loading = 'lazy'; // Lazy load images for better performance

        photoDiv.appendChild(img);
        carousel.appendChild(photoDiv);

        // Add click listener to open the modal
        photoDiv.addEventListener('click', () => openModal(photo, photoDiv));
    });

    // --- 3. MODAL FUNCTIONALITY ---

    /**
     * Opens the modal with a smooth animation originating from the clicked photo.
     * @param {object} photo - The photo object with src and orientation.
     * @param {HTMLElement} element - The DOM element of the clicked photo.
     */
    function openModal(photo, element) {
        activePhotoElement = element;
        const rect = element.getBoundingClientRect(); // Get position of the clicked image

        // Set the enlarged photo source
        enlargedPhoto.src = photo.src;

        // Create a temporary clone for the animation
        const clone = element.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.top = `${rect.top}px`;
        clone.style.left = `${rect.left}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.margin = '0';
        clone.style.transition = 'all 0.4s cubic-bezier(0.65, 0, 0.35, 1)';
        clone.style.zIndex = '1001';

        document.body.appendChild(clone);

        // Hide original element and show the modal overlay
        element.style.visibility = 'hidden';
        modal.classList.add('show');
        body.classList.add('modal-open');

        // Animate the clone to the center
        requestAnimationFrame(() => {
            const viewportCenterX = window.innerWidth / 2;
            const viewportCenterY = window.innerHeight / 2;

            // Temporarily set the final image to get its scaled dimensions
            enlargedPhoto.style.visibility = 'hidden';
            modalContent.style.display = 'block';
            const finalRect = enlargedPhoto.getBoundingClientRect();
            modalContent.style.display = '';
            enlargedPhoto.style.visibility = '';

            const finalWidth = finalRect.width;
            const finalHeight = finalRect.height;

            clone.style.top = `${viewportCenterY - finalHeight / 2}px`;
            clone.style.left = `${viewportCenterX - finalWidth / 2}px`;
            clone.style.width = `${finalWidth}px`;
            clone.style.height = `${finalHeight}px`;
        });

        // When animation is done, show the real modal content and remove clone
        clone.addEventListener('transitionend', () => {
            modalContent.style.visibility = 'visible';
            modalContent.style.opacity = '1';
            clone.remove();
        }, { once: true });

        // Update the download link and share data
        downloadBtn.onclick = () => downloadImage(photo.src);
        shareBtn.onclick = () => shareImage(photo.src);
    }

    /**
     * Closes the modal with a reverse animation back to the original photo's position.
     */
    function closeModal() {
        if (!activePhotoElement) return;

        const startRect = enlargedPhoto.getBoundingClientRect();
        const endRect = activePhotoElement.getBoundingClientRect();

        // Create a clone for the closing animation
        const clone = enlargedPhoto.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.top = `${startRect.top}px`;
        clone.style.left = `${startRect.left}px`;
        clone.style.width = `${startRect.width}px`;
        clone.style.height = `${startRect.height}px`;
        clone.style.margin = '0';
        clone.style.padding = '0';
        clone.style.transition = 'all 0.4s cubic-bezier(0.65, 0, 0.35, 1)';
        clone.style.zIndex = '1001';

        document.body.appendChild(clone);

        // Hide the modal content immediately
        modalContent.style.visibility = 'hidden';
        modalContent.style.opacity = '0';
        modal.classList.remove('show');
        body.classList.remove('modal-open');

        // Animate the clone back to the original position
        requestAnimationFrame(() => {
            clone.style.top = `${endRect.top}px`;
            clone.style.left = `${endRect.left}px`;
            clone.style.width = `${endRect.width}px`;
            clone.style.height = `${endRect.height}px`;
        });

        // When animation is done, remove the clone and show the original photo
        clone.addEventListener('transitionend', () => {
            activePhotoElement.style.visibility = 'visible';
            clone.remove();
            activePhotoElement = null;
        }, { once: true });
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { // Close if clicking on the overlay itself
            closeModal();
        }
    });

    // --- 4. ACTION BUTTONS ---

    /**
     * Downloads the image using the Fetch API to handle potential cross-origin issues.
     * @param {string} imageUrl - The URL of the image to download.
     */
    async function downloadImage(imageUrl) {
        try {
            // Use a CORS proxy for Unsplash images if needed, or fetch directly
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'gizem-davide-wedding.jpg'; // Desired filename
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Download failed:', error);
            alert('Sorry, the photo could not be downloaded.');
        }
    }

    /**
     * Shares the image using the Web Share API with a fallback.
     * @param {string} imageUrl - The URL of the image to share.
     */
    async function shareImage(imageUrl) {
        const shareData = {
            title: 'Gizem & Davide\'s Wedding',
            text: 'Check out this photo from our wedding party!',
            url: window.location.href // Share a link to the page
        };

        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.error('Sharing failed:', error);
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(imageUrl).then(() => {
                alert('Link to the photo has been copied to your clipboard!');
            }, () => {
                alert('Could not copy link. Please share manually.');
            });
        }
    }
});