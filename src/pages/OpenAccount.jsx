import React, { useState } from 'react';

export default function OpenAccount() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    // Demo only: do not actually send data anywhere
    setSubmitted(true);
  };

  return (
    <section className="auth-form">
      <h1>Open an Account</h1>
      <p>
        Create a new checking or savings account. Your sensitive details are protected and will not be sent for translation.
      </p>
      {!submitted ? (
        <form onSubmit={onSubmit}>
          <label>
            Full Name:
            <input className="p-mask" type="text" name="fullName" autoComplete="name" required />
          </label>
          <label>
            Email:
            <input className="p-mask" type="email" name="email" autoComplete="email" required />
          </label>
          <label>
            Phone:
            <input className="p-mask" type="tel" name="phone" autoComplete="tel" required />
          </label>
          <label>
            SSN/Tax ID:
            <input className="p-mask" type="password" name="ssn" autoComplete="off" inputMode="numeric" />
          </label>
          <label>
            Street Address:
            <input className="p-mask" type="text" name="address" autoComplete="street-address" />
          </label>
          <button type="submit">Submit Application</button>
        </form>
      ) : (
        <div>
          <h2>Application submitted</h2>
          <p>We received your information. A banker will contact you shortly.</p>
        </div>
      )}
    </section>
  );
}

