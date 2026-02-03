// JavaScript for User Management
var timer;
var timer1;
var mark = Math.round(Math.random() * 1000);
var cnwota = ['Normal', 'Warning!', 'Overloading!!', 'Trap', 'N/A', 'Fault'];

// Update total load from XML data
function updateTotal(xmlData) {
  try {
    var data1 = getXMLValue(xmlData, 'total');
    var data2 = data1.split(",");
    var c = parseInt(data2[1]);
    
    // Update total load display
    document.getElementById('total-load').textContent = data2[0];
    
    // Update status display with color coding
    var totalStatusElement = document.getElementById('total-status');
    totalStatusElement.textContent = cnwota[c];
    
    // Set color based on status
    if (c == 0) {
      totalStatusElement.style.backgroundColor = 'rgba(39, 174, 96, 0.3)';
    } else {
      totalStatusElement.style.backgroundColor = 'rgba(231, 76, 60, 0.3)';
    }
    
  } catch (error) {
    console.error('Error updating total:', error);
  }
}

// Validate user form
function validateUserForm() {
  const currentUser = document.getElementById('T0');
  const currentPass = document.getElementById('T1');
  const newUser = document.getElementById('T2');
  const newPass = document.getElementById('T3');
  
  // Clear previous errors
  [currentUser, currentPass, newUser, newPass].forEach(input => {
    input.classList.remove('error');
  });
  
  let isValid = true;
  
  // Validate current username
  if (!currentUser.value.trim()) {
    currentUser.classList.add('error');
    showToast('Current username is required', 'error');
    isValid = false;
  }
  
  // Validate current password
  if (!currentPass.value.trim()) {
    currentPass.classList.add('error');
    showToast('Current password is required', 'error');
    isValid = false;
  }
  
  // Validate new username
  if (!newUser.value.trim()) {
    newUser.classList.add('error');
    showToast('New username is required', 'error');
    isValid = false;
  } else if (newUser.value.length > 16) {
    newUser.classList.add('error');
    showToast('New username must be 16 characters or less', 'error');
    isValid = false;
  }
  
  // Validate new password
  if (!newPass.value.trim()) {
    newPass.classList.add('error');
    showToast('New password is required', 'error');
    isValid = false;
  } else if (newPass.value.length > 16) {
    newPass.classList.add('error');
    showToast('New password must be 16 characters or less', 'error');
    isValid = false;
  }
  
  return isValid;
}

// Apply user credential changes
function GetID() {
  // Validate form
  if (!validateUserForm()) {
    return;
  }
  
  var s = '';
  var s2 = '' + mark;
  
  s += document.getElementById('T0').value + ','
    + document.getElementById('T1').value + ','
    + document.getElementById('T2').value + ','
    + document.getElementById('T3').value + ','
    + s2;
  
  // Show confirmation
  if (confirm("Are you sure you want to change your login credentials?")) {
    // Show loading state
    const applyBtn = document.querySelector('.btn-primary');
    const originalHTML = applyBtn.innerHTML;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
    applyBtn.disabled = true;
    
    // Clear form values temporarily
    document.getElementById('T0').value = '';
    document.getElementById('T1').value = '';
    document.getElementById('T2').value = '';
    document.getElementById('T3').value = '';
    
    // Make AJAX call
    newAJAXCommand('ID.cgi?led=' + s, null, false);
    
    // Update session info
    updateSessionInfo();
    
    // Start timer for response check
    timer1 = setTimeout("MyShow()", 1000);
    
    // Restore button after delay
    setTimeout(function() {
      applyBtn.innerHTML = originalHTML;
      applyBtn.disabled = false;
    }, 2000);
  }
}

// Start refresh timer
function MyShow() {
  clearTimeout(timer1);
  timer = window.setInterval("CallAgain()", 1000);
}

// Check for response
function CallAgain() {
  newAJAXCommand('GetID.xml', 'GetID', false);
  window.clearInterval(timer);
}

// Handle response from credential change
function updateGetID(xmlData) {
  try {
    var data1 = getXMLValue(xmlData, 'ID');
    if (data1 == null) {
      data1 = '';
      return;
    }
    
    var i = parseInt(data1);
    if (i == mark) {
      showToast('User credentials updated successfully!');
      
      // Update session info
      updateSessionInfo(true);
      
      // Reset form
      resetUserForm();
    } else {
      showToast('Failed to update credentials', 'error');
    }
    
  } catch (error) {
    console.error('Error updating user credentials:', error);
  }
}

// Update session information
function updateSessionInfo(isUpdated = false) {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'});
  const dateString = now.toLocaleDateString();
  
  document.getElementById('session-id').textContent = 'S' + mark.toString().padStart(3, '0');
  document.getElementById('last-updated').textContent = isUpdated ? 'Just now' : dateString + ' ' + timeString;
  document.getElementById('user-status').textContent = isUpdated ? 'Updated' : 'Active';
  
  if (isUpdated) {
    document.getElementById('user-status').className = 'status-indicator status-active';
  }
}

// Reset user form
function resetUserForm() {
  document.getElementById('T0').value = '';
  document.getElementById('T1').value = '';
  document.getElementById('T2').value = '';
  document.getElementById('T3').value = '';
  
  // Clear errors
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.classList.remove('error');
  });
  
  showToast('Form cleared', 'info');
}

// Refresh user data
function refreshUserData() {
  const refreshBtn = document.querySelector('.refresh-button');
  const originalHTML = refreshBtn.innerHTML;
  refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
  refreshBtn.disabled = true;
  
  // Refresh data
  newAJAXCommand('curtotal.xml', updateTotal, true);
  updateSessionInfo();
  
  setTimeout(function() {
    refreshBtn.innerHTML = originalHTML;
    refreshBtn.disabled = false;
    showToast('Data refreshed successfully', 'info');
  }, 1000);
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
  
  // Generate new mark
  mark = Math.round(Math.random() * 1000);
  
  // Highlight current page in main navigation
  const currentPage = window.location.pathname.split('/').pop() || 'configID.htm';
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
    mobileMenuToggle.addEventListener('click', function() {
      mainSideNav.classList.toggle('mobile-open');
      mobileOverlay.classList.toggle('active');
      document.body.style.overflow = mainSideNav.classList.contains('mobile-open') ? 'hidden' : '';
    });
    
    mobileOverlay.addEventListener('click', function() {
      mainSideNav.classList.remove('mobile-open');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
    
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          mainSideNav.classList.remove('mobile-open');
          mobileOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          showToast('Logged out successfully', 'info');
        }
      });
    }
  }
  
  // Initialize session info
  updateSessionInfo();
  
  // Start periodic updates
  setTimeout("newAJAXCommand('curtotal.xml', updateTotal, true)", 1000);
});

window.addEventListener('resize', function() {
  const mainSideNav = document.getElementById('mainSideNav');
  const mobileOverlay = document.getElementById('mobileOverlay');
  
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
window.GetID = GetID;
window.MyShow = MyShow;
window.CallAgain = CallAgain;
window.updateGetID = updateGetID;
window.resetUserForm = resetUserForm;
window.refreshUserData = refreshUserData;