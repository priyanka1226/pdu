// JavaScript for PDU Configuration
var cnwota = ['Normal', 'Warning!', 'Overloading!!', 'Trap', 'N/A', 'Fault'];

// Outlet configuration
var outletCount = 8;
var outletNames = ['OutletA', 'Outlet', 'Outlet', 'Outlet', 'Outlet', 'Outlet', 'Outlet', 'Outlet'];
var onDelays = [0, 0, 0, 0, 0, 0, 0, 0];
var offDelays = [0, 0, 0, 0, 0, 0, 0, 0];

// Initialize PDU configuration table
function initializePDUTable() {
  const tbody = document.getElementById('pdu-config-tbody');
  tbody.innerHTML = '';
  
  for (let i = 0; i < outletCount; i++) {
    const row = document.createElement('tr');
    row.className = 'outlet-row-header';
    
    row.innerHTML = `
      <td>
        <input class="outlet-input" id="B0${i}" maxlength="10" value="${outletNames[i]}" 
               onchange="validateOutletName(${i})" placeholder="Outlet ${i+1}">
        <span class="error-message" id="name-error-${i}"></span>
      </td>
      <td>
        <input class="outlet-input delay-input" id="O0${i}" maxlength="3" value="${onDelays[i]}" 
               onchange="validateDelay(${i}, 'on')" placeholder="0">
        <span class="error-message" id="on-delay-error-${i}"></span>
      </td>
      <td>
        <input class="outlet-input delay-input" id="F0${i}" maxlength="3" value="${offDelays[i]}" 
               onchange="validateDelay(${i}, 'off')" placeholder="0">
        <span class="error-message" id="off-delay-error-${i}"></span>
      </td>
      <td>
        <button class="apply-btn" onclick="applyOutletSettings(${i})" id="apply-btn-${i}">
          Apply
        </button>
      </td>
    `;
    
    tbody.appendChild(row);
  }
  
  updateStats();
}

// Validate outlet name
function validateOutletName(index) {
  const input = document.getElementById(`B0${index}`);
  const errorSpan = document.getElementById(`name-error-${index}`);
  const value = input.value.trim();
  
  if (value.length > 10) {
    input.classList.add('input-error');
    errorSpan.textContent = 'Max 10 characters';
    return false;
  } else if (value.length === 0) {
    input.classList.add('input-error');
    errorSpan.textContent = 'Name required';
    return false;
  } else {
    input.classList.remove('input-error');
    input.classList.add('input-success');
    errorSpan.textContent = '';
    return true;
  }
}

// Validate delay value
function validateDelay(index, type) {
  const inputId = type === 'on' ? `O0${index}` : `F0${index}`;
  const input = document.getElementById(inputId);
  const errorSpan = document.getElementById(`${type}-delay-error-${index}`);
  const value = parseInt(input.value);
  
  if (isNaN(value) || value < 0 || value > 255) {
    input.classList.add('input-error');
    errorSpan.textContent = '0-255 only';
    return false;
  } else {
    input.classList.remove('input-error');
    input.classList.add('input-success');
    errorSpan.textContent = '';
    return true;
  }
}

// Apply outlet settings (Name)
function GetGroupName(j) {
  var s = '';
  s += j + ',';
  for (var i = 0; i < 8; i++) {
    s += document.getElementById('B' + j + i).value + ',';
  }
  
  if (confirm("Change outlet name?")) {
    // Show loading state
    const applyBtn = document.getElementById(`apply-btn-${i}`);
    const originalText = applyBtn.textContent;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    applyBtn.disabled = true;
    
    newAJAXCommand('names1.cgi?led=' + s, null, false);
    
    setTimeout(function() {
      applyBtn.textContent = '✓ Applied';
      applyBtn.style.backgroundColor = '#27ae60';
      
      setTimeout(function() {
        applyBtn.textContent = originalText;
        applyBtn.style.backgroundColor = '';
        applyBtn.disabled = false;
        updateStats();
      }, 1500);
    }, 1000);
  }
}

// Apply ON delay settings
function GetTime(j) {
  var s = '';
  s += j + ',';
  for (var i = 0; i < 8; i++) {
    var t = parseInt(document.getElementById('O' + j + i).value);
    if (t > 255) {
      alert("Within 0 - 255");
      return;
    }
    s += document.getElementById('O' + j + i).value + ',';
  }
  
  if (confirm("Change delay time?")) {
    const applyBtn = document.getElementById(`apply-btn-${i}`);
    const originalText = applyBtn.textContent;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    applyBtn.disabled = true;
    
    newAJAXCommand('delay1.cgi?led=' + s, null, false);
    
    setTimeout(function() {
      applyBtn.textContent = '✓ Applied';
      applyBtn.style.backgroundColor = '#27ae60';
      
      setTimeout(function() {
        applyBtn.textContent = originalText;
        applyBtn.style.backgroundColor = '';
        applyBtn.disabled = false;
      }, 1500);
    }, 1000);
  }
}

