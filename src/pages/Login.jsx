import React from 'react';

export default function Login() {
  return (
    <section className="auth-form">
      <h1>Login</h1>
      <p>Sign in to manage your Wells Fargo accounts and explore wealth management products.</p>
      <form>
        <label>
          Username:
          <input type="text" name="username" />
        </label>
        <label>
          Password:
          <input type="password" name="password" />
        </label>
        <button type="submit">Sign In</button>
      </form>
    </section>
  );
}
