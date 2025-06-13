// Photo data with different orientations and captions
const photos = [
    { id: 1, orientation: 'portrait'},
    { id: 3, orientation: 'landscape'},
    { id: 5, orientation: 'landscape'},
    { id: 7, orientation: 'landscape'},
    { id: 9, orientation: 'landscape'},
    { id: 11, orientation: 'portrait'},
    { id: 13, orientation: 'portrait'},
    { id: 15, orientation: 'landscape'},
    { id: 17, orientation: 'landscape'},
    { id: 19, orientation: 'landscape'},
    { id: 21, orientation: 'portrait'},
    { id: 23, orientation: 'landscape'},
    { id: 25, orientation: 'landscape'},
    { id: 27, orientation: 'portrait'},
    { id: 29, orientation: 'landscape'},
    { id: 31, orientation: 'landscape'},
    { id: 33, orientation: 'portrait'},
    { id: 35, orientation: 'portrait'},
    { id: 2, orientation: 'landscape'},
    { id: 4, orientation: 'landscape'},
    { id: 6, orientation: 'landscape'},
    { id: 8, orientation: 'landscape'},
    { id: 10, orientation: 'landscape'},
    { id: 12, orientation: 'landscape'},
    { id: 14, orientation: 'landscape'},
    { id: 16, orientation: 'landscape'},
    { id: 18, orientation: 'portrait'},
    { id: 20, orientation: 'portrait'},
    { id: 22, orientation: 'landscape'},
    { id: 24, orientation: 'portrait'},
    { id: 26, orientation: 'landscape'},
    { id: 28, orientation: 'landscape'},
    { id: 30, orientation: 'landscape'},
    { id: 32, orientation: 'landscape'},
    { id: 34, orientation: 'portrait'},
    { id: 36, orientation: 'portrait'},
    { id: 37, orientation: 'landscape'},
];

let currentPhotoId = null;
let originalScrollbarWidth = 0;

function getScrollbarWidth() {
    // Create a temporary div
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // Enable scrollbar
    document.body.appendChild(outer);

    // Create inner div
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculate scrollbar width
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

    // Remove temporary divs
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
}

// Generate photo cards
function generatePhotoCards() {
    const photoGrid = document.getElementById('photoGrid');

    photos.forEach(photo => {
        const card = document.createElement('div');
        card.className = `photo-card ${photo.orientation}`;
        card.onclick = () => openFullscreen(photo.id);

        card.innerHTML = `
                    <div class="photo-placeholder">
                        <img src="/res/${photo.id}.png" style="width: 92%; height: 92%; object-fit: cover;" loading="lazy">
                    </div>
                `;

        photoGrid.appendChild(card);
    });
}

// Open fullscreen view with animation
function openFullscreen(photoId) {
    currentPhotoId = photoId;
    const photo = photos.find(p => p.id === photoId);
    const overlay = document.getElementById('fullscreenOverlay');
    const fullscreenPhoto = document.getElementById('fullscreenPhoto');
    const content = document.getElementById('fullscreenContent');
    const carouselContainer = document.getElementById('carouselContainer');

    // Set photo orientation class
    fullscreenPhoto.className = `fullscreen-photo ${photo.orientation}`;

    // Update content
    content.innerHTML = `<img src="/res/${photo.id}.png" style="width: 100%; height: auto; object-fit: cover; padding: 0px 10px;">`;

    // Show overlay and blur background
    overlay.classList.add('active');
    carouselContainer.classList.add('blurred');

    // Prevent body scroll
    document.body.style.paddingRight = `${originalScrollbarWidth}px`;
    document.body.style.overflow = 'hidden';

    fullscreenPhoto.classList.add('active');
}

// Close fullscreen view with reverse animation
function closeFullscreen() {
    const overlay = document.getElementById('fullscreenOverlay');
    const carouselContainer = document.getElementById('carouselContainer');
    const fullscreenPhoto = document.getElementById('fullscreenPhoto');

    // Hide overlay and remove blur
    fullscreenPhoto.classList.remove('active');
    overlay.classList.remove('active');
    carouselContainer.classList.remove('blurred');

    // Restore body scroll
    document.body.style.paddingRight = 0;
    document.body.style.overflow = 'auto';

    currentPhotoId = null;
}

// Download photo function
function downloadPhoto() {
    if (!currentPhotoId) return;

    const photo = photos.find(p => p.id === currentPhotoId);

    // Create a temporary image to check if the file exists
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = function () {
        // Create a canvas to generate the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions based on orientation
        if (photo.orientation === 'portrait') {
            canvas.width = 580;
            canvas.height = 910;
        } else {
            canvas.width = 910;
            canvas.height = 580;
        }

        // Draw the image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Create download link
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gizem-davide-wedding-photo-${photo.id}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showSuccessMessage('Photo downloaded successfully!');
        });
    };

    img.onerror = function () {
        // Fallback: create a placeholder image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (photo.orientation === 'portrait') {
            canvas.width = 580;
            canvas.height = 910;
        } else {
            canvas.width = 910;
            canvas.height = 580;
        }

        // Create gradient fallback
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#4ecdc4');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.fillText(`Photo ${photo.id}`, canvas.width / 2, canvas.height / 2);

        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gizem-davide-wedding-photo-${photo.id}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showSuccessMessage('Photo downloaded successfully!');
        });
    };

    img.src = photo.imagePath;
}

// Share photo function
function sharePhoto() {
    if (!currentPhotoId) return;

    const photo = photos.find(p => p.id === currentPhotoId);

    if (navigator.share) {
        // Use native sharing if available
        navigator.share({
            title: `Gizem & Davide Wedding - ${photo.caption}`,
            text: `Check out this beautiful wedding photo: ${photo.caption}`,
            url: window.location.href
        }).then(() => {
            showSuccessMessage('Photo shared successfully!');
        }).catch(err => {
            fallbackShare(photo);
        });
    } else {
        fallbackShare(photo);
    }
}

// Fallback share function
function fallbackShare(photo) {
    const shareText = `Check out this beautiful wedding photo from Gizem & Davide's wedding: ${photo.caption}`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            showSuccessMessage('Share text copied to clipboard!');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccessMessage('Share text copied to clipboard!');
    }
}

// Close fullscreen when clicking outside the photo
document.getElementById('fullscreenOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        closeFullscreen();
    }
});

// Close fullscreen with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && currentPhotoId) {
        closeFullscreen();
    }
});

// Initialize the photo gallery
document.addEventListener('DOMContentLoaded', function () {
    generatePhotoCards();
    originalScrollbarWidth = getScrollbarWidth();
});