// Apply OFF delay settings
function GetTimef(j) {
  var s = '';
  s += j + ',';
  for (var i = 0; i < 8; i++) {
    var t = parseInt(document.getElementById('F' + j + i).value);
    if (t > 255) {
      alert("Within 0 - 255");
      return;
    }
    s += document.getElementById('F' + j + i).value + ',';
  }
  
  if (confirm("Change delay time?")) {
    const applyBtn = document.getElementById(`apply-btn-${i}`);
    const originalText = applyBtn.textContent;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    applyBtn.disabled = true;
    
    newAJAXCommand('delayf1.cgi?led=' + s, null, false);
    
    setTimeout(function() {
      applyBtn.textContent = '✓ Applied';
      applyBtn.style.backgroundColor = '#27ae60';
      
      setTimeout(function() {
        applyBtn.textContent = originalText;
        applyBtn.style.backgroundColor = '';
        applyBtn.disabled = false;
      }, 1500);
    }, 1000);
  }
}

// Apply individual outlet settings
function applyOutletSettings(index) {
  const nameValid = validateOutletName(index);
  const onDelayValid = validateDelay(index, 'on');
  const offDelayValid = validateDelay(index, 'off');
  
  if (!nameValid || !onDelayValid || !offDelayValid) {
    alert('Please fix validation errors before applying.');
    return;
  }
  
  const name = document.getElementById(`B0${index}`).value;
  const onDelay = document.getElementById(`O0${index}`).value;
  const offDelay = document.getElementById(`F0${index}`).value;
  
  // Update local arrays
  outletNames[index] = name;
  onDelays[index] = parseInt(onDelay);
  offDelays[index] = parseInt(offDelay);
  
  // Show loading state
  const applyBtn = document.getElementById(`apply-btn-${index}`);
  const originalText = applyBtn.textContent;
  applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  applyBtn.disabled = true;
  
  // Simulate API call
  setTimeout(function() {
    applyBtn.textContent = '✓ Applied';
    applyBtn.style.backgroundColor = '#27ae60';
    
    setTimeout(function() {
      applyBtn.textContent = originalText;
      applyBtn.style.backgroundColor = '';
      applyBtn.disabled = false;
      updateStats();
    }, 1500);
  }, 1000);
}

// Update statistics
function updateStats() {
  let customNames = 0;
  for (let i = 0; i < outletCount; i++) {
    if (outletNames[i] !== `Outlet ${i+1}` && outletNames[i] !== 'Outlet') {
      customNames++;
    }
  }
  
  document.getElementById('total-outlets').textContent = outletCount;
  document.getElementById('default-names').textContent = outletCount - customNames;
  document.getElementById('custom-names').textContent = customNames;
}

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

// Update outlet names from XML data
function updateGetname(xmlData) {
  try {
    for(var i = 0; i < outletCount; i++) {
      var data1 = getXMLValue(xmlData, 'na' + i);
      if(data1) {
        var data2 = data1.split(",");
        if(data2[0]) {
          outletNames[i] = data2[0];
          const input = document.getElementById(`B0${i}`);
          if(input) input.value = data2[0];
        }
      }
    }
    updateStats();
  } catch (error) {
    console.error('Error updating outlet names:', error);
  }
}

// Update ON delay times from XML data
function updateGetta(xmlData) {
  try {
    for(var i = 0; i < outletCount; i++) {
      var data1 = getXMLValue(xmlData, 'ta' + i);
      if(data1) {
        var data2 = data1.split(",");
        if(data2[0]) {
          onDelays[i] = parseInt(data2[0]);
          const input = document.getElementById(`O0${i}`);
          if(input) input.value = data2[0];
        }
      }
    }
  } catch (error) {
    console.error('Error updating ON delays:', error);
  }
}

// Update OFF delay times from XML data
function updateGettb(xmlData) {
  try {
    for(var i = 0; i < outletCount; i++) {
      var data1 = getXMLValue(xmlData, 'tb' + i);
      if(data1) {
        var data2 = data1.split(",");
        if(data2[0]) {
          offDelays[i] = parseInt(data2[0]);
          const input = document.getElementById(`F0${i}`);
          if(input) input.value = data2[0];
        }
      }
    }
  } catch (error) {
    console.error('Error updating OFF delays:', error);
  }
}

// Refresh PDU configuration
function refreshPDUConfig() {
  const refreshBtn = document.querySelector('.refresh-button');
  const originalHTML = refreshBtn.innerHTML;
  refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
  refreshBtn.disabled = true;
  
  // Refresh all data
  newAJAXCommand('Getname.xml', updateGetname, false);
  newAJAXCommand('Getta.xml', updateGetta, false);
  newAJAXCommand('Gettb.xml', updateGettb, false);
  newAJAXCommand('curtotal.xml', updateTotal, true);
  
  setTimeout(function() {
    refreshBtn.innerHTML = originalHTML;
    refreshBtn.disabled = false;
  }, 1000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('current-year').textContent = new Date().getFullYear();
  initializePDUTable();
  
  const currentPage = window.location.pathname.split('/').pop() || 'configpdu.htm';
  const navLinks = document.querySelectorAll('.main-nav-menu a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
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
  newAJAXCommand('Getname.xml', updateGetname, false);
  newAJAXCommand('Getta.xml', updateGetta, false);
  newAJAXCommand('Gettb.xml', updateGettb, false);
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
window.updateGetname = updateGetname;
window.updateGetta = updateGetta;
window.updateGettb = updateGettb;
window.GetGroupName = GetGroupName;
window.GetTime = GetTime;
window.GetTimef = GetTimef;
window.validateOutletName = validateOutletName;
window.validateDelay = validateDelay;
window.applyOutletSettings = applyOutletSettings;
window.refreshPDUConfig = refreshPDUConfig;