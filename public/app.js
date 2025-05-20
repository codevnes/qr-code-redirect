// DOM Elements
const qrForm = document.getElementById('qr-form');
const titleInput = document.getElementById('title');
const destinationUrlInput = document.getElementById('destination-url');
const useLogoInput = document.getElementById('use-logo');
const qrColorInput = document.getElementById('qr-color');
const bgColorInput = document.getElementById('bg-color');
const logoMarginInput = document.getElementById('logo-margin');
const logoBgColorInput = document.getElementById('logo-bg-color');
const qrStyleSelect = document.getElementById('qr-style');
const qrCodeContainer = document.getElementById('qr-code-container');
const qrCodeImage = document.getElementById('qr-code-image');
const redirectUrl = document.getElementById('redirect-url');
const downloadBtn = document.getElementById('download-btn');
const copyUrlBtn = document.getElementById('copy-url-btn');
const qrCodesContainer = document.getElementById('qr-codes-container');
const loadingIndicator = document.getElementById('loading-indicator');
const selectAllCheckbox = document.getElementById('select-all');
const deleteSelectedBtn = document.getElementById('delete-selected-btn');
const logoutBtn = document.getElementById('logout-btn');
const loggedInUserSpan = document.querySelector('.navbar-text > strong');

// Modal Elements
const editModal = new bootstrap.Modal(document.getElementById('edit-modal'));
const editIdInput = document.getElementById('edit-id');
const editTitleInput = document.getElementById('edit-title');
const editDestinationUrlInput = document.getElementById('edit-destination-url');
const editActiveInput = document.getElementById('edit-active');
const editUseLogoInput = document.getElementById('edit-use-logo');
const editQrColorInput = document.getElementById('edit-qr-color');
const editBgColorInput = document.getElementById('edit-bg-color');
const editLogoBgColorInput = document.getElementById('edit-logo-bg-color');
const editLogoMarginInput = document.getElementById('edit-logo-margin');
const editQrStyleSelect = document.getElementById('edit-qr-style');
const saveBtn = document.getElementById('save-btn');
const deleteBtn = document.getElementById('delete-btn');

// Đổi Mật Khẩu Elements
const changePasswordModal = new bootstrap.Modal(document.getElementById('change-password-modal'));
const changePasswordForm = document.getElementById('change-password-form');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const savePasswordBtn = document.getElementById('save-password-btn');
const passwordErrorMessage = document.getElementById('password-error-message');

// API Base URL
const API_BASE_URL = '/api/qr';
const AUTH_API_BASE_URL = '/api/auth';

// Admin credentials (hardcoded for demo)
const USERNAME = 'admin';
const PASSWORD = 'admin123';
const AUTH_TOKEN = `Basic ${btoa(`${USERNAME}:${PASSWORD}`)}`;

// Selected QR codes for bulk actions
let selectedQRCodes = [];

// Helper function for authenticated fetch
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('Không tìm thấy authToken trong localStorage.');
    // window.location.href = '/login.html'; // Bỏ comment nếu muốn client tự chuyển hướng
    // return; // Hoặc throw lỗi để dừng thực thi
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    showAlert('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.', 'danger');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
    throw new Error('Unauthorized');
  }
  return response;
};

// Fetch all QR codes and display them
const fetchAndDisplayQRCodes = async () => {
  try {
    loadingIndicator.classList.remove('d-none');
    
    const response = await authFetch(API_BASE_URL);
    const result = await response.json();
    
    if (result.success) {
      qrCodesContainer.innerHTML = '';
      selectedQRCodes = [];
      updateDeleteSelectedButton();
      
      if (result.data.length === 0) {
        qrCodesContainer.innerHTML = `
          <div class="col-12 text-center">
            <p class="text-muted">Không tìm thấy mã QR nào. Hãy tạo mã đầu tiên của bạn!</p>
          </div>
        `;
      } else {
        result.data.forEach(qr => {
          const card = createQRCard(qr);
          qrCodesContainer.appendChild(card);
        });
      }
    } else {
      showAlert(result.message || 'Không thể tải danh sách mã QR', 'danger');
    }
  } catch (error) {
    console.error('Lỗi khi tải mã QR:', error);
    if (error.message !== 'Unauthorized') {
        showAlert('Không thể tải danh sách mã QR. Vui lòng thử lại.', 'danger');
    }
  } finally {
    loadingIndicator.classList.add('d-none');
  }
};

