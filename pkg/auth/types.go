package auth

type EmailAndPassword struct {
	Email    string `json:"email"`
	Password []byte `json:"password"`
}

type emailAndPasswordRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type verifyJWTRequest struct {
	Token string `json:"token"`
}
