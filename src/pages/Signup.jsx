import React from 'react';

export default function Signup() {
  return (
    <section className="auth-form">
      <h1>Sign Up</h1>
      <p>Create a Wells Fargo profile to access our full suite of banking and wealth management services.</p>
      <form>
        <label>
          Name:
          <input type="text" name="name" />
        </label>
        <label>
          Email:
          <input type="email" name="email" />
        </label>
        <label>
          Password:
          <input type="password" name="password" />
        </label>
        <button type="submit">Create Account</button>
      </form>
    </section>
  );
}