// Create QR code card element
const createQRCard = (qr) => {
  const col = document.createElement('div');
  col.className = 'col-md-4 col-sm-6';
  
  const statusBadge = qr.active 
    ? '<span class="badge bg-success">Hoạt động</span>'
    : '<span class="badge bg-danger">Không hoạt động</span>';
  
  const formattedDate = new Date(qr.createdAt).toLocaleDateString('vi-VN');
  const lastVisited = qr.lastVisited 
    ? new Date(qr.lastVisited).toLocaleString('vi-VN') 
    : 'Chưa có';
  
  col.innerHTML = `
    <div class="card qr-card h-100">
      <div class="card-header">
        <div class="form-check">
          <input class="form-check-input qr-select" type="checkbox" value="${qr._id}" id="qr-check-${qr._id}">
          <label class="form-check-label" for="qr-check-${qr._id}">
            ${qr.title} ${statusBadge}
          </label>
        </div>
      </div>
      <div class="card-body text-center">
        <img src="${qr.qrCodeImage}" class="my-3 qr-code-preview-in-card" alt="${qr.title}" style="max-width: 150px; height: auto;">
        <p class="card-text text-truncate">
          <small>Chuyển đến: <a href="${qr.destinationUrl}" target="_blank">${qr.destinationUrl}</a></small>
        </p>
        <div class="qr-stats d-flex justify-content-between mb-3">
          <div>Lượt truy cập: ${qr.visits}</div>
          <div>Tạo lúc: ${formattedDate}</div>
        </div>
        <div class="d-grid">
          <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${qr._id}">
            <i class="bi bi-pencil-square"></i> Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add event listener to edit button
  col.querySelector('.edit-btn').addEventListener('click', () => {
    openEditModal(qr);
  });

  // Add event listener to checkbox
  const checkbox = col.querySelector('.qr-select');
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      selectedQRCodes.push(qr._id);
    } else {
      selectedQRCodes = selectedQRCodes.filter(id => id !== qr._id);
    }
    updateDeleteSelectedButton();
  });
  
  return col;
};

// Update delete selected button visibility
const updateDeleteSelectedButton = () => {
  if (selectedQRCodes.length > 0) {
    deleteSelectedBtn.classList.remove('d-none');
    deleteSelectedBtn.textContent = `Xóa (${selectedQRCodes.length}) mục đã chọn`;
  } else {
    deleteSelectedBtn.classList.add('d-none');
  }
};

// Handle select all checkbox
selectAllCheckbox.addEventListener('change', () => {
  const checkboxes = document.querySelectorAll('.qr-select');
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
    
    const id = checkbox.value;
    if (selectAllCheckbox.checked && !selectedQRCodes.includes(id)) {
      selectedQRCodes.push(id);
    }
  });
  
  if (!selectAllCheckbox.checked) {
    selectedQRCodes = [];
  }
  
  updateDeleteSelectedButton();
});

// Handle delete selected
deleteSelectedBtn.addEventListener('click', async () => {
  if (selectedQRCodes.length === 0) return;
  
  if (confirm(`Bạn có chắc chắn muốn xóa ${selectedQRCodes.length} mã QR đã chọn không? Hành động này không thể hoàn tác.`)) {
    try {
      const response = await authFetch(`${API_BASE_URL}/delete-multiple`, {
        method: 'POST',
        body: JSON.stringify({ ids: selectedQRCodes }),
      });

      const result = await response.json();

      if (result.success) {
        showAlert(`Đã xóa thành công ${result.deletedCount} mã QR.`, 'success');
        fetchAndDisplayQRCodes();
        selectAllCheckbox.checked = false;
      } else {
        showAlert(result.message || 'Không thể xóa các mã QR đã chọn.', 'danger');
      }
    } catch (error) {
      console.error('Lỗi khi xóa nhiều mã QR:', error);
      if (error.message !== 'Unauthorized') {
        showAlert('Đã xảy ra lỗi khi xóa các mã QR.', 'danger');
      }
    }
  }
});

// Create a new QR code
qrForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = titleInput.value.trim();
  const destinationUrl = destinationUrlInput.value.trim();
  const logo = useLogoInput.checked;
  const color = qrColorInput.value;
  const backgroundColor = bgColorInput.value;
  const logoMargin = parseInt(logoMarginInput.value);
  const logoBackgroundColor = logoBgColorInput.value;
  const dotStyle = qrStyleSelect.value;
  
  if (!title || !destinationUrl) {
    showAlert('Vui lòng điền đầy đủ các trường bắt buộc.', 'warning');
    return;
  }
  
  try {
    const response = await authFetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        destinationUrl,
        customQrOptions: {
          logo,
          color,
          backgroundColor,
          logoMargin,
          logoBackgroundColor,
          dotStyle
        }
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('Đã tạo mã QR thành công!', 'success');
      
      // Display the generated QR code
      qrCodeImage.src = result.data.qrCodeImage;
      redirectUrl.href = result.data.redirectUrl;
      redirectUrl.textContent = result.data.redirectUrl;
      qrCodeContainer.classList.remove('d-none');
      
      // Set up download button
      downloadBtn.onclick = () => {
        window.location.href = `${API_BASE_URL}/${result.data.qrCode._id}/download`;
      };
      
      // Set up copy URL button
      copyUrlBtn.onclick = () => {
        navigator.clipboard.writeText(result.data.redirectUrl)
          .then(() => {
            showAlert('URL copied to clipboard!', 'info', 1500);
          })
          .catch(err => {
            console.error('Failed to copy URL: ', err);
          });
      };
      
      // Refresh QR codes list
      qrForm.reset();
      fetchAndDisplayQRCodes();
    } else {
      showAlert(result.message || 'Không thể tạo mã QR.', 'danger');
    }
  } catch (error) {
    console.error('Lỗi khi tạo mã QR:', error);
    if (error.message !== 'Unauthorized') {
        showAlert('Đã xảy ra lỗi khi tạo mã QR.', 'danger');
    }
  }
});

// Open edit modal
const openEditModal = (qr) => {
  editIdInput.value = qr._id;
  editTitleInput.value = qr.title;
  editDestinationUrlInput.value = qr.destinationUrl;
  editActiveInput.checked = qr.active;
  editUseLogoInput.checked = qr.customQrOptions?.logo || false;
  editQrColorInput.value = qr.customQrOptions?.color || '#000000';
  editBgColorInput.value = qr.customQrOptions?.backgroundColor || '#FFFFFF';
  editLogoBgColorInput.value = qr.customQrOptions?.logoBackgroundColor || '#FFFFFF';
  editLogoMarginInput.value = qr.customQrOptions?.logoMargin || 5;
  editQrStyleSelect.value = qr.customQrOptions?.dotStyle || 'square';
  
  editModal.show();
};

// Save QR code changes
saveBtn.addEventListener('click', async () => {
  const id = editIdInput.value;
  const title = editTitleInput.value.trim();
  const destinationUrl = editDestinationUrlInput.value.trim();
  const active = editActiveInput.checked;
  const logo = editUseLogoInput.checked;
  const color = editQrColorInput.value;
  const backgroundColor = editBgColorInput.value;
  const logoBackgroundColor = editLogoBgColorInput.value;
  const logoMargin = parseInt(editLogoMarginInput.value);
  const dotStyle = editQrStyleSelect.value;
  
  if (!title || !destinationUrl) {
    showAlert('Tiêu đề và URL Đích là bắt buộc.', 'warning');
    return;
  }
  
  try {
    const response = await authFetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        destinationUrl,
        active,
        customQrOptions: {
          logo,
          color,
          backgroundColor,
          logoBackgroundColor,
          logoMargin,
          dotStyle
        }
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('Đã cập nhật mã QR thành công!', 'success');
      editModal.hide();
      fetchAndDisplayQRCodes();
    } else {
      showAlert(result.message || 'Không thể cập nhật mã QR.', 'danger');
    }
  } catch (error) {
    console.error('Lỗi cập nhật mã QR:', error);
    if (error.message !== 'Unauthorized') {
        showAlert('Đã xảy ra lỗi khi cập nhật mã QR.', 'danger');
    }
  }
});

// Delete QR code
deleteBtn.addEventListener('click', async () => {
  const id = editIdInput.value;
  
  if (confirm('Bạn có chắc chắn muốn xóa mã QR này không?')) {
    try {
      const response = await authFetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        showAlert('Đã xóa mã QR thành công!', 'success');
        editModal.hide();
        fetchAndDisplayQRCodes();
      } else {
        showAlert(result.message || 'Không thể xóa mã QR.', 'danger');
      }
    } catch (error) {
      console.error('Lỗi xóa mã QR:', error);
      if (error.message !== 'Unauthorized') {
        showAlert('Đã xảy ra lỗi khi xóa mã QR.', 'danger');
      }
    }
  }
});

// Helper function to show alerts
const showAlert = (message, type = 'success', duration = 3000) => {
  const alertContainer = document.createElement('div');
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show fixed-top m-3" role="alert" style="z-index: 2000;">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Đóng"></button>
    </div>
  `;
  
  document.body.appendChild(alertContainer);
  
  setTimeout(() => {
    alertContainer.classList.remove('show');
    setTimeout(() => alertContainer.remove(), 300);
  }, duration);

  // Hiển thị tên người dùng đã đăng nhập
  const displayUsername = localStorage.getItem('username');
  if (loggedInUserSpan && displayUsername) {
    loggedInUserSpan.textContent = displayUsername;
  }

  // Kiểm tra token khi tải trang
  const token = localStorage.getItem('authToken');
  if (!token) {
    // Nếu không có token ở client, có thể server đã chuyển hướng
    // Hoặc nếu muốn client tự chuyển hướng ngay:
    window.location.href = '/login.html';
  } else {
    // Nếu có token, tải dữ liệu QR codes
    fetchAndDisplayQRCodes();
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchAndDisplayQRCodes();
});

