import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

/**
 * Extracts and displays the most relevant error message from a backend API response.
 * Handles both generic messages and Express Validator / Zod error arrays safely.
 */
export const showApiError = (err: any, defaultMessage = "Something went wrong") => {
  if (err.response?.data?.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
    const firstError = err.response.data.errors[0];
    Toast.fire({ icon: 'error', title: firstError.message || firstError.msg || defaultMessage });
    return;
  }
  
  if (err.response?.data?.message) {
    Toast.fire({ icon: 'error', title: err.response.data.message });
    return;
  }
  
  Toast.fire({ icon: 'error', title: err.message || defaultMessage });
};

export const showSuccessMessage = (message: string) => {
  Toast.fire({ icon: 'success', title: message });
};
