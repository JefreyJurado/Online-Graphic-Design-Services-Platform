// Unsplash Image Search Integration
// API Configuration
const API_BASE_URL = 'https://online-graphic-design-services-plat.vercel.app';// Change to your production URL later

// State management
let searchTimeout = null;
let selectedImages = [];
const MAX_IMAGES = 5;

// Initialize Unsplash integration
function initUnsplashIntegration() {
  console.log('✓ Unsplash integration initialized');
  
  // Check if we're on the request quote page
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    addImageSearchToForm();
  }
}

// Truncate description to max 500 characters
function truncateDescription(description) {
  if (!description) return '';
  if (description.length <= 500) return description;
  return description.substring(0, 497) + '...';
}

// Add image search section to quotation form
function addImageSearchToForm() {
  const form = document.getElementById('quoteForm');
  if (!form) return;
  
  // Find the submit button
  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) return;
  
  // Create image search section
  const imageSection = document.createElement('div');
  imageSection.className = 'image-search-section';
  imageSection.innerHTML = `
    <h3>Add Reference Images (Optional)</h3>
    <p style="color: #666; margin-bottom: 1rem;">
      Search for design inspiration from Unsplash (max 5 images)
    </p>
    
    <!-- Search Bar -->
    <div class="image-search-bar">
      <input 
        type="text" 
        id="imageSearchInput"
        placeholder="Search for design inspiration... (e.g., logo, branding)"
        minlength="3"
        maxlength="100"
      />
      <button type="button" id="clearSearchBtn" style="display: none;">✕</button>
      <span id="searchLoader" style="display: none;">🔍</span>
    </div>
    <small id="charCount" style="color: #666;">0/100 characters</small>
    
    <!-- Selected Images Preview -->
    <div id="selectedImagesPreview" style="display: none;">
      <h4>Selected Images (<span id="imageCount">0</span>/5)</h4>
      <div id="selectedImagesGrid"></div>
    </div>
    
    <!-- Search Results -->
    <div id="searchResults"></div>
  `;
  
  // Insert before submit button
  submitButton.parentNode.insertBefore(imageSection, submitButton);
  
  // Add event listeners
  setupImageSearchListeners();
  
  // Add CSS
  addImageSearchStyles();
}

// Setup event listeners
function setupImageSearchListeners() {
  const searchInput = document.getElementById('imageSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  const charCount = document.getElementById('charCount');
  
  if (searchInput) {
    // Debounced search
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      charCount.textContent = `${query.length}/100 characters`;
      
      // Show/hide clear button
      clearBtn.style.display = query ? 'block' : 'none';
      
      // Clear previous timeout
      if (searchTimeout) clearTimeout(searchTimeout);
      
      // Search after 300ms delay
      if (query.length >= 3) {
        document.getElementById('searchLoader').style.display = 'inline';
        searchTimeout = setTimeout(() => searchImages(query), 300);
      } else {
        document.getElementById('searchResults').innerHTML = '';
      }
    });
    
    // Search on Enter
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query.length >= 3) {
          searchImages(query);
        }
      }
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      charCount.textContent = '0/100 characters';
      clearBtn.style.display = 'none';
      document.getElementById('searchResults').innerHTML = '';
    });
  }
}

// Search images from Unsplash API
async function searchImages(query) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/unsplash/search?query=${encodeURIComponent(query)}&per_page=12`
    );
    
    const data = await response.json();
    document.getElementById('searchLoader').style.display = 'none';
    
    if (data.success && data.results.length > 0) {
      displaySearchResults(data.results);
    } else {
      document.getElementById('searchResults').innerHTML = `
        <p style="text-align: center; color: #999; padding: 2rem;">
          No images found. Try different keywords.
        </p>
      `;
    }
  } catch (error) {
    console.error('Search error:', error);
    document.getElementById('searchLoader').style.display = 'none';
    document.getElementById('searchResults').innerHTML = `
      <p style="text-align: center; color: #f44; padding: 2rem;">
        Failed to search images. Please try again.
      </p>
    `;
  }
}

// Display search results
function displaySearchResults(images) {
  const resultsContainer = document.getElementById('searchResults');
  
  resultsContainer.innerHTML = `
    <div style="margin: 1rem 0;">
      <p style="color: #666;">Showing ${images.length} results</p>
    </div>
    <div class="image-gallery-grid">
      ${images.map(image => createImageCard(image)).join('')}
    </div>
  `;

    // Truncate description to max 500 characters
    function truncateDescription(description) {
    if (!description) return '';
    if (description.length <= 500) return description;
    return description.substring(0, 497) + '...';
    }
  
  // Add click listeners to cards
  images.forEach(image => {
    const card = document.getElementById(`img-${image.unsplashId}`);
    if (card) {
      card.addEventListener('click', () => toggleImageSelection(image));
    }
  });
}

// Create image card HTML
function createImageCard(image) {
  const isSelected = selectedImages.some(img => img.unsplashId === image.unsplashId);
  const isDisabled = selectedImages.length >= MAX_IMAGES && !isSelected;
  
  return `
    <div 
      id="img-${image.unsplashId}" 
      class="image-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
      style="cursor: ${isDisabled ? 'not-allowed' : 'pointer'};"
    >
      <img src="${image.thumbUrl}" alt="${image.description || 'Design inspiration'}" />
      ${isSelected ? '<div class="checkmark">✓</div>' : ''}
      ${isDisabled ? '<div class="disabled-overlay">Limit reached</div>' : ''}
      <div class="photographer-credit">
        Photo by ${image.photographer.name}
      </div>
    </div>
  `;
}

// Toggle image selection
function toggleImageSelection(image) {
  const index = selectedImages.findIndex(img => img.unsplashId === image.unsplashId);
  
  if (index > -1) {
    // Remove image
    selectedImages.splice(index, 1);
  } else {
    // Add image (if under limit)
    if (selectedImages.length >= MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed per quotation`);
      return;
    }
        // Truncate description before adding
    const imageToAdd = {
    ...image,
    description: truncateDescription(image.description)
    };
    selectedImages.push(imageToAdd);
    }
  
  // Update UI
  updateSelectedImagesPreview();
  
  // Re-render search results to update card states
  const resultsGrid = document.querySelector('.image-gallery-grid');
  if (resultsGrid) {
    const cards = resultsGrid.querySelectorAll('.image-card');
    cards.forEach(card => {
      const imgId = card.id.replace('img-', '');
      const isSelected = selectedImages.some(img => img.unsplashId === imgId);
      const isDisabled = selectedImages.length >= MAX_IMAGES && !isSelected;
      
      card.className = `image-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`;
      card.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
      
      // Update checkmark
      const checkmark = card.querySelector('.checkmark');
      const overlay = card.querySelector('.disabled-overlay');
      
      if (isSelected && !checkmark) {
        card.insertAdjacentHTML('beforeend', '<div class="checkmark">✓</div>');
      } else if (!isSelected && checkmark) {
        checkmark.remove();
      }
      
      if (isDisabled && !overlay) {
        card.insertAdjacentHTML('beforeend', '<div class="disabled-overlay">Limit reached</div>');
      } else if (!isDisabled && overlay) {
        overlay.remove();
      }
    });
  }
}