// Xử lý đăng xuất
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    showAlert('Bạn đã đăng xuất thành công.', 'info');
    window.location.href = '/login.html';
  });
}

// Xử lý mở modal đổi mật khẩu (cần thêm nút/link để gọi)
// Ví dụ: document.getElementById('open-change-password-modal-btn').addEventListener('click', () => changePasswordModal.show());

// Xử lý form đổi mật khẩu
if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    passwordErrorMessage.classList.add('d-none');

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      passwordErrorMessage.textContent = 'Vui lòng điền đầy đủ các trường.';
      passwordErrorMessage.classList.remove('d-none');
      return;
    }

    if (newPassword !== confirmPassword) {
      passwordErrorMessage.textContent = 'Mật khẩu mới và xác nhận mật khẩu không khớp.';
      passwordErrorMessage.classList.remove('d-none');
      return;
    }
    if (newPassword.length < 6) {
        passwordErrorMessage.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
        passwordErrorMessage.classList.remove('d-none');
        return;
    }

    try {
      const response = await authFetch(`${AUTH_API_BASE_URL}/change-password`, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();

      if (result.success) {
        showAlert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới nếu được yêu cầu.', 'success');
        changePasswordModal.hide();
        changePasswordForm.reset();
        // Tùy chọn: Đăng xuất người dùng để họ đăng nhập lại với mật khẩu mới
        // localStorage.removeItem('authToken');
        // localStorage.removeItem('username');
        // window.location.href = '/login.html';
      } else {
        passwordErrorMessage.textContent = result.message || 'Không thể đổi mật khẩu.';
        passwordErrorMessage.classList.remove('d-none');
      }
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      if (error.message !== 'Unauthorized') {
        passwordErrorMessage.textContent = 'Đã xảy ra lỗi. Vui lòng thử lại.';
        passwordErrorMessage.classList.remove('d-none');
      }
    }
  });
} 