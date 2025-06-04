import { authAPI } from "@/lib/api";

const userData = {
  email: "user@example.org",
  password: "secretpassword",
  password_confirm: "secretpassword",
  first_name: "Test",
  last_name: "User"
}

test("Register user", async () => {
  const res = await authAPI.register(userData);
  expect(res).toEqual({
    message: 'User registered successfully. Please check your email to verify your account.',
    user_id: 1,
    email_sent: true
  })
})