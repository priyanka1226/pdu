// JavaScript for SNMP Configuration
var timer;
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

// Apply trap settings
function Gettrap() {
  var s = '';
  s = document.getElementById('T3').value + ',';
  
  // Validate IP address
  const ipInput = document.getElementById('T3');
  const ipValue = ipInput.value.trim();
  
  if (!validateIPAddress(ipValue)) {
    alert('Please enter a valid IP address (e.g., 192.168.1.100)');
    ipInput.classList.add('input-error');
    return;
  }
  
  if (confirm("Change receiver IP?")) {
    // Show loading state
    const applyBtn = document.querySelectorAll('.btn-primary')[0];
    const originalHTML = applyBtn.innerHTML;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
    applyBtn.disabled = true;
    
    // Clear validation
    ipInput.classList.remove('input-error');
    ipInput.classList.add('input-success');
    
    newAJAXCommand('trap.cgi?led=' + s, null, false); 
    
    // Update current display
    document.getElementById('current-trap-receiver').textContent = ipValue;
    
    // Show success message
    setTimeout(function() {
      applyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Applied';
      applyBtn.style.backgroundColor = '#27ae60';
      
      setTimeout(function() {
        applyBtn.innerHTML = originalHTML;
        applyBtn.style.backgroundColor = '';
        applyBtn.disabled = false;
        
        // Start refresh timer
        MyShow();
      }, 1500);
    }, 1000);
  }
}

// Apply community settings
function Getcomm() {
  var s = '';
  var s1 = '';
  
  s1 = document.getElementById('T4').value;
  
  // Validate community string length
  const commInput = document.getElementById('T4');
  const commValue = commInput.value.trim();
  
  if (commValue.length > 8 || commValue.length < 3) {
    alert("Community length must be within 3-8 characters");
    commInput.classList.add('input-error');
    return;
  }
  
  s = s1 + ',';
  
  // Clear validation
  commInput.classList.remove('input-error');
  commInput.classList.add('input-success');
  
  if (confirm("Change community?")) {
    // Show loading state
    const applyBtn = document.querySelectorAll('.btn-primary')[1];
    const originalHTML = applyBtn.innerHTML;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
    applyBtn.disabled = true;
    
    newAJAXCommand('comm.cgi?led=' + s, null, false); 
    
    // Update current display and stats
    document.getElementById('current-write-community').textContent = commValue;
    document.getElementById('community-length').textContent = commValue.length;
    
    // Show success message
    setTimeout(function() {
      applyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Applied';
      applyBtn.style.backgroundColor = '#27ae60';
      
      setTimeout(function() {
        applyBtn.innerHTML = originalHTML;
        applyBtn.style.backgroundColor = '';
        applyBtn.disabled = false;
      }, 1500);
    }, 1000);
  }
}

// Start refresh timer
function MyShow() {
  timer = window.setInterval("CallAgain()", 1000);
}

// Refresh trap data
function CallAgain() {
  newAJAXCommand('Gettrap.xml', 'Gettrap', false);
  window.clearInterval(timer);
}

// Update trap settings from XML data
function updateGettrap(xmlData) {
  try {
    var data1 = getXMLValue(xmlData, 'trap'); 
    if (data1 == null) {
      data1 = '';
    }
    
    // Update input field
    document.getElementById('T3').value = data1;
    
    // Update current display
    document.getElementById('current-trap-receiver').textContent = data1 || 'Not configured';
    
    // Update last trap timestamp
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    document.getElementById('last-trap').textContent = timeString;
    
  } catch (error) {
    console.error('Error updating trap settings:', error);
  }
}

// Validate IP address format
function validateIPAddress(ip) {
  const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipPattern.test(ip);
}

// Refresh SNMP configuration
function refreshSNMPConfig() {
  const refreshBtn = document.querySelector('.refresh-button');
  const originalHTML = refreshBtn.innerHTML;
  refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
  refreshBtn.disabled = true;
  
  // Refresh all data
  newAJAXCommand('Gettrap.xml', updateGettrap, false);
  newAJAXCommand('curtotal.xml', updateTotal, true);
  
  // Update last trap time
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'});
  document.getElementById('last-trap').textContent = timeString;
  
  setTimeout(function() {
    refreshBtn.innerHTML = originalHTML;
    refreshBtn.disabled = false;
  }, 1000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Highlight current page in main navigation
  const currentPage = window.location.pathname.split('/').pop() || 'configsnmp.htm';
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
          alert('Logged out successfully');
        }
      });
    }
  }
  
  // Load initial data
  newAJAXCommand('Gettrap.xml', updateGettrap, false);
  setTimeout(function() {
    newAJAXCommand('curtotal.xml', updateTotal, true);
  }, 1000);
  
  // Set initial community length
  const commValue = document.getElementById('T4').value;
  document.getElementById('community-length').textContent = commValue.length;
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
window.Gettrap = Gettrap;
window.Getcomm = Getcomm;
window.MyShow = MyShow;
window.CallAgain = CallAgain;
window.updateGettrap = updateGettrap;
window.refreshSNMPConfig = refreshSNMPConfig;