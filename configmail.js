// Global variables
var timer;
var timer1;

var ca = new Array('C0','C1','C2','C3','C4','C5','C6','C7','C8','C9');

var ea = new Array('eserver.cgi?led=','efm.cgi?led=','eto.cgi?led=','email6.cgi?led=');
var ee = new Array('eserver','efm','eto');//,'email3','email4','email5');

var ta = new Array('T0','T1','T5');
var cnwota = new Array('Normal','Warning!','Overloading!!','Trap','N/A','Fault');

// Status categories for display
const statusCategories = {
  0: { text: 'Normal', class: 'status-normal' },
  1: { text: 'Warning!', class: 'status-warning' },
  2: { text: 'Overloading!!', class: 'status-overload' },
  3: { text: 'Trap', class: 'status-trap' },
  4: { text: 'N/A', class: 'status-na' },
  5: { text: 'Fault', class: 'status-fault' }
};

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

// Submit email settings
function Getemail() {
  var s0 = '';
  var s1 = document.getElementById('T0').value;
  var s2 = document.getElementById('T1').value;
  var s3 = document.getElementById('T5').value;
  
  s0 += ea[0] + document.getElementById('T0').value + ','
    +  document.getElementById('T1').value + ','
    +  document.getElementById('T5').value + ',';
  
  // Validate input lengths
  if(s1.length > 28 || s2.length > 28 || s3.length > 39) {
    alert("Length oversize - Maximum lengths: Server (28), Sender (28), Recipient (39)");
    return;
  }
  
  // Show loading state
  const applyBtn = document.querySelector('.btn-primary');
  const originalHTML = applyBtn.innerHTML;
  applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
  applyBtn.disabled = true;
  
  // Clear form values temporarily
  document.getElementById('T0').value = '';
  document.getElementById('T1').value = '';
  document.getElementById('T5').value = '';

  newAJAXCommand(s0, null, false); 

  // Update current settings display
  document.getElementById('current-server').textContent = s1 || 'Not configured';
  document.getElementById('current-sender').textContent = s2 || 'Not configured';
  document.getElementById('current-recipient').textContent = s3 || 'Not configured';

  timer1 = setTimeout("MyShow()", 3000);
  
  // Restore button after delay
  setTimeout(function() {
    applyBtn.innerHTML = originalHTML;
    applyBtn.disabled = false;
  }, 3000);
}

function MyShow() {
  clearTimeout(timer1);
  timer = window.setInterval("CallAgain()", 5000);
}

function CallAgain() {
  newAJAXCommand('Getemail.xml', 'Getemail', false)
  window.clearInterval(timer);
}

// Update email settings from XML data
function updateGetemail(xmlData) {
  var i, j;
  var data1;   

  for(i = 0; i < 3; i++) {
    data1 = getXMLValue(xmlData, ee[i]);
    if(data1 == null)
      data1 = '';
    document.getElementById(ta[i]).value = data1;
    
    // Update current settings display
    switch(ta[i]) {
      case 'T0':
        document.getElementById('current-server').textContent = data1 || 'Not configured';
        break;
      case 'T1':
        document.getElementById('current-sender').textContent = data1 || 'Not configured';
        break;
      case 'T5':
        document.getElementById('current-recipient').textContent = data1 || 'Not configured';
        break;
    }
  }
}

// Reset form
function resetForm() {
  document.getElementById('T0').value = '';
  document.getElementById('T1').value = '';
  document.getElementById('T5').value = '';
  
  if (confirm('Reset all email settings to empty values?')) {
    // Optional: Reset current settings display too
    // newAJAXCommand('eserver.cgi?led=,,,', null, false);
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Highlight current page in main navigation
  const currentPage = window.location.pathname.split('/').pop() || 'configmail.htm';
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
  
  // Initialize form with current settings
  setTimeout("newAJAXCommand('Getemail.xml', updateGetemail, false)", 500);
  
  // Start periodic updates for total load
  setTimeout("newAJAXCommand('curtotal.xml', updateTotal, true)", 1000);
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
window.updateGetemail = updateGetemail;
window.Getemail = Getemail;
window.MyShow = MyShow;
window.CallAgain = CallAgain;
window.resetForm = resetForm;

// Disable authentication fields (as per original code)
function configIPBoxes() {
  // This function name is kept for compatibility, but it's not used for mail settings
  // In the original code, it disabled authentication fields
  if (document.mail && document.mail.sel) {
    document.mail.sel.disabled = true;
    document.mail.user.disabled = true;
    document.mail.pass.disabled = true;
  }
}