// JavaScript for System Information Page

// Status categories for display
const statusCategories = {
  0: { text: 'Normal', class: 'status-normal' },
  1: { text: 'Warning!', class: 'status-warning' },
  2: { text: 'Overloading!!', class: 'status-overload' },
  3: { text: 'Trap', class: 'status-trap' },
  4: { text: 'N/A', class: 'status-na' },
  5: { text: 'Fault', class: 'status-fault' }
};

// Colors for different statuses
const statusColors = {
  0: '#27ae60', // Normal - green
  1: '#f39c12', // Warning - orange
  2: '#e74c3c', // Overload - red
  3: '#9b59b6', // Trap - purple
  4: '#7f8c8d', // N/A - gray
  5: '#34495e'  // Fault - dark blue
};

// Update total load from XML data
function updateTotal(xmlData) {
  try {
    var data1 = getXMLValue(xmlData, 'total');
    var data2 = data1.split(",");
    var c = parseInt(data2[1]);
    
    // Update total load display
    document.getElementById('total-load').textContent = data2[0];
    
    // Update total status
    var totalStatusElement = document.getElementById('total-status');
    totalStatusElement.textContent = statusCategories[c].text;
    
    // Change color of total load card based on status
    var totalLoadCard = document.getElementById('total-load-card');
    if (c < 3) {
      totalLoadCard.style.background = `linear-gradient(135deg, ${statusColors[c]}, ${darkenColor(statusColors[c], 20)})`;
    }
    
    // Update time display
    updateTime();
    
  } catch (error) {
    console.error('Error updating total:', error);
  }
}

// Update the time display
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'});
  document.getElementById('update-time').textContent = timeString;
}

// Helper function to darken a color
function darkenColor(color, percent) {
  // Simplified darkening for demo purposes
  return color; // In a real implementation, this would calculate darker shade
}

// Apply system settings
function applySettings() {
  const systemName = document.getElementById('system-name').value;
  const systemContact = document.getElementById('system-contact').value;
  const systemLocation = document.getElementById('system-location').value;
  
  // Validate inputs
  if (!systemName.trim() || !systemContact.trim() || !systemLocation.trim()) {
    showToast('All fields are required', 'error');
    return;
  }
  
  if (systemName.length > 15 || systemContact.length > 15 || systemLocation.length > 15) {
    showToast('Maximum 15 characters allowed per field', 'error');
    return;
  }
  
  // Build the parameter string
  var s = '';
  s += systemName + ',';
  s += systemContact + ',';
  s += systemLocation + ',';
  
  // Show confirmation dialog
  if (confirm("Are you sure you want to change system information?")) {
    // Show loading state
    const applyBtn = document.querySelector('.btn-primary');
    const originalHTML = applyBtn.innerHTML;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
    applyBtn.disabled = true;
    
    // Make AJAX call
    newAJAXCommand('namey.cgi?led=' + s, null, false);
    
    // Show success toast
    showToast('System information updated successfully!');
    
    // Restore button
    setTimeout(() => {
      applyBtn.innerHTML = originalHTML;
      applyBtn.disabled = false;
    }, 1000);
    
    // Refresh data
    setTimeout(() => {
      refreshData();
    }, 500);
  }
}

// Reset form to original values
function resetForm() {
  document.getElementById('system-name').value = 'PDU';
  document.getElementById('system-contact').value = 'Admin';
  document.getElementById('system-location').value = 'Office';
  
  showToast('Form reset to default values', 'info');
}

// Manual refresh function
function refreshData() {
  // Show refreshing state
  const refreshBtn = document.querySelector('.refresh-button');
  const originalHTML = refreshBtn.innerHTML;
  refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
  refreshBtn.disabled = true;
  
  // Refresh data
  setTimeout(function() {
    newAJAXCommand('curtotal.xml', updateTotal, true);
    refreshBtn.innerHTML = originalHTML;
    refreshBtn.disabled = false;
    
    showToast('Data refreshed successfully', 'info');
  }, 500);
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  toastMessage.textContent = message;
  toast.className = 'toast';
  toast.classList.add(type);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Set initial update time
  updateTime();
  
  // Highlight current page in main navigation
  const currentPage = window.location.pathname.split('/').pop() || 'system.htm';
  const navLinks = document.querySelectorAll('.main-nav-menu a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // Mobile menu functionality
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainSideNav = document.getElementById('mainSideNav');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (mobileMenuToggle && mainSideNav && mobileOverlay) {
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function() {
      mainSideNav.classList.toggle('mobile-open');
      mobileOverlay.classList.toggle('active');
      document.body.style.overflow = mainSideNav.classList.contains('mobile-open') ? 'hidden' : '';
    });
    
    // Close menu when clicking overlay
    mobileOverlay.addEventListener('click', function() {
      mainSideNav.classList.remove('mobile-open');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
    
    // Close menu when clicking on a nav link (for mobile)
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          mainSideNav.classList.remove('mobile-open');
          mobileOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
    
    // Logout button
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          showToast('Logged out successfully', 'info');
          setTimeout(() => {
            // In a real application, redirect to login page
            // window.location.href = 'login.htm';
          }, 1000);
        }
      });
    }
  }
  
  // Start periodic updates
  setTimeout("newAJAXCommand('curtotal.xml', updateTotal, true)", 1000);
});

// Simulate initial data load for demo
window.addEventListener('load', function() {
  setTimeout(function() {
    document.getElementById('total-load').textContent = '8.2';
    document.getElementById('total-status').textContent = 'Normal';
    
    updateTime();
  }, 1000);
});

// Handle window resize
window.addEventListener('resize', function() {
  const mainSideNav = document.getElementById('mainSideNav');
  const mobileOverlay = document.getElementById('mobileOverlay');
  
  // If window is resized to larger than mobile, ensure menu is closed
  if (window.innerWidth > 768) {
    if (mainSideNav) {
      mainSideNav.classList.remove('mobile-open');
    }
    if (mobileOverlay) {
      mobileOverlay.classList.remove('active');
    }
    document.body.style.overflow = '';
  }
});

// Make functions available globally
window.updateTotal = updateTotal;
window.applySettings = applySettings;
window.resetForm = resetForm;
window.refreshData = refreshData;