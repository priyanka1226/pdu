// JavaScript for Threshold Configuration
var cnwota = ['Normal', 'Warning!', 'Overloading!!', 'Trap', 'N/A', 'Fault'];

// Update total load from XML data
function updateTotal(xmlData) {
  try {
    var data1 = getXMLValue(xmlData, 'total');
    var data2 = data1.split(",");
    var c = parseInt(data2[1]);
    
    // Update total load display
    document.getElementById('total-load').textContent = data2[0];
    
    // Update current load display
    document.getElementById('current-load').textContent = data2[0] + ' A';
    
    // Update status display with color coding
    var totalStatusElement = document.getElementById('total-status');
    totalStatusElement.textContent = cnwota[c];
    
    // Set color based on status
    if (c == 0) {
      totalStatusElement.style.backgroundColor = 'rgba(39, 174, 96, 0.3)';
    } else if (c == 1) {
      totalStatusElement.style.backgroundColor = 'rgba(243, 156, 18, 0.3)';
    } else {
      totalStatusElement.style.backgroundColor = 'rgba(231, 76, 60, 0.3)';
    }
    
  } catch (error) {
    console.error('Error updating total:', error);
  }
}

// Validate threshold inputs
function validateThresholds() {
  const warningInput = document.getElementById('w0');
  const overloadInput = document.getElementById('o0');
  const warningError = document.getElementById('w0-error');
  const overloadError = document.getElementById('o0-error');
  
  const warningValue = parseInt(warningInput.value);
  const overloadValue = parseInt(overloadInput.value);
  
  // Clear previous errors
  warningInput.classList.remove('error');
  overloadInput.classList.remove('error');
  warningError.textContent = '';
  overloadError.textContent = '';
  
  let isValid = true;
  
  // Validate warning threshold
  if (isNaN(warningValue) || warningValue < 1) {
    warningInput.classList.add('error');
    warningError.textContent = 'Must be greater than 0';
    isValid = false;
  }
  
  // Validate overload threshold
  if (isNaN(overloadValue)) {
    overloadInput.classList.add('error');
    overloadError.textContent = 'Invalid number';
    isValid = false;
  } else if (overloadValue > 25) {
    overloadInput.classList.add('error');
    overloadError.textContent = 'Maximum is 25';
    isValid = false;
  }
  
  // Validate warning < overload
  if (isValid && warningValue >= overloadValue) {
    warningInput.classList.add('error');
    warningError.textContent = 'Must be less than overload';
    overloadInput.classList.add('error');
    overloadError.textContent = 'Must be greater than warning';
    isValid = false;
  }
  
  return isValid;
}

// Apply threshold settings
function GetValue() {
  // Validate inputs
  if (!validateThresholds()) {
    showToast('Please fix validation errors', 'error');
    return;
  }
  
  var s = '';
  var t = '';
  var i = 0;
  
  const warningValue = document.getElementById('w' + i).value;
  const overloadValue = document.getElementById('o' + i).value;
  
  // Validate specific conditions
  if (parseInt(overloadValue) > 25) {
    alert("Too big - maximum is 25");
    return;
  }
  
  if (parseInt(warningValue) < 1) {
    alert("Warning must be greater than zero");
    return;
  }
  
  if (parseInt(warningValue) >= parseInt(overloadValue)) {
    alert("Overload must be greater than Warning");
    return;
  }
  
  s += warningValue + ',';
  t += overloadValue + ',';
  
  // Additional parameters (commented out in original)
  const l = 1; // document.getElementById('t0').value
  const h = 99; // document.getElementById('t1').value
  const ll = 1; // document.getElementById('t2').value
  const hh = 99; // document.getElementById('t3').value
  
  if (l + 5 > h || ll + 5 > hh) {
    alert("Upper must be greater than Lower by at least 5");
    return;
  }
  
  if (l < 1 || ll < 1) {
    alert("Lower must be greater than zero");
    return;
  }
  
  s += t + l + ',' + h + ',' + ll + ',' + hh;
  
  if (confirm("Change threshold setting?")) {
    // Show loading state
    const applyBtn = document.querySelector('.btn-primary');
    const originalHTML = applyBtn.innerHTML;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
    applyBtn.disabled = true;
    
    newAJAXCommand('thres.cgi?led=' + s, null, false);
    
    // Update display values
    document.getElementById('warning-level').textContent = warningValue + '.0 A';
    document.getElementById('overload-level').textContent = overloadValue + '.0 A';
    
    // Show success message
    setTimeout(function() {
      showToast('Threshold settings applied successfully!');
      applyBtn.innerHTML = originalHTML;
      applyBtn.disabled = false;
    }, 1000);
  }
}

// Update threshold values from XML data
function updateGetth(xmlData) {
  try {
    var data1 = getXMLValue(xmlData, 'th0');
    var data2 = data1.split(",");
    var data3 = getXMLValue(xmlData, 'th1');
    var data4 = data3.split(",");
    var data5 = getXMLValue(xmlData, 'th2');
    var data6 = data5.split(",");
    
    // Update input values
    for (var i = 0; i < 1; i++) {
      const warningInput = document.getElementById('w' + i);
      const overloadInput = document.getElementById('o' + i);
      
      if (warningInput && data2[i]) {
        warningInput.value = data2[i];
        document.getElementById('warning-level').textContent = data2[i] + '.0 A';
      }
      
      if (overloadInput && data4[i]) {
        overloadInput.value = data4[i];
        document.getElementById('overload-level').textContent = data4[i] + '.0 A';
      }
    }
    
    // Update temperature/humidity thresholds (commented out in original)
    /*
    for (var i = 0; i < 4; i++) {
      const tempHumInput = document.getElementById('t' + i);
      if (tempHumInput && data6[i]) {
        tempHumInput.value = data6[i];
      }
    }
    */
    
  } catch (error) {
    console.error('Error updating threshold values:', error);
  }
}

// Reset threshold form
function resetThresholdForm() {
  document.getElementById('w0').value = '12';
  document.getElementById('o0').value = '15';
  
  // Clear errors
  document.getElementById('w0').classList.remove('error');
  document.getElementById('o0').classList.remove('error');
  document.getElementById('w0-error').textContent = '';
  document.getElementById('o0-error').textContent = '';
  
  // Reset display values
  document.getElementById('warning-level').textContent = '12.0 A';
  document.getElementById('overload-level').textContent = '15.0 A';
  
  showToast('Threshold form reset to defaults', 'info');
}

// Refresh threshold data
function refreshThresholdData() {
  const refreshBtn = document.querySelector('.refresh-button');
  const originalHTML = refreshBtn.innerHTML;
  refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
  refreshBtn.disabled = true;
  
  // Refresh all data
  newAJAXCommand('Getth.xml', updateGetth, false);
  newAJAXCommand('curtotal.xml', updateTotal, true);
  
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
  
  // Highlight current page in main navigation
  const currentPage = window.location.pathname.split('/').pop() || 'configthreshold.htm';
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
  
  // Load initial data
  newAJAXCommand('Getth.xml', updateGetth, false);
  setTimeout(function() {
    newAJAXCommand('curtotal.xml', updateTotal, true);
  }, 1000);
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
window.GetValue = GetValue;
window.updateGetth = updateGetth;
window.resetThresholdForm = resetThresholdForm;
window.refreshThresholdData = refreshThresholdData;