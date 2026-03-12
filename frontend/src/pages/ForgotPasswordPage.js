import React, { useState } from "react";
import "./ForgotPasswordPage.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true); // Bắt đầu tải

    try {
      const response = await fetch(
        `http://localhost:5000/api/forgotPassword?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setLoading(false); // Dừng tải

      if (response.ok) {
        setMessage(
          "A password reset link has been sent to your email. Please check your inbox."
        );
      } else {
        setError(data.message || "Unable to process your request.");
      }
    } catch (err) {
      setLoading(false); // Dừng tải
      setError("An error occurred while connecting to the server.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Enter your email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ForgotPasswordPage;
