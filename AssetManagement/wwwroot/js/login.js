$(function () {
    function toggleForms() {
        const loginForm = document.getElementById('loginForm');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const loginTitle = document.getElementById('loginTitle');
        const forgotPasswordTitle = document.getElementById('forgotPasswordTitle');

        if (loginForm.style.display === 'none') {
            loginForm.style.display = 'block';
            forgotPasswordForm.style.display = 'none';
            loginTitle.style.display = 'block';
            forgotPasswordTitle.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            forgotPasswordForm.style.display = 'block';
            loginTitle.style.display = 'none';
            forgotPasswordTitle.style.display = 'block';
        }
    }

    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        grecaptcha.ready(function () {
            const formData = new FormData(e.target);
            var recaptchaResponse = $('#g-recaptcha-response').val();
            formData.append('recaptchaResponse', recaptchaResponse);

            fetch('@Url.Action("LoginPage", "Home")', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Login Successful',
                            showConfirmButton: false,
                            timer: 1500
                        }).then(() => {
                            window.location.href = '@Url.Action("Dashboard", "Home")';

                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: data.message
                        });
                        grecaptcha.reset();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'An unexpected error occurred. Please try again later.'
                    });
                });

        });
    });

    document.getElementById('forgotPasswordForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');

        document.getElementById('overlay').style.display = 'block';
        document.getElementById('loader-forgot-password').style.display = 'block';

        $.ajax({
            url: '/Home/ForgotPassword?email=' + email,
            type: 'POST',
            success: function (response) {
                document.getElementById('loader-forgot-password').style.display = 'none';
                document.getElementById('overlay').style.display = 'none';

                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Password Email Sent',
                        text: 'Please check your email for further instructions.'
                    }).then(() => {
                        window.location.href = '@Url.Action("LoginPage", "Home")';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: response.message
                    });
                }
            },
            error: function (error) {
                document.getElementById('loader-forgot-password').style.display = 'none';
                document.getElementById('overlay').style.display = 'none';
                console.log(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An unexpected error occurred. Please try again later.'
                });
            }
        });
    });

    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('passwordInput');

    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    });
})

