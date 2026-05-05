//src/pages/SignUp.jsx

function SignUp() {
    
    return (
        <div>
            <h1>Sign Up</h1>
            <form action="/api/signup" method="POST">
                <label htmlFor="email-input">Email</label>
                <input
                    autoComplete="email"
                    id="email-input"
                    type="email"
                    name="userEmail"
                />
                <label htmlFor="password-input">Password</label>
                <input
                    autoComplete="new-password"
                    id="password-input"
                    minLength={8}

                    type="password"
                    name="userPassword"
                />
                <div id="password-hint">
                    <p>Password must be at least 8 characters long.</p>
                </div>
                <button>Sign Up</button>
                <p>Already have an account? <a href="/signin">Sign In</a></p>
                <p>By signing up, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
            </form>
        </div>
    );
}

export default SignUp;