// Global variables
var timer;
var cnwota = ['Normal', 'Warning!', 'Overloading!!', 'Trap', 'N/A', 'Fault'];

// Outlet configuration
var outletCount = 8; // Number of outlets (1-8)
var outletNames = ['OutletA', 'Outlet', 'Outlet', 'Outlet', 'Outlet', 'Outlet', 'Outlet', 'Outlet'];

// Initialize outlet table
function initializeOutletTable() {
  const tbody = document.getElementById('outlet-tbody');
  tbody.innerHTML = '';
  
  for (let i = 1; i <= outletCount; i++) {
    const row = document.createElement('tr');
    row.className = 'outlet-row';
    row.id = `outlet-row-${i}`;
    
    row.innerHTML = `
      <td class="outlet-name">
        <span id="B1${i}">${outletNames[i-1]} ${i}</span>
      </td>
      <td style="text-align: center;">
        <span class="outlet-status status-off" id="A1${i}">OFF</span>
      </td>
      <td class="outlet-checkbox">
        <input id="C1${i}" value="ON" type="checkbox">
      </td>
    `;
    
    tbody.appendChild(row);
  }
}

// Update status from XML data
function updateStatus(xmlData) {
  try {
    var data1 = getXMLValue(xmlData, 'pot0');    
    var data2 = data1.split(",");	
    
    let activeCount = 0;
    
    for(let i = 10; i < 18; i++) {
      const outletIndex = i - 9; // Convert to 1-8
      const statusElement = document.getElementById(`A1${outletIndex}`);
      const statusValue = data2[i];
      
      if(statusValue == '1') {
        // ON
        statusElement.className = 'outlet-status status-on';
        statusElement.textContent = 'ON';
        statusElement.style.color = '#27ae60';
        activeCount++;
      } else if(statusValue == '0') {
        // OFF
        statusElement.className = 'outlet-status status-off';
        statusElement.textContent = 'OFF';
        statusElement.style.color = '#e74c3c';
      } else if(statusValue == '2') {
        // Delayed ON
        statusElement.className = 'outlet-status status-delayed-on';
        statusElement.textContent = 'D  ON';
        statusElement.style.color = '#f39c12';
        activeCount++;
      } else if(statusValue == '3') {
        // Delayed OFF
        statusElement.className = 'outlet-status status-delayed-off';
        statusElement.textContent = 'D OFF';
        statusElement.style.color = '#8e44ad';
      }
    }
    
    // Update stats
    document.getElementById('active-outlets').textContent = activeCount;
    document.getElementById('inactive-outlets').textContent = outletCount - activeCount;
    
    // Update total load status
    var c = parseInt(data2[43]);
    if(c == 0) {
      document.getElementById('total-status').style.color = '#27ae60';
    } else {
      document.getElementById('total-status').style.color = '#e74c3c';
    }
    
    document.getElementById('total-load').textContent = data2[42];
    document.getElementById('total-status').textContent = cnwota[c];
    
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

// Update outlet names from XML data
function updateGetname(xmlData) {
  try {
    for(var i = 0; i < outletCount; i++) {
      var data1 = getXMLValue(xmlData, 'na' + i);
      if(data1) {
        var data2 = data1.split(",");
        const nameElement = document.getElementById('B1' + (i+1));
        if(nameElement && data2[0]) {
          nameElement.textContent = data2[0];
          outletNames[i] = data2[0];
        }
      }
    }
  } catch (error) {
    console.error('Error updating outlet names:', error);
  }
}

// Turn ON selected outlets
function GetGroupOn() {
  var s = '';
  for(var j = 1; j <= outletCount; j++) {
    const checkbox = document.getElementById('C1' + j);
    if(checkbox && checkbox.checked) {
      s += '1';
    } else {
      s += '0';	
    }
  }
  s += "00000000" + "00000000";
  
  if(confirm("Turn ON the selected outlets?")) {
    // Show loading state
    const btn = document.querySelector('.btn-success');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Turning ON...';
    btn.disabled = true;
    
    newAJAXCommand('ons.cgi?led=' + s, null, false);
    
    // Restore button after delay
    setTimeout(function() {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }, 2000);
  }
}

// Turn OFF selected outlets
function GetGroupOff() {
  var s = '';
  for(var j = 1; j <= outletCount; j++) {
    const checkbox = document.getElementById('C1' + j);
    if(checkbox && checkbox.checked) {
      s += '1';
    } else {
      s += '0';	
    }
  }
  s += "00000000" + "00000000";
  
  if(confirm("Turn OFF the selected outlets?")) {
    // Show loading state
    const btn = document.querySelector('.btn-danger');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Turning OFF...';
    btn.disabled = true;
    
    newAJAXCommand('offs.cgi?led=' + s, null, false);
    
    // Restore button after delay
    setTimeout(function() {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }, 2000);
  }
}

// Reboot selected outlets
function GetGroupOffon() {
  var s = '';
  for(var j = 1; j <= outletCount; j++) {
    const checkbox = document.getElementById('C1' + j);
    if(checkbox && checkbox.checked) {
      s += '1';
    } else {
      s += '0';	
    }
  }
  s += "00000000" + "00000000";
  
  if(confirm("Reboot (OFF/ON) the selected outlets?")) {
    // Show loading state
    const btn = document.querySelector('.btn-warning');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rebooting...';
    btn.disabled = true;
    
    newAJAXCommand('offon.cgi?led=' + s, null, false);
    
    // Restore button after delay
    setTimeout(function() {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }, 2000);
  }
}

// Master checkbox control
function GetChange(k) {
  const masterCheckbox = document.getElementById('C0');
  const isChecked = masterCheckbox.checked;
  
  for(let j = 1; j <= outletCount; j++) {
    const checkbox = document.getElementById('C1' + j);
    if(checkbox) {
      checkbox.checked = isChecked;
    }
  }
}

// Refresh outlet status
function refreshOutletStatus() {
  // Show refreshing state
  const refreshBtn = document.querySelector('.refresh-button');
  const originalHTML = refreshBtn.innerHTML;
  refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
  refreshBtn.disabled = true;
  
  // Refresh data
  newAJAXCommand('status.xml', updateStatus, true);
  
  // Restore button after delay
  setTimeout(function() {
    refreshBtn.innerHTML = originalHTML;
    refreshBtn.disabled = false;
  }, 1000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Initialize outlet table
  initializeOutletTable();
  
  // Highlight current page in main navigation
  const currentPage = window.location.pathname.split('/').pop() || 'outlet.htm';
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
          alert('Logged out successfully');
          // In a real application, this would redirect to login page
          // window.location.href = 'login.htm';
        }
      });
    }
  }
  
  // Load initial data
  newAJAXCommand('Getname.xml', updateGetname, false);
  setTimeout(function() {
    newAJAXCommand('status.xml', updateStatus, true);
  }, 1000);
  
  // Set total outlets count
  document.getElementById('total-outlets').textContent = outletCount;
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
window.updateStatus = updateStatus;
window.updateGetname = updateGetname;
window.GetGroupOn = GetGroupOn;
window.GetGroupOff = GetGroupOff;
window.GetGroupOffon = GetGroupOffon;
window.GetChange = GetChange;
window.refreshOutletStatus = refreshOutletStatus;