// Update selected images preview
function updateSelectedImagesPreview() {
  const preview = document.getElementById('selectedImagesPreview');
  const grid = document.getElementById('selectedImagesGrid');
  const count = document.getElementById('imageCount');
  
  if (selectedImages.length === 0) {
    preview.style.display = 'none';
    return;
  }
  
  preview.style.display = 'block';
  count.textContent = selectedImages.length;
  
  grid.innerHTML = selectedImages.map(image => `
    <div class="selected-image-item">
      <img src="${image.thumbUrl}" alt="${image.description || ''}" />
      <button 
        type="button" 
        class="remove-image-btn" 
        onclick="removeSelectedImage('${image.unsplashId}')"
      >
        ✕
      </button>
      <small>${image.photographer.name}</small>
    </div>
  `).join('');
}

// Remove selected image
function removeSelectedImage(unsplashId) {
  selectedImages = selectedImages.filter(img => img.unsplashId !== unsplashId);
  updateSelectedImagesPreview();
  
  // Update search results if visible
  const card = document.getElementById(`img-${unsplashId}`);
  if (card) {
    card.classList.remove('selected');
    const checkmark = card.querySelector('.checkmark');
    if (checkmark) checkmark.remove();
  }
}

// Get selected images for form submission
function getSelectedImages() {
  return selectedImages;
}

// Add CSS styles
function addImageSearchStyles() {
  if (document.getElementById('unsplash-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'unsplash-styles';
  style.textContent = `
    .image-search-section {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .image-search-bar {
      position: relative;
      margin-bottom: 0.5rem;
    }
    
    #imageSearchInput {
      width: 100%;
      padding: 12px 45px 12px 15px;
      font-size: 16px;
      border: 2px solid #ddd;
      border-radius: 8px;
      transition: border-color 0.3s;
    }
    
    #imageSearchInput:focus {
      outline: none;
      border-color: #1C4D8C;
    }
    
    #clearSearchBtn {
      position: absolute;
      right: 15px;
      top: 12px;
      background: #ff4444;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 16px;
    }
    
    #searchLoader {
      position: absolute;
      right: 45px;
      top: 12px;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .image-gallery-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }
    
    @media (max-width: 768px) {
      .image-gallery-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 480px) {
      .image-gallery-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .image-card {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
      aspect-ratio: 1;
    }
    
    .image-card:not(.disabled):hover {
      transform: scale(1.05);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }
    
    .image-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .image-card.selected {
      border: 3px solid #1C4D8C;
    }
    
    .image-card.disabled {
      opacity: 0.5;
    }
    
    .checkmark {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #1C4D8C;
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
    }
    
    .disabled-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    
    .photographer-credit {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 8px;
      font-size: 12px;
      text-align: center;
    }
    
    #selectedImagesPreview {
      margin: 1.5rem 0;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      border: 2px dashed #1C4D8C;
    }
    
    #selectedImagesGrid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.75rem;
      margin-top: 1rem;
    }
    
    @media (max-width: 768px) {
      #selectedImagesGrid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    .selected-image-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .selected-image-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .remove-image-btn {
      position: absolute;
      top: 5px;
      right: 5px;
      background: #ff4444;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .selected-image-item small {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 4px;
      font-size: 10px;
      text-align: center;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUnsplashIntegration);
} else {
  initUnsplashIntegration();
}

// Make removeSelectedImage available globally
window.removeSelectedImage = removeSelectedImage;
window.getSelectedImages = getSelectedImages;