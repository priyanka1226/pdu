// Status categories for display
const cnwota = ['Normal', 'Warning!', 'Overloading!!', 'Trap', 'N/A', 'Fault'];

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
    if (c === 0) {
      totalStatusElement.style.backgroundColor = 'rgba(39, 174, 96, 0.3)';
    } else {
      totalStatusElement.style.backgroundColor = 'rgba(231, 76, 60, 0.3)';
    }
    
  } catch (error) {
    console.error('Error updating total:', error);
  }
}

// Toggle IP input boxes based on DHCP checkbox
function configIPBoxes() {
  var state = document.confignet.dhcpenabled.checked;
  
  document.confignet.ip.disabled = state;
  document.confignet.gw.disabled = state;
  document.confignet.subnet.disabled = state;
  document.confignet.dns1.disabled = state;
  document.confignet.dns2.disabled = state;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Highlight current page in main navigation
  const currentPage = window.location.pathname.split('/').pop() || 'confignet.htm';
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
          // Add logout logic here
          alert('Logged out successfully');
          // In a real application, this would redirect to login page
          // window.location.href = 'login.htm';
        }
      });
    }
  }
  
  // Initialize IP boxes based on DHCP checkbox
  configIPBoxes();
  
  // Start periodic updates for total load
  setTimeout("newAJAXCommand('curtotal.xml', updateTotal, true)", 1000);
});

// Handle form submission
document.addEventListener('submit', function(e) {
  if (e.target.name === 'confignet') {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = e.target.querySelector('[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(function() {
      alert('Network settings applied successfully!');
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
      
      // In a real application, this would submit the form
      // e.target.submit();
    }, 1500);
  }
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
window.configIPBoxes = configIPBoxes;