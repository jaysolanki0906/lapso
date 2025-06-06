import Swal from 'sweetalert2';

export function showOtpVerifySwal(email: string, resendSeconds: number = 300): Promise<string | null> {
  // Helper to format mm:ss
  function formatTime(seconds: number): string {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  let timerInterval: any;
  let resendText = `Resend in <b>${formatTime(resendSeconds)}</b>`;

  return Swal.fire({
    title: 'OTP Verify',
    html: `
      <div style="margin-bottom:12px;">OTP sent to <b>${email}</b>.</div>
      <div style="margin-bottom:10px;">Enter OTP <span style="color:red">*</span></div>
      <div id="otp-container" style="display:flex; gap:10px; justify-content:center; margin-bottom:10px;">
        <input type="text" maxlength="1" style="width:40px; height:40px; text-align:center; font-size:22px;" class="otp-input" autofocus>
        <input type="text" maxlength="1" style="width:40px; height:40px; text-align:center; font-size:22px;" class="otp-input">
        <input type="text" maxlength="1" style="width:40px; height:40px; text-align:center; font-size:22px;" class="otp-input">
        <input type="text" maxlength="1" style="width:40px; height:40px; text-align:center; font-size:22px;" class="otp-input">
        <input type="text" maxlength="1" style="width:40px; height:40px; text-align:center; font-size:22px;" class="otp-input">
        <input type="text" maxlength="1" style="width:40px; height:40px; text-align:center; font-size:22px;" class="otp-input">
      </div>
      <div style="margin-bottom:18px;"><span id="resend-timer">${resendText}</span></div>
    `,
    showCancelButton: false,
    showCloseButton: true,
    confirmButtonText: 'Submit',
    confirmButtonColor: '#ff384a',
    customClass: {
      confirmButton: 'swal2-confirm-otp'
    },
    didOpen: () => {
      const inputs = Array.from(document.querySelectorAll('.otp-input')) as HTMLInputElement[];
      inputs[0].focus();
      // Move focus to next input
      inputs.forEach((input, idx) => {
        input.addEventListener('input', () => {
          if (input.value.length === 1 && idx < inputs.length - 1) {
            inputs[idx + 1].focus();
          }
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !input.value && idx > 0) {
            inputs[idx - 1].focus();
          }
        });
      });
      timerInterval = setInterval(() => {
        resendSeconds--;
        const timerEl = document.getElementById('resend-timer');
        if (timerEl) {
          timerEl.innerHTML = resendSeconds > 0
            ? `Resend in <b>${formatTime(resendSeconds)}</b>`
            : `<a href="#" id="resend-link">Resend</a>`;
        }
        if (resendSeconds === 0 && timerInterval) {
          clearInterval(timerInterval);
          const resendLink = document.getElementById('resend-link');
          if (resendLink) {
            resendLink.addEventListener('click', (e) => {
              e.preventDefault();
              Swal.close();
            });
          }
        }
      }, 1000);
    },
    preConfirm: () => {
      const inputs = Array.from(document.querySelectorAll('.otp-input')) as HTMLInputElement[];
      const otp = inputs.map(i => i.value).join('');
      if (otp.length !== 6) {
        Swal.showValidationMessage('Please enter the 6-digit OTP.');
        return null;
      }
      return otp;
    },
    willClose: () => {
      if (timerInterval) clearInterval(timerInterval);
    }
  }).then(result => {
    if (result.isConfirmed && result.value) {
      return result.value as string;
    }
    return null;
  });
}