const authModel = require("../models/auth-model");
const bcrypt = require("bcrypt");

exports.showLoginPage = (req, res) => {
  res.render("auth/index", { title: "Login", error: null });
};

exports.getLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authModel.getUserByEmail(email);

    if (user) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        req.session.user = {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
        };

        return res.redirect("/dashboard");
      }
    }

    res.render("auth/index", {
      title: "Login",
      error: "Invalid email or password",
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.render("auth/index", {
      title: "Login",
      error: "An error occurred. Please try again later.",
    });
  }
};

exports.getLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.redirect("/login");
  });
};
